var schema = require('./schema.js');

var exports = module.exports = {};

exports.newTopic = (name) => {
    if (!name) {
        console.log("error in creating topic");
        throw "incomplete data";
    } else {
        return schema.models.topic.upsert({
                name: name
            }
        ).then(() => {
            return schema.models.topic.findOne({
                where: {
                    name: name
                }
            });
        });
    }
}

exports.newSource = (name, url, logo) => {
    if (!name || !url) {
        console.log("error in creating source");
        throw "incomplete data";
    } else {
        return schema.models.source.upsert({
                name: name,
                url: url,
                logo: logo
            }
        ).then(() => {
            return schema.models.source.findOne({
                where: {
                    url: url
                }
            });
        }, (fail) => {
            return fail;
        });
    }
};

exports.newArticle = (articleObj, topicId, sourceId) => {
    if (!articleObj) {
        console.log("error in creating article");
        throw "incomplete data";
    } else {
        return schema.models.article.upsert({
            name: articleObj.headline,
            body: articleObj.body,
            url: articleObj.url,
            topicId: topicId,
            sourceId: sourceId
        }).then(() => {
            return schema.models.article.findOne({
                where: {
                    url: articleObj.url,
                }
            });
        });
    }
}

exports.newSentence = (articleObj, sentence) => {
    if (!articleObj) {
        console.log("error in creating sentence");
        throw "incomplete data";
    } else {
        return schema.models.sentence.create({
            text: sentence,
            bias: 0, //default for now
            articleId: articleObj.id
        });
    }
}

