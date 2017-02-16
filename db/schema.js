var Sequelize = require('sequelize');

var exports = module.exports = {};
var models = exports.models = {};

exports.db = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: true
    },
    logging: false
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
    }
}, { freezeTableName: true });

models.topic = exports.db.define('topic;', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }
}, { freezeTableName: true });

models.article = exports.db.define('article', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    body: {
        type: Sequelize.TEXT,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, { freezeTableName: true });

models.sentence = exports.db.define('sentence', {
    text: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    bias: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
}, { freezeTableName: true });

models.topic.hasMany(models.article);
models.source.hasMany(models.article);
models.article.hasMany(models.sentence);
models.article.belongsTo(models.topic);
models.article.belongsTo(models.source);
models.sentence.belongsTo(models.article);

exports.db.sync({force: true});