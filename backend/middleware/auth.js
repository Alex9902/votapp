const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.cookies.token_votapp;

    if (!token) res.redirect('/');

    try{
        const verificar = jwt.verify(token, process.env.JWT_KEY);
        
        req.userData = verificar;
        next();
    
    } catch{
        res.clearCookie('token_votapp');
        return res.redirect('/');
    }
}

module.exports = auth;