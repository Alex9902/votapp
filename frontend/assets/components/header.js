class Header extends HTMLElement {
    connectedCallback() {

        this.innerHTML = `
        <header>
        <nav class="d-flex justify-content-between align-items-center p-4">
            <a class=" text-decoration-none" href="./home.html">
                <h1 class="fuente-titular">VOTAPP</h1>
            </a>

            <div class="d-flex gap-5">
                <a>Elecciones</a>
                <a>Resultados</a>
                <a>Candidatos</a>
            </div>

            <div class="d-flex gap-3 align-items-center">
                <a><span class="material-symbols-outlined">info</span></a>
                <a><span class="material-symbols-outlined">logout</span></a>
                <a class="d-block" style="width: 40px; height: 40px;">
                    <img class="w-100 h-100 object-fit-cover rounded-circle" src="../assets/static/user.png">
                </a>
            </div>
        </nav>
    </header>
        `
    }
}
customElements.define('app-header', Header);