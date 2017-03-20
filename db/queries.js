var schema = require('./schema.js');

var exports = module.exports = {};

exports.articlesFor = (topic) => {
  return schema.models.source.all({
    include: [
      {
        model: schema.models.article,
        where: {
          'topicId': topic,
        },
      }
    ],
    order: ['source.name'],
    attributes: {
      include: [[schema.db.fn('AVG', schema.db.col('articles.bias')), 'bias']]
    },
    group: ['source.id', 'articles.id'],
  }).then((results) => {
    results.forEach((result) => {
      result.articles.length = 5; // cap at 5 articles, should use SQL limit btu complicated to preserve avg
    });
    return results;
  });
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