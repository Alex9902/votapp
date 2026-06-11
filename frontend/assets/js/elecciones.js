document.addEventListener("DOMContentLoaded", async () => {
    const parametrosURL = new URLSearchParams(window.location.search);
    let idRol = parametrosURL.get('rolId');
    let nombreRol = parametrosURL.get('rolNombre');

    const subtitulo = document.getElementById("subtitulo-rol");
    const contenedor = document.getElementById("elecciones-contenedor");

    try {
        const respuestaRoles = await fetch('/api/roles');
        if (respuestaRoles.ok) {
            const datosRoles = await respuestaRoles.json();

            //si es admin forzar a poner roladmin
            if (datosRoles.es_admin) {
                idRol = 'admin';
                nombreRol = 'admin';
                sessionStorage.setItem('rolIdActivo', 'admin');
                sessionStorage.setItem('rolNombreActivo', 'admin');

            } else {
                if (!idRol) {
                    idRol = sessionStorage.getItem('rolIdActivo');
                    nombreRol = sessionStorage.getItem('rolNombreActivo');
                } else {
                    sessionStorage.setItem('rolIdActivo', idRol);
                    sessionStorage.setItem('rolNombreActivo', nombreRol || 'Rol Seleccionado');
                }

                //validar rol
                const roles = datosRoles.roles || [];
                const tieneRol = idRol ? idRol.split(',').every(id => roles.some(r => r.id_subcategoria == id)) : false;

                if (!tieneRol) {
                    idRol = null;
                    nombreRol = null;
                    sessionStorage.removeItem('rolIdActivo');
                    sessionStorage.removeItem('rolNombreActivo');
                }

                if (!idRol) {
                    const esProfesor = roles.some(r => r.nombre_rol.toLowerCase().includes('profesor') || r.nombre_rol.toLowerCase().includes('docent') || r.nombre_rol.toLowerCase().includes('maestr'));
                    const esPadre = roles.some(r => r.nombre_rol.toLowerCase().includes('padre') || r.nombre_rol.toLowerCase().includes('madre') || r.nombre_rol.toLowerCase().includes('familia'));

                    if (esProfesor && esPadre) {
                        const rolesFiltrados = roles.filter(r =>
                            r.nombre_rol.toLowerCase().includes('profesor') || r.nombre_rol.toLowerCase().includes('docent') || r.nombre_rol.toLowerCase().includes('maestr') ||
                            r.nombre_rol.toLowerCase().includes('padre') || r.nombre_rol.toLowerCase().includes('madre') || r.nombre_rol.toLowerCase().includes('familia')
                        );
                        idRol = rolesFiltrados.map(r => r.id_subcategoria).join(',');
                        nombreRol = rolesFiltrados.map(r => r.nombre_rol).join(', ');
                        sessionStorage.setItem('rolIdActivo', idRol);
                        sessionStorage.setItem('rolNombreActivo', nombreRol);
                    } else if (roles.length === 1) {
                        idRol = roles[0].id_subcategoria;
                        nombreRol = roles[0].nombre_rol;
                        sessionStorage.setItem('rolIdActivo', idRol);
                        sessionStorage.setItem('rolNombreActivo', nombreRol);
                    }
                }
            }
        } else {

            //si la llamada falla, hacemos fallback a sessionStorage
            if (!idRol) {
                idRol = sessionStorage.getItem('rolIdActivo');
                nombreRol = sessionStorage.getItem('rolNombreActivo');
            }
        }
    } catch (error) {
        console.error("Error al obtener roles:", error);

        if (!idRol) {
            idRol = sessionStorage.getItem('rolIdActivo');
            nombreRol = sessionStorage.getItem('rolNombreActivo');
        }
    }

    if (!nombreRol) {
        nombreRol = 'Rol Seleccionado';
    }

    if (!idRol) {
        subtitulo.textContent = "Error: No se ha seleccionado ningún rol.";
        contenedor.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <p class="text-danger fw-bold fs-5">Debes elegir un rol de votación primero.</p>
                        <a href="home.html" style="transition:0.2s;" class="btn btn-primary mt-3 px-4 py-2 rounded-3 fw-bold">Ir a Selección de Rol</a>
                    </div>
                `;
        return;
    }

    subtitulo.innerHTML = `Rol Activo: <span class="text-primary fw-bold">${nombreRol}</span>`;

    const esProfesor = nombreRol.toLowerCase().includes('profesor') ||
        nombreRol.toLowerCase().includes('docent') ||
        nombreRol.toLowerCase().includes('maestr');

    if (esProfesor) {
        const accionesProfesor = document.getElementById("profesor-acciones");
        if (accionesProfesor) {
            accionesProfesor.classList.remove("d-none");

            // Inicializar el modal con 2 opciones vacías si no existen
            const contenedorOpcionesProfesor = document.getElementById("lista-inputs-opciones-profesor");
            if (contenedorOpcionesProfesor && contenedorOpcionesProfesor.children.length === 0) {
                window.añadirInputOpcionProfesor();
                window.añadirInputOpcionProfesor();
            }
        }
    }

    try {
        const respuesta = await fetch(`/api/elecciones?rolId=${idRol}`);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            console.error("Error al obtener elecciones:", datos.error);
            contenedor.innerHTML = `<div class="col-12 text-center text-danger fw-bold py-5">Error al cargar las elecciones de la base de datos.</div>`;
            return;
        }

        const elecciones = datos.elecciones || [];

        if (elecciones.length === 0) {
            contenedor.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <div class="mb-4">
                                <span class="material-symbols-outlined text-secondary opacity-50" style="font-size: 5rem;">
                                    verified_user
                                </span>
                            </div>
                            <h3 class="fw-bold text-secondary">¡Estás al día!</h3>
                            <p class="text-muted mt-2">No hay elecciones activas o ya has participado en todas las votaciones vigentes para este rol.</p>
                            <a href="home.html" style="transition:0.2s;" class="btn btn-outline-primary mt-4 px-4 py-2 rounded-3 fw-bold">Volver al Selector de Roles</a>
                        </div>
                    `;
            return;
        }

        contenedor.innerHTML = "";

        elecciones.forEach(eleccion => {
            const columna = document.createElement("div");
            columna.className = "col-12 col-md-6 col-lg-4";

            columna.innerHTML = `
                        <app-eleccion
                            id-votacion="${eleccion.id_votacion}"
                            titulo="${eleccion.titulo}"
                            descripcion="${eleccion.descripcion || ''}"
                            fecha-inicio="${eleccion.fecha_inicio}"
                            fecha-fin="${eleccion.fecha_fin}"
                            tipo-seleccion="${eleccion.tipo_seleccion}"
                            max-selecciones="${eleccion.max_selecciones}"
                            es-anonima="${eleccion.es_anonima}"
                            rol-id="${eleccion.id_subcategoria || ''}"
                            rol-nombre="${eleccion.nombre_rol_votacion || ''}"
                            ya-votado="${eleccion.ya_votado || false}"
                            finalizada="${eleccion.finalizada || false}">
                        </app-eleccion>
                    `;
            contenedor.appendChild(columna);
        });

    } catch (error) {
        console.error("Error de conexión:", error);
        contenedor.innerHTML = `<div class="col-12 text-center text-danger fw-bold py-5">Error de conexión con el servidor.</div>`;
    }
});

