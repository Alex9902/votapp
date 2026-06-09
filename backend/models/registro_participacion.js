const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RegistroParticipacion = sequelize.define('registro_participacion', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    id_votacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    id_subcategoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    fecha_voto: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = RegistroParticipacion;
