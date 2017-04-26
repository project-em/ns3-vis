const schema = require('./schema.js');
const scrape = require('./scrape.js');
const store = require('./store.js');
const Promise = require('bluebird');
const request = require('request');

const ML_URL = process.eng["ML_URL"];
const ML_ROUTE = process.eng["ML_ROUTE"];
const NYT_KEY = process.env["NYT_KEY"];
const GUAR_KEY = process.env["GUAR_KEY"];
const MAX_HISTORICAL_FILES = +process.env["MAX_HISTORICAL_FILES"] || 1000000000;
const MAX_HISTORICAL_CONCURRENCY = +process.env["MAX_HISTORICAL_CONCURRENCY"] || 100;

var exports = module.exports = {};


var prefixesToTrim = [ "https://", "http://" ];

function sanitizeUrl (url) {
    var sanitizedUrl = url.toLowerCase();
    prefixesToTrim.forEach((prefix) => {
        var idx = -1;
        if (idx = sanitizedUrl.indexOf(prefix) != -1) {
            sanitizedUrl = sanitizedUrl.substring(idx + prefix.length);
        }
    });
    sanitizedUrl = sanitizedUrl.split('/')[0];
    var firstDot = -1;
    if (firstDot = sanitizedUrl.indexOf('.') != sanitizedUrl.lastIndexOf('.')) {
        sanitizedUrl = sanitizedUrl.substring(firstDot + 1);
    }
    return sanitizedUrl;
}

function matchSource (url) {
    var sanitized = sanitizeUrl(url);
    return schema.models.source.findOne({
        url: {
            $like: sanitized
        }
    });
}

function scrape (url) {
    return matchSource(url).then((matched) => {
        if (matched) {
            return scrape.scrapeUrlWithSource(url, matched.url, true).then((result) => {
                var sentences = pullSentencesFromBody(result.body);
                if (sentences == null) {
                    sentences = [];
                }
                var toCreate =  {
                    url: url,
                    body: result.body,
                    source: matched,
                    sentences: sentences,
                    headline: result.title,
                };
                if (!toCreate.body || !toCreate.body.length) {
                    return null;
                } else {
                    return store.newArticle(article, topic_obj.id, source.id, true).then((article_obj) => {
                    }, (article_failure) => {
                        throw article_failure;
                    });
                }
            });
        }
    });
}

function propagateBias (article_id, threshold) {
    return schema.models.sentence.findAll({
        attributes: ['id', 'bias'],
        where: {
            'articleId': article_id,
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
        });
    });
}

function runLSTM (article_obj) {
    var post = Promise.promisify(request.post);

    return post(ML_URL + ML_ROUTE,
        { json: { id: article_obj.id } } ).then((err, resp, body) => {
        if (!err && resp.statusCode == 200) {
            return true;
        } else {
            return false;
        }
    });
}

function liveBias (url, threshold) {
    return scrape(url).then((article_obj) => {
        if (article_obj) {
            // do machine learning calls here
            return runLSTM(article_obj).then((result) => {
                if (result) {
                    return propagateBias(article_obj.id, threshold).then(() => {
                        return article_obj.id;
                    });
                } else {
                    // error
                }
            })
        } else {
            // error
        }
    });
}