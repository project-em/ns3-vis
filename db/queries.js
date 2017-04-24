var schema = require('./schema.js');
const Promise = require('bluebird');

var exports = module.exports = {};

exports.articlesFor = (topic) => {
  return schema.models.source.findAll({
    include: [
      {
        model: schema.models.article,
        where: {
          'topicId': topic,
        },
      }
    ],
    order: ['source.name'],
    group: ['source.id', 'articles.id'],
  }).then((results) => {
    return Promise.map(results, (result) => {
      var sum = 0;
      var result = result.get({plain: true});
      result.articles.forEach((article) => {sum += article.bias; article.body.length = Math.min(600, article.body.length)});
      result.bias = 5 * (sum / result.articles.length);
      result.articles.length = Math.min(5, result.articles.length); // cap at 5 articles, should use SQL limit btu complicated to preserve avg
      return result;
    }, {concurrency: 500}).then((promised) => {
      return promised;
    });
  });
};

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

exports.previews = () => {
  return schema.db.query(
      `SELECT bias, "topicId", topic.name AS "topicName", "sourceId",  source.name, "primaryColor", "secondaryColor"
          FROM source2topic AS map
          INNER JOIN topic  AS topic  ON ("topicId" = topic.id)
          INNER JOIN source AS source ON ("sourceId" = source.id)
          WHERE visible = TRUE
          ORDER BY "topicName", source.name`
  , { type: schema.db.QueryTypes.SELECT, raw: true }).then((result) => {
      return groupBy(result, "topicName");
  });
};

exports.topicName = (topicId) => {
  var topic = schema.models.topic.findById(topicId);
  return topic;
}

exports.topics = () => {
  return schema.models.topic.findAll({
    where: {
        visible: true
    }
  }).then((topics) => { return topics; });
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

exports.seedSourceTopicBias = () => {
    // go update all source topic bias pairings
    return schema.models.topic.findAll({
        where: {
            visible: true
        },
        attributes: ['id']
      }).then((topics) => {
          return schema.models.source.findAll({
              attributes: ['id']
          }).then((sources) => {
              return Promise.map(sources, (source) => {
                  return Promise.map(topics, (topic) => {
                      return schema.db.query("SELECT AVG(\"bias\") from article WHERE \"topicId\" = " + topic.id + " AND \"sourceId\" = " + source.id,
                          { type: schema.db.QueryTypes.SELECT, raw: true }).then((data) => {
                          if (biasValue == null || biasValue == undefined) return;
                          var biasValue =  5 * data[0].avg;
                          console.log("updating source", source.id, "on topic", topic.id, "to", biasValue);
                          return schema.models.sourceTopicMap.upsert({
                              sourceId: source.id,
                              topicId: topic.id,
                              bias: biasValue
                          }, { returning: false });
                      });
                  }, { concurrency: 30 });
              }, { concurrency: 30 });
        });
    });
}

exports.fillArticleBiases = (threshold, log_max) => {
    console.log("Thresholding with", threshold, "and", log_max);
    return schema.models.article.findAll({attributes : ['id'], where: { archivalDataFlag: 0}}).then((articles) => {
        return Promise.map(articles, (article) => {
            return schema.models.sentence.findAll({
                attributes: ['id', 'bias'],
                where: {
                  'articleId': article.id,
                  'topicRelevance': {
                      $gte: threshold
                  }
                }
            }).then((sentences) => {
                var totalSum = 0;
                sentences.forEach((sentence) => { totalSum += ((sentence.bias / log_max)) });
                article.bias = 10 * (sentences.length == 0 ? 0 : totalSum / sentences.length);
                if (article.bias == null || article.bias == Infinity || article.bias == -Infinity) {
                    article.bias = 0; // sanitize
                }
                return schema.models.article.update({
                    bias: article.bias
                }, {
                    where: {
                      'id': article.id
                    },
                    returning: false,
                }).then((result) => {});
            });
        }, { concurrency: 1000 }).then(() => {
            console.log("finished Thresholding");
        });
    }).then(() => {
        return exports.seedSourceTopicBias();
    });
}

exports.articleBias = (articleId) => {
  var totalSum;
  return schema.models.article.findById(articleId, { plain: true }).then((article) => {
    if (!article) return 0;
    return schema.models.sentence.findAll(
        { where: { 'articleId': articleId },
          order: [['id', 'ASC']]
        }).then((sentences) => {
        var result = article.get({plain: true});
        result.sentences = sentences;
        return result;
      });
  });
}