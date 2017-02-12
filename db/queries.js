var schema = require('./schema.js');

var exports = module.exports = {};

exports.articlesFor = (topic) => {
  return schema.models.article.findAll({
    where: {
      'Topic.name': topic
    }
  }).then((articles) => {
    return articles;
  })
};

exports.topics = () => {
  return schema.models.topic.all().then((topics) => { return topics; });
}