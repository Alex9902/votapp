const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const { Usuario, Subcategoria, Votacion, RegistroParticipacion } = require('../models');

/**
 * GET /api/roles
 * obtiene los roles asociados al usuario 
 */
router.get('/roles', auth, async (req, res) => {
    try {
        const idUsuario = req.userData.id_usuario;

        const usuario = await Usuario.findByPk(idUsuario, {
            include: {
                model: Subcategoria,
                through: { attributes: [] } //excluye datos de usuario_subcategoria
            }
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        return res.json({
            es_admin: usuario.es_admin,
            roles: usuario.subcategoria
        });

    } catch (error) {
        console.error("Error en GET /api/roles:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * GET /api/elecciones
 * select elecciones activas para el rol,
 * en las cuales el usuario no ha votado
 */
router.get('/elecciones', auth, async (req, res) => {
    try {
        const idUsuario = req.userData.id_usuario;
        const esAdmin = req.userData.es_admin;
        const ahora = new Date();

        //admin = todas las elecciones
        if (esAdmin) {
            const elecciones = await Votacion.findAll({
                where: {
                    fecha_inicio: { [Op.lte]: ahora },
                    fecha_fin: { [Op.gte]: ahora }
                }
            });

            return res.json({ elecciones });
        }

        const rolQuery = req.query.rolId;
        if (!rolQuery) {
            return res.status(400).json({ error: "El parámetro rolId es requerido" });
        }

        const idRol = parseInt(rolQuery, 10);
        if (!idRol) {
            return res.status(400).json({ error: "El parámetro rolId debe ser un número válido" });
        }

        //obtiene las participaciones en roles ya votadas
        const participaciones = await RegistroParticipacion.findAll({
            where: {
                id_usuario: idUsuario,
                id_subcategoria: idRol
            },
            attributes: ['id_votacion']
        });

        const eleccionesVotadasId = participaciones.map(p => p.id_votacion);

        //construir where
        const clausulaWhere = {
            fecha_inicio: { [Op.lte]: ahora },
            fecha_fin: { [Op.gte]: ahora }
        };

        if (eleccionesVotadasId.length > 0) {
            clausulaWhere.id_votacion = { [Op.notIn]: eleccionesVotadasId };
        }

        //elecciones activas sin votar
        const elecciones = await Votacion.findAll({
            where: clausulaWhere,
            include: {
                model: Subcategoria,
                where: { id_subcategoria: idRol },
                attributes: [],
                through: { attributes: [] }
            }
        });

        return res.json({ elecciones });

    } catch (error) {
        console.error("Error en GET /api/elecciones:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;

