const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const JWT_KEY = process.env.JWT_KEY;

/**
 * Sistema de auth por cookie
 * genera una cookie de 2h con el JWT verificado y la envia al cliente como respuesta
 * esto permite manejar el redireccionamiento no autorizado
 */
router.post('/login', async (req, res) => {
    try {
        const { dni, pass } = req.body;

        if (!dni || !pass) {
            return res.status(400).json({
                error: "DNI y contraseña son requeridos"
            });
        }

        // Buscar usuario en la base de datos
        const user = await Usuario.findOne({ where: { dni } });

        if (!user) {
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        // Comparar contraseña con el hash
        const match = await bcrypt.compare(pass, user.password_hash);

        if (match) {
            const token = jwt.sign(
                { 
                    id_usuario: user.id_usuario,
                    dni: user.dni,
                    es_admin: user.es_admin
                },
                JWT_KEY,
                { expiresIn: '2h' }
            );

            res.cookie('token_votapp', token, {
                httpOnly: true,
                secure: false, // Cambiar a true si se despliega en producción con HTTPS
                maxAge: 7200000 // 2 horas en ms
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
    } catch (err) {
        console.error("Error en /api/login:", err);
        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

module.exports = router;