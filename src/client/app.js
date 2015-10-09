'use strict';

var mercury  = require('mercury');
var _        = require('lodash');
var document = require('global/document');
var window   = require('global/window');

var api             = require('./api');
var utils           = require('./utils');
var flattenTimespan = utils.flattenTimespan;
var TimelineApp     = require('./timeline-app');
var TimespanItem    = require('./timespan-item');

require('./styles/global.css');

module.exports = App;

function App() {
    var state = {
        timelines : []
    };

    var timelineApp = TimelineApp(state);

    return timelineApp;
}

App.render = TimelineApp.render;

var app = App();
mercury.app(document.body, app, App.render);

app.timelines(function (value) { console.log('Timelines state changed:', value); });
app.forms(function (value) { console.log('Forms state changed:', value); });

api.getEntityData('timespans').end(function (res) {
    _.chain(res.body).map(function (timeline) {
        var timeline = flattenTimespan(timeline);
        timeline.timespans = {};

        api.getEntityData('timespans', { parent : timeline.id })
            .end(function (childRes) {
                _.chain(childRes.body).map(function (timespan) {
                    var timespan = flattenTimespan(timespan);

                    timeline.timespans[timespan.id] = timespan;
                });
                app.timelines.put(timeline.id, TimespanItem(timeline));
            });
    });
});
