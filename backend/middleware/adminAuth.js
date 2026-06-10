function adminAuth(req, res, next) {
    if (req.userData && req.userData.es_admin) {
        next();
    } else {
        return res.status(403).json({
            error: "Acceso denegado: se requieren privilegios de administrador"
        });
    }
}

module.exports = adminAuth;
