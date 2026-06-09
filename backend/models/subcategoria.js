const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subcategoria = sequelize.define('subcategoria', {
    id_subcategoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_rol: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    }
});

module.exports = Subcategoria;
