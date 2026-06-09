const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const JWT_KEY = process.env.JWT_KEY;

/**
 * Sistema de auth por cookie
 * genera una cookie de 2h con el JWT verificado y la envia al cliente como respuesta
 */
router.post('/login', async (req, res) => {
    try {
        const { dni, pass } = req.body;

        if (!dni || !pass) {
            return res.status(400).json({
                error: "DNI y contraseña son requeridos"
            });
        }

        const usuario = await Usuario.findOne({ where: { dni } });

        if (!usuario) {
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        const coincide = await bcrypt.compare(pass, usuario.password_hash);

        if (coincide) {
            const token = jwt.sign(
                {
                    id_usuario: usuario.id_usuario,
                    dni: usuario.dni,
                    es_admin: usuario.es_admin
                },
                JWT_KEY,
                { expiresIn: '2h' }
            );

            res.cookie('token_votapp', token, {
                httpOnly: true,
                secure: false,//para http encima en local no hace falta
                maxAge: 7200000 //2h
            });

            return res.json({
                success: true,
                message: "Login correcto",
                token: token,
                redirect: '/views/home.html'
            });
        } else {
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }
    } catch (error) {
        console.error("Error en /api/login:", error);
        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

/**
 * GET /api/logout
 * borra session y manda a login
 */
router.get('/logout', (req, res) => {
    res.clearCookie('token_votapp');
    return res.redirect('/');
});

module.exports = router;
