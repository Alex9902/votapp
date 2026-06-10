let subcategoriasGlobales = [];
let modalUsuarioInstancia;
let modalVotacionInstancia;

document.addEventListener("DOMContentLoaded", async () => {
    modalUsuarioInstancia = new bootstrap.Modal(document.getElementById('modalUsuario'));
    modalVotacionInstancia = new bootstrap.Modal(document.getElementById('modalVotacion'));

    await cargarSubcategorias();
    await cargarUsuarios();
    await cargarVotaciones();
});

async function cargarSubcategorias() {
    try {
        const res = await fetch('/api/admin/subcategorias');
        const datos = await res.json();
        if (res.ok) {
            subcategoriasGlobales = datos.subcategorias || [];

            const contenedorUsr = document.getElementById("usr-roles-checkboxes");
            const contenedorVot = document.getElementById("vot-roles-checkboxes");

            contenedorUsr.innerHTML = "";
            contenedorVot.innerHTML = "";

            subcategoriasGlobales.forEach(sub => {
                const htmlUsr = `
                            <div class="col-6 col-md-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="usr-roles" value="${sub.id_subcategoria}" id="sub-u-${sub.id_subcategoria}">
                                    <label class="form-check-label text-secondary small fw-semibold" for="sub-u-${sub.id_subcategoria}">${sub.nombre_rol}</label>
                                </div>
                            </div>
                        `;
                const htmlVot = `
                            <div class="col-6 col-md-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="vot-roles" value="${sub.id_subcategoria}" id="sub-v-${sub.id_subcategoria}">
                                    <label class="form-check-label text-secondary small fw-semibold" for="sub-v-${sub.id_subcategoria}">${sub.nombre_rol}</label>
                                </div>
                            </div>
                        `;
                contenedorUsr.insertAdjacentHTML('beforeend', htmlUsr);
                contenedorVot.insertAdjacentHTML('beforeend', htmlVot);
            });
        }
    } catch (e) {
        console.error("Error cargando roles", e);
    }
}

async function cargarUsuarios() {
    const cuerpo = document.getElementById("tabla-usuarios-cuerpo");
    cuerpo.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Buscando usuarios registrados...</td></tr>`;

    try {
        const res = await fetch('/api/admin/usuarios');
        const datos = await res.json();

        if (res.ok) {
            const usuarios = datos.usuarios || [];
            cuerpo.innerHTML = "";

            usuarios.forEach(u => {
                const roles = u.subcategoria.map(s => `<span class="badge bg-light text-secondary border border-secondary-subtle px-2 py-1 me-1">${s.nombre_rol}</span>`).join("") || '<span class="text-muted small">Ninguno</span>';
                const esAdminHtml = u.es_admin ? `<span class="badge bg-success px-2 py-1 rounded-pill">Sí</span>` : `<span class="text-muted small">No</span>`;

                const fila = `
                            <tr>
                                <td class="fw-bold text-secondary">${u.nombre_completo}</td>
                                <td><code>${u.dni}</code></td>
                                <td>${roles}</td>
                                <td class="text-center">${esAdminHtml}</td>
                                <td class="text-end">
                                    <div class="d-inline-flex gap-2">
                                        <button class="btn-edit-personalizado" onclick="abrirModalUsuario(${JSON.stringify(u).replace(/"/g, '&quot;')})">
                                            <span class="material-symbols-outlined fs-6">edit</span>
                                        </button>
                                        <button class="btn-danger-personalizado" onclick="eliminarUsuario(${u.id_usuario})">
                                            <span class="material-symbols-outlined fs-6">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                cuerpo.insertAdjacentHTML('beforeend', fila);
            });
        }
    } catch (e) {
        console.error("Error al cargar usuarios", e);
    }
}

