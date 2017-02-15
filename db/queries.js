var schema = require('./schema.js');

var exports = module.exports = {};

exports.articlesFor = (topic) => {
  return schema.models.article.findAll({
    where: {
      'topicId': topic
    },
    group: ['sourceId']
  }).then((articles) => {
    return articles;
  })
};

exports.topicName = (topicId) => {
  var topic = schema.models.topic.findById(topicId);
  return topic;
}

exports.topics = () => {
  return schema.models.topic.all().then((topics) => { return topics; });
}

exports.sourceByName = (sourceName) => {
  return source = schema.models.source.findAll({
      where: {
        name: sourceName
      }
  }).then((sources) => {
      return sources[0];
  })
}

exports.articleBias = (articleId) => {
  var totalSum;
  return schema.models.article.findById(articleId).then((article) => {
    if (!article) return 0;
    schema.models.sentence.sum('bias',
      { where: { 'articleId': articleId }}
    ).then((sum) => {
      totalSum = sum;
      schema.models.sentence.count(
        { where: { 'articleId': articleId }}
      ).then((count) => {
        article.bias = count == 0 ? 0 : totalSum / count;
        return article;
      });
    });
  });
}