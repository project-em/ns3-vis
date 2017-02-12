var Sequelize = require('sequelize');

var exports = module.exports = {};
var models = exports.models = {};

exports.db = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
        ssl: true
    }
});

models.source = exports.db.define('source', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    logo: {
        type: Sequelize.STRING,
        allowNull: false,
    }
}, { freezeTableName: true });

models.topic = exports.db.define('topic;', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    }
}, { freezeTableName: true });

models.article = exports.db.define('article', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    body: {
        type: Sequelize.STRING,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, { freezeTableName: true });

models.sentence = exports.db.define('sentence', {
    text: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    bias: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
}, { freezeTableName: true });

models.source.hasMany(models.article);
models.article.hasMany(models.sentence);
models.article.hasOne(models.topic);

exports.db.sync();