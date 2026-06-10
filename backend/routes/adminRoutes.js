const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { sequelize, Usuario, Subcategoria, Votacion, Opcion, Voto } = require('../models');

//MARK: GESTIÓN USUARIO
/**
 * GET /api/admin/usuarios
 * @returns todos usuarios con sus roles
 */
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: {
                model: Subcategoria,
                through: { attributes: [] }
            }
        });

        //no retornar contraseñas hasheadas 
        const resultado = usuarios.map(u => {
            const datos = u.toJSON();
            delete datos.password_hash;
            return datos;
        });

        return res.json({ usuarios: resultado });
    } catch (error) {
        console.error("Error al obtener usuarios admin:", error);
        return res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

/**
 * GET /api/admin/subcategorias
 * @returns todas las categorias
 */
router.get('/subcategorias', async (req, res) => {
    try {
        const subcategorias = await Subcategoria.findAll();
        return res.json({ subcategorias });
    } catch (error) {
        console.error("Error al obtener subcategorías admin:", error);
        return res.status(500).json({ error: "Error al obtener subcategorías" });
    }
});

/**
 * POST /api/admin/usuarios
 * creación de usuario con su rol
 */
router.post('/usuarios', async (req, res) => {
    try {
        const { dni, nombre_completo, password, es_admin, roles } = req.body;

        if (!dni || !nombre_completo || !password) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        //verifcar q exista
        const usuarioExistente = await Usuario.findOne({ where: { dni } });

        if (usuarioExistente) {
            return res.status(400).json({ error: "Ya existe un usuario con este DNI" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const nuevoUsuario = await Usuario.create({
            dni,
            nombre_completo,
            password_hash: passwordHash,
            es_admin: !!es_admin
        });

        if (roles && roles.length > 0) {
            await nuevoUsuario.setSubcategoria(roles);
        }

        return res.status(201).json({
            message: "Usuario creado correctamente",
            id_usuario: nuevoUsuario.id_usuario
        });
    } catch (error) {
        console.error("Error al crear usuario admin:", error);
        return res.status(500).json({ error: "Error al crear usuario" });
    }
});

/**
 * PUT /api/admin/usuarios/:id
 * edita usuario
 */
router.put('/usuarios/:id', async (req, res) => {
    try {
        const idUsuario = req.params.id;
        const { dni, nombre_completo, password, es_admin, roles } = req.body;

        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        //si cambia el dni q no colisione
        if (dni && dni !== usuario.dni) {
            const usuarioConDni = await Usuario.findOne({ where: { dni } });

            if (usuarioConDni) {
                return res.status(400).json({ error: "Ya existe otro usuario con ese DNI" });
            }
        }

        const datosActualizados = {
            dni: dni || usuario.dni,
            nombre_completo: nombre_completo || usuario.nombre_completo,
            es_admin: es_admin !== undefined ? !!es_admin : usuario.es_admin
        };

        if (password) {
            datosActualizados.password_hash = await bcrypt.hash(password, 10);
        }

        await usuario.update(datosActualizados);

        if (roles) {
            await usuario.setSubcategoria(roles);
        }

        return res.json({ message: "Usuario actualizado correctamente" });

    } catch (error) {
        console.error("Error al editar usuario admin:", error);
        return res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

/**
 * DELETE /api/admin/usuarios/:id
 * elimna usuario (en cascada)
 */
router.delete('/usuarios/:id', async (req, res) => {
    try {
        const idUsuario = req.params.id;
        const usuario = await Usuario.findByPk(idUsuario);

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        //que el admin no se borre a si mismo, ha pasado xd
        if (req.userData && req.userData.id_usuario === parseInt(idUsuario, 10)) {
            return res.status(400).json({ error: "No puedes eliminar tu propia cuenta de administrador" });
        }

        await usuario.destroy();
        return res.json({ message: "Usuario eliminado correctamente" });

    } catch (error) {
        console.error("Error al eliminar usuario admin:", error);
        return res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

//MARK: VOTACIONES

/**
 * GET /api/admin/votaciones
 * @returns votaciones con sus roles relacionasdos
 */
router.get('/votaciones', async (req, res) => {
    try {
        const votaciones = await Votacion.findAll({
            include: {
                model: Subcategoria,
                through: { attributes: [] }
            }
        });
        return res.json({ votaciones });
    } catch (error) {
        console.error("Error al obtener votaciones admin:", error);
        return res.status(500).json({ error: "Error al obtener votaciones" });
    }
});

/**
 * POST /api/admin/votaciones
 * crea una votacion, asocia los roles y añade sus opciones
 */
router.post('/votaciones', async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            recuento_tiempo_real,
            es_anonima,
            tipo_seleccion,
            max_selecciones,
            roles,//array de ids
            opciones//array de objetos
        } = req.body;

        if (!titulo || !fecha_inicio || !fecha_fin || !roles || roles.length === 0) {
            return res.status(400).json({ error: "Faltan campos obligatorios para crear la votación" });
        }

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

        await nuevaVotacion.setSubcategoria(roles);

        if (opciones && opciones.length > 0) {
            const opcionesModelos = opciones.map(op => {
                const texto = typeof op === 'string' ? op : op.texto_opcion;
                const idSub = typeof op === 'object' && op.id_subcategoria ? op.id_subcategoria : roles[0];
                return {
                    id_votacion: nuevaVotacion.id_votacion,
                    id_subcategoria: idSub,
                    texto_opcion: texto
                };
            });
            await Opcion.bulkCreate(opcionesModelos);
        }

        return res.status(201).json({
            message: "Votación creada correctamente",
            id_votacion: nuevaVotacion.id_votacion
        });

    } catch (error) {
        console.error("Error al crear votación admin:", error);
        return res.status(500).json({ error: "Error al crear votación" });
    }
});

/**
 * PUT /api/admin/votaciones/:id
 * edita votacion
 */
router.put('/votaciones/:id', async (req, res) => {
    try {
        const idVotacion = req.params.id;
        const {
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            recuento_tiempo_real,
            es_anonima,
            tipo_seleccion,
            max_selecciones,
            roles
        } = req.body;

        const votacion = await Votacion.findByPk(idVotacion);
        if (!votacion) {
            return res.status(404).json({ error: "Votación no encontrada" });
        }

        /**
         * aqui he querido hacer ternarias
         * ya que si editas un campo o dejas el que habia
         * así el payload llega entero solo modificando campos que quieras
         */
        await votacion.update({
            titulo: titulo || votacion.titulo,
            descripcion: descripcion !== undefined ? descripcion : votacion.descripcion,
            fecha_inicio: fecha_inicio || votacion.fecha_inicio,
            fecha_fin: fecha_fin || votacion.fecha_fin,
            recuento_tiempo_real: recuento_tiempo_real !== undefined ? !!recuento_tiempo_real : votacion.recuento_tiempo_real,
            es_anonima: es_anonima !== undefined ? !!es_anonima : votacion.es_anonima,
            tipo_seleccion: tipo_seleccion || votacion.tipo_seleccion,
            max_selecciones: max_selecciones || votacion.max_selecciones
        });

        if (roles) {
            await votacion.setSubcategoria(roles);
        }

        return res.json({ message: "Votación actualizada correctamente" });
    } catch (error) {
        console.error("Error al actualizar votación admin:", error);
        return res.status(500).json({ error: "Error al actualizar votación" });
    }
});

/**
 * DELETE /api/admin/votaciones/:id
 * elimina en cascada la votación con opciones y participcaciones
 */
router.delete('/votaciones/:id', async (req, res) => {
    try {
        const idVotacion = req.params.id;
        const votacion = await Votacion.findByPk(idVotacion);

        if (!votacion) {
            return res.status(404).json({ error: "Votación no encontrada" });
        }

        await votacion.destroy();
        return res.json({ message: "Votación eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar votación admin:", error);
        return res.status(500).json({ error: "Error al eliminar votación" });
    }
});

//MARK:RESULTADOS
/**
 * GET /api/admin/votaciones/:id/resultados
 * retorna los resultados de una votacion contando los votos por opcion
 */
router.get('/votaciones/:id/resultados', async (req, res) => {
    try {
        const idVotacion = req.params.id;

        const votacion = await Votacion.findByPk(idVotacion);
        if (!votacion) {
            return res.status(404).json({ error: "Votación no encontrada" });
        }

        //obiente opciones asociadas
        const opciones = await Opcion.findAll({
            where: { id_votacion: idVotacion },
            include: {
                model: Subcategoria,
                attributes: ['nombre_rol']
            }
        });

        //contar votos group by opcion
        const votosContados = await Voto.findAll({
            where: { id_votacion: idVotacion },
            attributes: [
                'id_opcion',
                [sequelize.fn('COUNT', sequelize.col('id_voto')), 'cantidad']
            ],
            group: ['id_opcion']
        });

        const mapaVotos = {};
        votosContados.forEach(v => {
            mapaVotos[v.id_opcion] = parseInt(v.get('cantidad'), 10);
        });

        //payload de resultados de votos
        const resultados = opciones.map(op => ({
            id_opcion: op.id_opcion,
            texto_opcion: op.texto_opcion,
            id_subcategoria: op.id_subcategoria,
            nombre_rol: op.subcategoria ? op.subcategoria.nombre_rol : 'Sin Rol',
            votos: mapaVotos[op.id_opcion] || 0
        }));

        return res.json({
            votacion: {
                id_votacion: votacion.id_votacion,
                titulo: votacion.titulo,
                es_anonima: votacion.es_anonima,
                recuento_tiempo_real: votacion.recuento_tiempo_real
            },
            resultados
        });

    } catch (error) {
        console.error("Error al calcular resultados admin:", error);
        return res.status(500).json({ error: "Error al calcular resultados de la votación" });
    }
});

module.exports = router;
