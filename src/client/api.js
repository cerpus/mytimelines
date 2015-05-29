var request = require('superagent');
var _       = require('lodash');

var API_URL = '/api/';
var TIMEOUT = 10000;

module.exports = {
    getEntityData : function (entity, data) {
        return get(makeUrl(entity), parseData(data));
    },
    postEntityData : function (entity, data) {
        return post(makeUrl(entity), parseData(data));
    },
    deleteEntityData : function (entity, data) {
        return del(makeUrl(entity), parseData(data));
    },
    updateEntityData : function (entity, data) {
        return patch(makeUrl(entity), parseData(data));
    },
    parseOpenGraph : function (url) {
        return request.post('/api/opengraph').type('form').send({ url : url }).timeout(TIMEOUT);
    }
};

function makeUrl(part) {
    return API_URL + part;
}

function get(url, query) {
    return request
        .get(url)
        .query(query)
        .timeout(TIMEOUT);
}

function post(url, data) {
    return request
        .post(url)
        .type('form')
        .send(data)
        .timeout(TIMEOUT);
}

function del(url, data) {
    return request
        .del(url)
        .type('form')
        .send(data)
        .timeout(TIMEOUT);
}

function patch(url, data) {
    return request
        .patch(url)
        .type('form')
        .send(data)
        .timeout(TIMEOUT);
}

function parseData(data) {
    var attributes = {};

    if (!data) { return false; }

    if (!data.attributes) {
        data.attributes = {};
    }

    _.mapValues(data.attributes, function (value, key) {
        attributes[key + '_'] = value;
    });

    return _.merge(_.omit(data, 'attributes'), attributes);
};


