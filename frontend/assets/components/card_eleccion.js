/**
 * Elección condicional
 * si fechaInicio >= currentDate no esta dispo la elección
 * Entonces se cambia el estilo a 'desactivado'
 */
class eleccion extends HTMLElement {
    connectedCallback() {
        const titulo = this.getAttribute('titulo');
        const descripcion = this.getAttribute('descripcion');
        const botonText = this.getAttribute('boton-text');
        const fechaInicio = this.getAttribute('fechaIncio');
        const fechaCierre = this.getAttribute('fechaCierre');

        this.innerHTML = /*html*/ `
        <div>
        
        </div>
        `
    }
}
customElements.define('app-eleccion', eleccion);