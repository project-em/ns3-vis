var Sequelize = require('sequelize');

var exports = module.exports = {};
var models = exports.models = {};

exports.db = new Sequelize('prod', process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DATABASE_URL,
  dialect: 'postgres'
});

models.source = exports.db.define('source', {
    id: {
        type: Sequelize.UUID
    },
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
    id: Sequelize.UUID,
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    }
}, { freezeTableName: true });

models.article = exports.db.define('article', {
    id: {
        type: Sequelize.UUID
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    body: {
        type: Sequelize.STRING,
    },
    topic: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: models.topic,
            key: 'id'
        }
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    source_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: models.source,
            key: 'id'
        }
    }
}, { freezeTableName: true });

models.sentence = exports.db.define('sentence', {
    id: Sequelize.UUID,
    article: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: models.article,
            key: 'id'
        }
    },
    bias: Sequelize.INTEGER
}, { freezeTableName: true });

exports.db.sync();