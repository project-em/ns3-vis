var schema = require('./schema.js');

var exports = module.exports = {};

exports.newTopic = (name) => {
    if (!name) {
        throw "incomplete data";
    } else {
        return schema.models.topic.create(
            {
                name: name
            }
        );
    }
}

exports.newSource = (name, url, logo) => {
    if (!name || !url) {
        throw "incomplete data";
    } else {
        
        return schema.models.source.create(
            {
                name: name,
                url: url,
                logo: logo
            }
        );
    }
};

exports.newArticle = (name, body, url) => {
    if (!name || !body) {
        throw "incomplete data";
    } else {
        return schema.models.article.create({
            name: name,
            body: body,
            url: url
        });
    }
};

exports.newArticle = (articleObj) => {
    if (!articleObj) {
        throw "incomplete data";
    } else {
        return schema.models.article.create({
            name: articleObj.headline,
            body: articleObj.body,
            url: articleObj.url
        });
    }
}

