const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voto = sequelize.define('voto', {
    id_voto: {
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
    id_opcion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    voto_encriptado: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    codigo_verificacion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    fecha_emision: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Voto;
