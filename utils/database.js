const { Sequelize } = require('sequelize');

module.exports = new Sequelize('node-shopping', 'root', 'root123', {
    dialect: 'mysql',
    host: 'localhost'
});
