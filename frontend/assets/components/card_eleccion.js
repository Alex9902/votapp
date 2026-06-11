class CardEleccionComponent extends HTMLElement {
    connectedCallback() {
        const idVotacion = this.getAttribute('id-votacion');
        const titulo = this.getAttribute('titulo');
        const descripcion = this.getAttribute('descripcion') || 'Sin descripción disponible';

        const formatearFecha = (cadenaFecha) => {
            if (!cadenaFecha) return 'No definida';
            try {
                return new Date(cadenaFecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
            } catch (error) {
                return cadenaFecha;
            }
        };

        const fechaInicio = formatearFecha(this.getAttribute('fecha-inicio'));
        const fechaFin = formatearFecha(this.getAttribute('fecha-fin'));

        const tipoSeleccion = this.getAttribute('tipo-seleccion') === 'multiple' ? 'Múltiple' : 'Única';
        const maxSelecciones = this.getAttribute('max-selecciones') || '1';
        const esAnonima = this.getAttribute('es-anonima') === 'true' || this.getAttribute('es-anonima') === '1';

        this.innerHTML = `
        <div class="card h-100 border-0 shadow-sm position-relative card-component p-4 d-flex flex-column justify-content-between">
            <div>
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex align-items-center justify-content-center icono-card bg-light mt-0 mb-0" style="width: 3.5rem; height: 3.5rem; border-radius: 1rem;">
                        <span class="material-symbols-outlined" style="font-size: 1.8rem;">
                            ballot
                        </span>
                    </div>
                    <span class="badge ${esAnonima ? 'bg-secondary' : 'bg-primary'} rounded-pill px-3 py-2 small fw-bold">
                        ${esAnonima ? 'Anónima' : 'Identificada'}
                    </span>
                </div>
            
                <h3 class="fuente-titular fw-bold mb-2 text-start" style="color: var(--primario-contenedor); font-size: 1.35rem; line-height: 1.6rem; min-height: 3.2rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${titulo}
                </h3>
            
                <p class="text-secondary mb-4 text-start small" style="line-height: 1.35rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; height: 4.05rem;">
                    ${descripcion}
                </p>

                <div class="mb-4 text-start">
                    <div class="d-flex align-items-center gap-2 text-secondary mb-2 small">
                        <span class="material-symbols-outlined fs-6">calendar_month</span>
                        <span><strong>Inicio:</strong> ${fechaInicio}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 text-secondary mb-2 small">
                        <span class="material-symbols-outlined fs-6">event_busy</span>
                        <span><strong>Cierre:</strong> ${fechaFin}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 text-secondary small">
                        <span class="material-symbols-outlined fs-6">settings_suggest</span>
                        <span>Selección ${tipoSeleccion} (Máx: ${maxSelecciones})</span>
                    </div>
                </div>
            </div>

            <button class="btn w-100 fw-bold boton-votar-eleccion">
                Emitir Voto
            </button>
        </div>
        `;

        const boton = this.querySelector('.boton-votar-eleccion');
        if (boton) {
            boton.addEventListener('click', () => {
                const idRol = new URLSearchParams(window.location.search).get('rolId') || sessionStorage.getItem('rolIdActivo');
                window.location.href = `votar.html?id_votacion=${idVotacion}&rolId=${idRol}`;
            });
        }
    }
}

customElements.define('app-eleccion', CardEleccionComponent);