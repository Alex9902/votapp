const token = localStorage.getItem('token_votapp');

if (!token) {
    alert("Sesión no válida. Por favor, inicia sesión.");
    window.location.href = "/";
}