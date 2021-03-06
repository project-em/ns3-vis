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
        unique: 'sourceIndex'
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'sourceIndex'
    },
    logo: {
        type: Sequelize.STRING,
    },
    primaryColor: {
        type: Sequelize.STRING,
    },
    secondaryColor: {
        type: Sequelize.STRING
    }
}, { freezeTableName: true });

models.topic = exports.db.define('topic', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: () => { return true; }
    }
}, { freezeTableName: true });

models.article = exports.db.define('article', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'articleIndex'
    },
    body: {
        type: Sequelize.TEXT,
    },
    bias: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'articleIndex'
    },
    archivalDataFlag: {
        type: Sequelize.FLOAT,
        allowNull: true
    }
}, { freezeTableName: true });

models.sentence = exports.db.define('sentence', {
    text: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    bias: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    topicRelevance: {
        type: Sequelize.FLOAT,
        allowNull: false,
    }
}, { freezeTableName: true });

models.sourceTopicMap = exports.db.define("source2topic", {
    bias: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    topicId: {
        type: Sequelize.INTEGER,
        unique: 'sourceTopic',
        references: {
            model: models.topic,
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    sourceId: {
        type: Sequelize.INTEGER,
        unique: 'sourceTopic',
        references: {
            model: models.source,
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    }
}, { freezeTableName: true });

models.topic.hasMany(models.article);
models.source.hasMany(models.article);
models.article.hasMany(models.sentence);
models.article.belongsTo(models.topic);
models.article.belongsTo(models.source);
models.sentence.belongsTo(models.article);

// Mapping tables
// models.sourceTopicMap.belongsTo(models.source);
// models.sourceTopicMap.belongsTo(models.topic);