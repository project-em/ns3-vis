var schema = require('./schema.js');

var exports = module.exports = {};

exports.articlesFor = (topic) => {
  return schema.models.article.findAll({
    where: {
      'Topic.id': topic
    },
    group: ['source.id']
  }).then((articles) => {
    return articles;
  })
};

exports.topics = () => {
  return schema.models.topic.all().then((topics) => { return topics; });
}

exports.articleBias = (articleId) => {
  return schema.models.article.findById(articleId).then((article) => {
    if (!article) return 0;
    schema.models.sentence.sum(
      {
        where: {
          'article.id': articleId
        }
      }
    ).then((sum) => {
      schema.models.sentence.count(
        {
          where: {
            'article.id': articleId
          }
        }
      )
    }).then((count) => {
      article.bias = count == 0 ? 0 : sum / count;
      return article;
    });
  });
}