window.añadirInputOpcionProfesor = () => {
    const lista = document.getElementById("lista-inputs-opciones-profesor");
    if (!lista) return;

    const html = `
        <div class="input-group input-opcion-item-profesor mb-2">
            <input type="text" class="form-control p-2 text-opcion-val-profesor" placeholder="Nombre de la opción / Candidato" required>
            <button class="btn btn-outline-danger" type="button" onclick="this.closest('.input-opcion-item-profesor').remove()">
                <span class="material-symbols-outlined fs-6 align-middle">close</span>
            </button>
        </div>
    `;
    lista.insertAdjacentHTML('beforeend', html);
};

window.crearVotacionProfesor = async (e) => {
    e.preventDefault();

    const titulo = document.querySelector("#modalVotacionProfesor #vot-titulo").value;
    const descripcion = document.querySelector("#modalVotacionProfesor #vot-descripcion").value;
    const inicio = document.querySelector("#modalVotacionProfesor #vot-inicio").value;
    const fin = document.querySelector("#modalVotacionProfesor #vot-fin").value;
    const tipo = document.querySelector("#modalVotacionProfesor #vot-tipo").value;
    const max = parseInt(document.querySelector("#modalVotacionProfesor #vot-max").value, 10);
    const anonima = document.querySelector("#modalVotacionProfesor #vot-anonima").checked;
    const tiemporeal = document.querySelector("#modalVotacionProfesor #vot-tiemporeal").checked;

    const items = document.querySelectorAll(".text-opcion-val-profesor");
    const opciones = [];

    items.forEach(input => {
        const val = input.value.trim();
        if (val) {
            opciones.push(val);
        }
    });

    if (opciones.length < 2) {
        alert("Debes añadir al menos 2 opciones.");
        return;
    }

    const payload = {
        titulo,
        descripcion,
        fecha_inicio: inicio,
        fecha_fin: fin,
        recuento_tiempo_real: tiemporeal,
        es_anonima: anonima,
        tipo_seleccion: tipo,
        max_selecciones: max,
        opciones
    };

    try {
        const res = await fetch('/api/profesor/votaciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Votación creada con éxito para alumnos");

            const modalEl = document.getElementById('modalVotacionProfesor');
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            if (modal) modal.hide();

            document.getElementById("formulario-votacion-profesor").reset();
            document.getElementById("lista-inputs-opciones-profesor").innerHTML = "";
            window.añadirInputOpcionProfesor();
            window.añadirInputOpcionProfesor();

            location.reload();
        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        console.error("Error al crear votación:", err);
        alert("Error de conexión al crear votación");
    }
};