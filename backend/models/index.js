const sequelize = require('../config/database');
const Usuario = require('./usuario');
const Subcategoria = require('./subcategoria');
const Votacion = require('./votacion');
const Opcion = require('./opcion');
const RegistroParticipacion = require('./registro_participacion');
const Voto = require('./voto');

/**
 * RELACIONES ENTRE TABLAS
 * 
 * belongToMany = (N:N)
 * belongsTo = (N:1)
 * hasMany =  (1:N) cuando notiene foranea
 * 
 */
Usuario.belongsToMany(Subcategoria, {
    through: 'usuario_subcategoria',
    foreignKey: 'id_usuario',
    otherKey: 'id_subcategoria'
});

Subcategoria.belongsToMany(Usuario, {
    through: 'usuario_subcategoria',
    foreignKey: 'id_subcategoria',
    otherKey: 'id_usuario'
});

Votacion.belongsToMany(Subcategoria, {
    through: 'votacion_subcategoria',
    foreignKey: 'id_votacion',
    otherKey: 'id_subcategoria'
});

Subcategoria.belongsToMany(Votacion, {
    through: 'votacion_subcategoria',
    foreignKey: 'id_subcategoria',
    otherKey: 'id_votacion'
});

Opcion.belongsTo(Votacion, { foreignKey: 'id_votacion', onDelete: 'CASCADE' });
Votacion.hasMany(Opcion, { foreignKey: 'id_votacion', onDelete: 'CASCADE' });

Opcion.belongsTo(Subcategoria, { foreignKey: 'id_subcategoria', onDelete: 'CASCADE' });
Subcategoria.hasMany(Opcion, { foreignKey: 'id_subcategoria', onDelete: 'CASCADE' });

RegistroParticipacion.belongsTo(Usuario, { foreignKey: 'id_usuario' });
RegistroParticipacion.belongsTo(Votacion, { foreignKey: 'id_votacion' });
RegistroParticipacion.belongsTo(Subcategoria, { foreignKey: 'id_subcategoria' });

Voto.belongsTo(Votacion, { foreignKey: 'id_votacion' });
Voto.belongsTo(Subcategoria, { foreignKey: 'id_subcategoria' });
Voto.belongsTo(Opcion, { foreignKey: 'id_opcion' });
Voto.belongsTo(Usuario, { foreignKey: 'id_usuario', constraints: false });//null es_anonima

module.exports = {
    sequelize,
    Usuario,
    Subcategoria,
    Votacion,
    Opcion,
    RegistroParticipacion,
    Voto
};

