const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Cart = sequelize.define('cart', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    }
});

module.exports = Cart;
