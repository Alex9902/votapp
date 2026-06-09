class Header extends HTMLElement {
    connectedCallback() {

        this.innerHTML = `
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
                    <a href="/api/logout" class="text-decoration-none text-reset"><span class="material-symbols-outlined">logout</span></a>
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