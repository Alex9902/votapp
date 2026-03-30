const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const JWT_KEY = process.env.JWT_KEY;
/**
 * //TODO cambiar credenciales cuando haya conexión a db
 * cerdenciales de preuba hardcodeados
 */
const userDB = {
    dni: '12345678L',
    passwordHash: '$2b$10$pkzfX7s8NC04zHX30O3Mz.5cnwUml..7ceid795X4f1pZaj.X9Cou' //=prueba
};

router.post('/login', async (req, res) => {

    try {
        const { dni, pass } = req.body;

        if (dni !== userDB.dni) {

            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        const match = await bcrypt.compare(pass, userDB.passwordHash);

        if (match) {

            const token = jwt.sign(
                {dni: userDB.dni},
                JWT_KEY,
            {expiresIn:'2h'}
        );

            return res.json({
                success: true,
                message : "Login correcto",
                token: token,
                redirect: '/views/home.html'
            });

        } else {
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

module.exports = router;