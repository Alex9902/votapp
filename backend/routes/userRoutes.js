const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const { Usuario, Subcategoria, Votacion, RegistroParticipacion, Opcion } = require('../models');

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

/**
 * POST /api/profesor/votaciones
 * permite a los profesores crear votaciones `para alumnos
 */
router.post('/profesor/votaciones', auth, async (req, res) => {
    try {
        const idUsuario = req.userData.id_usuario;

        const usuario = await Usuario.findByPk(idUsuario, {
            include: {
                model: Subcategoria,
                through: { attributes: [] }
            }
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const esProfesor = usuario.subcategoria.some(sub =>
            sub.nombre_rol.toLowerCase().includes('profesor') ||
            sub.nombre_rol.toLowerCase().includes('docent') ||
            sub.nombre_rol.toLowerCase().includes('maestr')
        );

        if (!esProfesor) {
            return res.status(403).json({ error: "Acceso denegado: Solo los profesores pueden realizar esta acción" });
        }

        const {
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            recuento_tiempo_real,
            es_anonima,
            tipo_seleccion,
            max_selecciones,
            opciones
        } = req.body;

        if (!titulo || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: "Faltan campos obligatorios para crear la votación" });
        }

        const subcategoriaAlumno = await Subcategoria.findOne({
            where: {
                nombre_rol: {
                    [Op.like]: '%alumn%'
                }
            }
        });

        if (!subcategoriaAlumno) {
            return res.status(500).json({ error: "No se encontró la subcategoría Alumnos en el sistema" });
        }

        const idRolAlumno = subcategoriaAlumno.id_subcategoria;

        const nuevaVotacion = await Votacion.create({
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            recuento_tiempo_real: recuento_tiempo_real !== undefined ? !!recuento_tiempo_real : true,
            es_anonima: es_anonima !== undefined ? !!es_anonima : false,
            tipo_seleccion: tipo_seleccion || 'unica',
            max_selecciones: max_selecciones || 1
        });

        await nuevaVotacion.setSubcategoria([idRolAlumno]);

        if (opciones && opciones.length > 0) {
            const opcionesModelos = opciones.map(op => {
                const texto = typeof op === 'string' ? op : op.texto_opcion;
                return {
                    id_votacion: nuevaVotacion.id_votacion,
                    id_subcategoria: idRolAlumno,
                    texto_opcion: texto
                };
            });
            await Opcion.bulkCreate(opcionesModelos);
        }

        return res.status(201).json({
            message: "Votación para alumnos creada correctamente",
            id_votacion: nuevaVotacion.id_votacion
        });

    } catch (error) {
        console.error("Error en POST /api/profesor/votaciones:", error);
        return res.status(500).json({ error: "Error interno al crear la votación" });
    }
});

module.exports = router;

