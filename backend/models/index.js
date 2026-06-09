const sequelize = require('../config/database');
const Usuario = require('./usuario');
const Subcategoria = require('./subcategoria');

// Relación de muchos a muchos (N:M) entre Usuario y Subcategoria
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

module.exports = {
    sequelize,
    Usuario,
    Subcategoria
};
