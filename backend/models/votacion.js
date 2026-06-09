const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Votacion = sequelize.define('votacion', {
    id_votacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    recuento_tiempo_real: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    es_anonima: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tipo_seleccion: {
        type: DataTypes.ENUM('unica', 'multiple'),
        defaultValue: 'unica'
    },
    max_selecciones: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
});

module.exports = Votacion;