async function cargarVotaciones() {
    const cuerpo = document.getElementById("tabla-votaciones-cuerpo");
    const selectorResultados = document.getElementById("seleccion-resultados-votacion");

    cuerpo.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Buscando votaciones en curso...</td></tr>`;
    selectorResultados.innerHTML = `<option value="">-- Selecciona una Votación Activa --</option>`;

    try {
        const res = await fetch('/api/admin/votaciones');
        const datos = await res.json();

        if (res.ok) {
            const votaciones = datos.votaciones || [];
            cuerpo.innerHTML = "";

            votaciones.forEach(v => {
                const roles = v.subcategoria.map(s => `<span class="badge bg-light text-secondary border px-2 py-1 me-1">${s.nombre_rol}</span>`).join("") || 'Todos';
                const fechaIni = new Date(v.fecha_inicio).toLocaleDateString('es-ES', { dateStyle: 'short' });
                const fechaFin = new Date(v.fecha_fin).toLocaleDateString('es-ES', { dateStyle: 'short' });

                const fila = `
                            <tr>
                                <td class="fw-bold" style="color: var(--primario-contenedor);">${v.titulo}</td>
                                <td class="small">${fechaIni} - ${fechaFin}</td>
                                <td>${roles}</td>
                                <td class="text-center">${v.recuento_tiempo_real ? 'Sí' : 'No'}</td>
                                <td class="text-center">${v.es_anonima ? 'Anónima' : 'Identificada'}</td>
                                <td class="text-center text-capitalize small"><span class="badge bg-light text-dark">${v.tipo_seleccion} (${v.max_selecciones})</span></td>
                                <td class="text-end">
                                    <div class="d-inline-flex gap-2">
                                        <button class="btn-edit-personalizado" onclick="abrirModalVotacion(${JSON.stringify(v).replace(/"/g, '&quot;')})">
                                            <span class="material-symbols-outlined fs-6">edit</span>
                                        </button>
                                        <button class="btn-danger-personalizado" onclick="eliminarVotacion(${v.id_votacion})">
                                            <span class="material-symbols-outlined fs-6">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                cuerpo.insertAdjacentHTML('beforeend', fila);

                const opcion = document.createElement("option");
                opcion.value = v.id_votacion;
                opcion.textContent = v.titulo;
                selectorResultados.appendChild(opcion);
            });
        }
    } catch (e) {
        console.error("Error al cargar elecciones", e);
    }
}

// ---------------------------------------------------------------------
// OPERACIONES DE USUARIOS
// ---------------------------------------------------------------------

function abrirModalUsuario(usr = null) {
    const form = document.getElementById("formulario-usuario");
    form.reset();

    // Limpiar checkboxes de roles
    const checks = document.getElementsByName("usr-roles");
    checks.forEach(c => c.checked = false);

    if (usr) {
        document.getElementById("modalUsuarioTitulo").textContent = "Modificar Usuario";
        document.getElementById("usr-id").value = usr.id_usuario;
        document.getElementById("usr-nombre").value = usr.nombre_completo;
        document.getElementById("usr-dni").value = usr.dni;
        document.getElementById("usr-esadmin").checked = !!usr.es_admin;

        // Opcional en edición
        document.getElementById("usr-label-pass").textContent = "Nueva Contraseña (Opcional)";
        document.getElementById("usr-help-pass").textContent = "Deja este campo vacío si no quieres cambiar su contraseña actual.";
        document.getElementById("usr-pass").required = false;

        // Marcar roles correspondientes
        if (usr.subcategoria) {
            usr.subcategoria.forEach(s => {
                const chk = document.getElementById(`sub-u-${s.id_subcategoria}`);
                if (chk) chk.checked = true;
            });
        }
    } else {
        document.getElementById("modalUsuarioTitulo").textContent = "Registrar Usuario";
        document.getElementById("usr-id").value = "";
        document.getElementById("usr-label-pass").textContent = "Contraseña";
        document.getElementById("usr-help-pass").textContent = "Establece la clave de acceso del usuario.";
        document.getElementById("usr-pass").required = true;
    }

    modalUsuarioInstancia.show();
}

