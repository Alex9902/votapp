class CardComponent extends HTMLElement {
    connectedCallback() {
        const icono = this.getAttribute('icono');
        const titulo = this.getAttribute('titulo');
        const descripcion = this.getAttribute('descripcion');
        const textoBoton = this.getAttribute('boton-text');
        const idRol = this.getAttribute('rol-id');

        this.innerHTML = `
        <div class="card text-center h-100 border-0 shadow-sm position-relative card-component">
            <div class="d-flex align-items-center justify-content-center mx-auto mt-3 mb-4 icono-card bg-light">
        
                <span class="material-symbols-outlined">
                    ${icono}
                </span>
            </div>
        
            <h2 class="fuente-titular fw-bold mb-2">
                ${titulo}
            </h2>
        
            <p class="text-muted mb-4">
                ${descripcion}
            </p>
        
            <button class="btn w-100 fw-bold boton-votar">
                ${textoBoton}
            </button>
        
        </div>
        `;

        const boton = this.querySelector('.boton-votar');
        if (boton) {
            boton.addEventListener('click', () => {

                if (idRol) {
                    sessionStorage.setItem('rolIdActivo', idRol);
                    sessionStorage.setItem('rolNombreActivo', titulo);
                    window.location.href = `elecciones.html?rolId=${idRol}&rolNombre=${encodeURIComponent(titulo)}`;
                } else {
                    console.warn("Falta el atributo rol-id en app-card");
                }
            });
        }
    }
}

customElements.define('app-card', CardComponent);
