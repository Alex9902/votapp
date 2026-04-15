class CardComponent extends HTMLElement {
    connectedCallback() {
        const icono = this.getAttribute('icono');
        const titulo = this.getAttribute('titulo');
        const descripcion = this.getAttribute('descripcion');
        const botonText = this.getAttribute('boton-text');

        this.innerHTML = `
        <div class="card text-center h-100 border-0 shadow-sm position-relative card-component">
            <!-- Icono -->
            <div class="d-flex align-items-center justify-content-center mx-auto mt-3 mb-4 icono-card bg-light">
                <span class="material-symbols-outlined">
                    ${icono}
                </span>
            </div>

            <!-- Título -->
            <h2 class="fuente-titular fw-bold mb-2">
                ${titulo}
            </h2>

            <!-- Descripción -->
            <p class="text-muted mb-4">
                ${descripcion}
            </p>

            <!-- Botón -->
            <button class="btn w-100 fw-bold">
                ${botonText}
            </button>
        </div>
        `;
    }
}

customElements.define('app-card', CardComponent);