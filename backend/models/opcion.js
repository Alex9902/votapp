const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Opcion = sequelize.define('opcion', {
    id_opcion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_votacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_subcategoria: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    texto_opcion: {
        type: DataTypes.STRING(150),
        allowNull: false
    }
});

module.exports = Opcion;
