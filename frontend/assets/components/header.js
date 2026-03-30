class Header extends HTMLElement{
    connectedCallback(){

        this.innerHTML = `
        <header>
            <nav>
                <a href="../views/dashboard.html"><h1 class="fuente-titular">VOTAPP</h1></a>
                <div class="">
                    <a>Elecciones</a>
                    <a>Resultados</a>
                    <a>Candidatos</a>
                </div>
                <div>
                    <a></a>
                </div>
            </nav>
        </header>
        `
    }
}
coustomElements.define('app-header', Header);