async function guardarUsuario(e) {
    e.preventDefault();

    const idUsuario = document.getElementById("usr-id").value;
    const nombre = document.getElementById("usr-nombre").value;
    const dni = document.getElementById("usr-dni").value;
    const pass = document.getElementById("usr-pass").value;
    const esAdmin = document.getElementById("usr-esadmin").checked;

    // Extraer roles seleccionados
    const checks = document.getElementsByName("usr-roles");
    const rolesSeleccionados = [];
    checks.forEach(c => {
        if (c.checked) rolesSeleccionados.push(parseInt(c.value, 10));
    });

    const datos = {
        dni,
        nombre_completo: nombre,
        es_admin: esAdmin,
        roles: rolesSeleccionados
    };
    if (pass) datos.password = pass;

    try {
        const metodo = idUsuario ? 'PUT' : 'POST';
        const url = idUsuario ? `/api/admin/usuarios/${idUsuario}` : '/api/admin/usuarios';

        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await res.json();
        if (res.ok) {
            modalUsuarioInstancia.hide();
            await cargarUsuarios();
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (err) {
        console.error(err);
        alert("Error de conexión");
    }
}

async function eliminarUsuario(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente a este usuario?")) return;

    try {
        const res = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' });
        const resultado = await res.json();

        if (res.ok) {
            await cargarUsuarios();
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (e) {
        console.error(e);
    }
}

//MARK:VOTACIONES

function abrirModalVotacion(vot = null) {
    const form = document.getElementById("formulario-votacion");
    form.reset();

    const checks = document.getElementsByName("vot-roles");
    checks.forEach(c => c.checked = false);

    const listaOpciones = document.getElementById("lista-inputs-opciones");
    listaOpciones.innerHTML = "";
    const contenedorOpciones = document.getElementById("contenedor-opciones-creacion");

    if (vot) {
        document.getElementById("modalVotacionTitulo").textContent = "Modificar Configuración";
        document.getElementById("vot-id").value = vot.id_votacion;
        document.getElementById("vot-titulo").value = vot.titulo;
        document.getElementById("vot-descripcion").value = vot.descripcion || "";

        //fromateador de fechas sacado de gemini
        const aDatetimeLocal = (str) => {
            const d = new Date(str);
            const pad = (num) => String(num).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        document.getElementById("vot-inicio").value = aDatetimeLocal(vot.fecha_inicio);
        document.getElementById("vot-fin").value = aDatetimeLocal(vot.fecha_fin);
        document.getElementById("vot-tipo").value = vot.tipo_seleccion;
        document.getElementById("vot-max").value = vot.max_selecciones;
        document.getElementById("vot-anonima").checked = !!vot.es_anonima;
        document.getElementById("vot-tiemporeal").checked = !!vot.recuento_tiempo_real;

        if (vot.subcategoria) {
            vot.subcategoria.forEach(s => {
                const chk = document.getElementById(`sub-v-${s.id_subcategoria}`);
                if (chk) chk.checked = true;
            });
        }

        // Ocultar sección de creación de opciones (la edición de opciones se gestiona por base de datos o de forma separada)
        contenedorOpciones.classList.add("d-none");
    } else {
        document.getElementById("modalVotacionTitulo").textContent = "Crear Nueva Votación";
        document.getElementById("vot-id").value = "";
        document.getElementById("vot-max").value = "1";
        document.getElementById("vot-tiemporeal").checked = true;
        contenedorOpciones.classList.remove("d-none");

        añadirInputOpcion();
        añadirInputOpcion();
    }

    modalVotacionInstancia.show();
}

function añadirInputOpcion() {
    const lista = document.getElementById("lista-inputs-opciones");

    const selectOptions = subcategoriasGlobales.map(s => `<option value="${s.id_subcategoria}">${s.nombre_rol}</option>`).join("");

    const html = `
                <div class="input-group input-opcion-item">
                    <input type="text" class="form-control p-2 text-opcion-val" placeholder="Nombre de la opción / Candidato" required>
                    <select class="form-select text-opcion-rol" style="max-width: 200px;">
                        ${selectOptions}
                    </select>
                    <button class="btn btn-outline-danger" type="button" onclick="this.closest('.input-opcion-item').remove()">
                        <span class="material-symbols-outlined fs-6 align-middle">close</span>
                    </button>
                </div>
            `;
    lista.insertAdjacentHTML('beforeend', html);
}

async function guardarVotacion(e) {
    e.preventDefault();

    const idVotacion = document.getElementById("vot-id").value;
    const titulo = document.getElementById("vot-titulo").value;
    const descripcion = document.getElementById("vot-descripcion").value;
    const inicio = document.getElementById("vot-inicio").value;
    const fin = document.getElementById("vot-fin").value;
    const tipo = document.getElementById("vot-tipo").value;
    const max = parseInt(document.getElementById("vot-max").value, 10);
    const anonima = document.getElementById("vot-anonima").checked;
    const tiemporeal = document.getElementById("vot-tiemporeal").checked;

    //extrae roles
    const checks = document.getElementsByName("vot-roles");
    const rolesSeleccionados = [];
    checks.forEach(c => {
        if (c.checked) rolesSeleccionados.push(parseInt(c.value, 10));
    });

    if (rolesSeleccionados.length === 0) {
        alert("Debes seleccionar al menos un rol destinatario.");
        return;
    }

    const itemsOpciones = document.querySelectorAll(".input-opcion-item");
    const opcionesModelos = [];

    itemsOpciones.forEach(item => {
        const texto = item.querySelector(".text-opcion-val").value;
        const rolId = parseInt(item.querySelector(".text-opcion-rol").value, 10);

        if (texto) {
            opcionesModelos.push({
                texto_opcion: texto,
                id_subcategoria: rolId
            });
        }
    });

    const datos = {
        titulo,
        descripcion,
        fecha_inicio: new Date(inicio),
        fecha_fin: new Date(fin),
        tipo_seleccion: tipo,
        max_selecciones: max,
        es_anonima: anonima,
        recuento_tiempo_real: tiemporeal,
        roles: rolesSeleccionados
    };

    if (!idVotacion) {
        datos.opciones = opcionesModelos;
    }

    try {
        const metodo = idVotacion ? 'PUT' : 'POST';
        const url = idVotacion ? `/api/admin/votaciones/${idVotacion}` : '/api/admin/votaciones';

        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await res.json();
        if (res.ok) {
            modalVotacionInstancia.hide();
            await cargarVotaciones();
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (err) {
        console.error(err);
        alert("Error de conexión");
    }
}

async function eliminarVotacion(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta votación? Se borrarán sus opciones y sufragios.")) return;

    try {
        const res = await fetch(`/api/admin/votaciones/${id}`, { method: 'DELETE' });
        const resultado = await res.json();

        if (res.ok) {
            await cargarVotaciones();
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (e) {
        console.error(e);
    }
}

//MARK:RESULTADOS

async function cargarResultadosEleccion(idVotacion) {
    const contenedor = document.getElementById("resultados-analisis-contenedor");
    const listaEscrutinio = document.getElementById("lista-escrutinio-opciones");

    if (!idVotacion) {
        contenedor.classList.add("d-none");
        return;
    }

    try {
        const res = await fetch(`/api/admin/votaciones/${idVotacion}/resultados`);
        const datos = await res.json();

        if (res.ok) {
            contenedor.classList.remove("d-none");

            const infoVot = datos.votacion;
            const resultados = datos.resultados || [];

            document.getElementById("res-anonimato").textContent = infoVot.es_anonima ? "Anónima" : "Nominal / Identificada";
            document.getElementById("res-tiemporeal").textContent = infoVot.recuento_tiempo_real ? "Habilitado" : "Deshabilitado (Diferido)";

            listaEscrutinio.innerHTML = "";

            //calculo votos por porcentaje
            const totalVotos = resultados.reduce((acc, curr) => acc + curr.votos, 0);

            if (resultados.length === 0) {
                listaEscrutinio.innerHTML = `<p class="text-muted small">No hay opciones registradas en esta votación.</p>`;
                return;
            }

            resultados.forEach(item => {
                const porcentaje = totalVotos > 0 ? ((item.votos / totalVotos) * 100).toFixed(1) : 0;

                const html = `
                            <div>
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <div>
                                        <strong style="color: var(--primario-contenedor);">${item.texto_opcion}</strong>
                                        <span class="badge bg-light text-secondary ms-2 small border">${item.nombre_rol}</span>
                                    </div>
                                    <span class="small text-secondary">
                                        <strong>${item.votos} votos</strong> (${porcentaje}%)
                                    </span>
                                </div>
                                <div class="progress rounded-pill" style="height: 0.85rem;">
                                    <div class="progress-bar rounded-pill" role="progressbar" style="width: ${porcentaje}%; background-color: var(--primario-contenedor);" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                        `;
                listaEscrutinio.insertAdjacentHTML('beforeend', html);
            });
        }
    } catch (e) {
        console.error(e);
    }
}