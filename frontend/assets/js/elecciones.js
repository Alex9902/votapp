document.addEventListener("DOMContentLoaded", async () => {
    const parametrosURL = new URLSearchParams(window.location.search);
    let idRol = parametrosURL.get('rolId');
    let nombreRol = parametrosURL.get('rolNombre');

    //fallback
    if (!idRol) {
        idRol = sessionStorage.getItem('rolIdActivo');
        nombreRol = sessionStorage.getItem('rolNombreActivo');
    } else {
        sessionStorage.setItem('rolIdActivo', idRol);
        sessionStorage.setItem('rolNombreActivo', nombreRol || 'Rol Seleccionado');
    }

    const subtitulo = document.getElementById("subtitulo-rol");
    const contenedor = document.getElementById("elecciones-contenedor");

    // Si no hay idRol ni en URL ni en sessionStorage, intentamos recuperar el rol si el usuario solo tiene uno
    if (!idRol) {
        try {
            const respuestaRoles = await fetch('/api/roles');
            if (respuestaRoles.ok) {
                const datosRoles = await respuestaRoles.json();
                const roles = datosRoles.roles || [];
                if (roles.length === 1) {
                    idRol = roles[0].id_subcategoria;
                    nombreRol = roles[0].nombre_rol;
                    sessionStorage.setItem('rolIdActivo', idRol);
                    sessionStorage.setItem('rolNombreActivo', nombreRol);
                }
            }
        } catch (error) {
            console.error("Error al obtener roles en fallback de elecciones:", error);
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
                            es-anonima="${eleccion.es_anonima}">
                        </app-eleccion>
                    `;
            contenedor.appendChild(columna);
        });

    } catch (error) {
        console.error("Error de conexión:", error);
        contenedor.innerHTML = `<div class="col-12 text-center text-danger fw-bold py-5">Error de conexión con el servidor.</div>`;
    }
});