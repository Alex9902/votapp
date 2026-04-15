class Header extends HTMLElement {
    connectedCallback() {

        this.innerHTML = /*html*/ `
        <header>
            <nav class="d-flex justify-content-between align-items-center p-4">
                <a class="text-decoration-none" href="./home.html">
                    <h1 class="fuente-titular">VOTAPP</h1>
                </a>
        
                <div class="d-flex gap-5 fw-semibold" style="color:var(--texto-variante);">
                    <a href="elecciones.html" class="text-decoration-none text-reset">Elecciones</a>
                    <a href="resultados.html" class="text-decoration-none text-reset">Resultados</a>
                    <a href="candidatos.html" class="text-decoration-none text-reset">Candidatos</a>
                </div>
        
                <div class="d-flex gap-3 align-items-center">
                    <a href="info.html" class="text-decoration-none text-reset"><span class="material-symbols-outlined">info</span></a>
                    <a href="../index.html" class="text-decoration-none text-reset"><span class="material-symbols-outlined">logout</span></a>
                    <!-- TODO arreglar ruta logout esta cifrada por api -->
                    <a href="" class="d-block text-decoration-none text-reset" style="width: 40px; height: 40px;">
                        <img class="w-100 h-100 object-fit-cover rounded-circle" src="../assets/public/user.png">
                    </a>
                </div>
            </nav>
        </header>
        `
    }
}
customElements.define('app-header', Header);