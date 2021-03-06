'use strict';

var _ = require('lodash');

module.exports = {
    flattenTimespan : flattenTimespan
};

function flattenTimespan(timespan) {
    var data       = timespan[0];
    var attributes = timespan[1];

    return {
        id         : data.id,
        beginMin   : data.beginMin,
        endMax     : data.endMax,
        parent     : data.parent,
        attributes : {
            title       : getValue(attributes, 'title'),
            type        : getValue(attributes, 'type'),
            description : getValue(attributes, 'description'),
            media       : getValue(attributes, 'media')
        }
    };

    function getValue(attributes, key) {
        var value = _(attributes)
                .filter({ name : key })
                .pluck('value')
                .value().toString();

        return value;
    }
}
