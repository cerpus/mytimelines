'use strict';

var hg       = require('mercury');
var h        = hg.h;
var _        = require('lodash');
var moment   = require('moment');
var document = require('global/document');

var api = require('./api');

module.exports = TimespanItem;

function TimespanItem(item) {
    return hg.state({
        id         : hg.value( item.id ),
        beginMin   : hg.value( item.beginMin ),
        endMax     : hg.value( item.endMax ),
        parent     : hg.value( item.parent ),
        attributes : hg.struct({
            title       : hg.value(item.attributes.title),
            type        : hg.value(item.attributes.type),
            description : hg.value(item.attributes.description),
            url         : hg.value(item.attributes.url),
            media       : hg.value(item.attributes.media)
        }),
        timespans : hg.varhash( item.timespans || {}, TimespanItem ),
        handles   : {
            updateTimeline : updateTimeline,
            addTimespan    : addTimespan,
            deleteTimespan : deleteTimespan,
            updateTimespan : updateTimespan
        }
    });
}

function updateTimeline(state, data) {
    var timespanData = { timespan : state.id() };

    _.forEach(data, formatDataKeys);

    api.updateEntityData('timespans', timespanData).end(apiUpdateCallback);

    function formatDataKeys(value, key) {
        timespanData[key + '_'] = value;
    }

    function apiUpdateCallback() {
        _.forEach(data, setStateAttributes);
    }

    function setStateAttributes(value, key) {
        state.attributes[key].set(value);
    }
}

function addTimespan(state, data) {
    var newData = {
        clock    : 'TT',
        beginMin : dateToUnix(data.beginMin) || '',
        endMax   : data.endMax ? dateToUnix(data.endMax) : dateToUnix(data.beginMin),
        parent   : state.id(),
        attributes : {
            title       : data.title,
            description : data.description,
            type        : data.type,
            url         : data.url,
            media       : data.media
        }
    };

    api.postEntityData('timespans', newData).end(apiPostCallback);

    function apiPostCallback(res) {
        if (res.body.id) {
            newData.id = res.body.id;
            state.timespans.put(res.body.id, newData);
        }
    }
}

function dateToUnix(dateString) {
    var dateArray = dateString.split(',');
    var date = moment()
            .year(dateArray[0])
            .month(dateArray[1] -1 || 0)
            .date(dateArray[2] || '01');

    return date.unix();
}

function deleteTimespan(state, data) {
    api.deleteEntityData('timespans', { timespan : data.id }).end(apiDeleteCallback);

    function apiDeleteCallback() { state.timespans.delete(data.id); }
}

function updateTimespan(state, data) {
    var timespanAttributes = {};
    var timespanData = {
        timespan : data.timespan,
        parent   : data.parent,
        beginMin : dateToUnix(data.beginMin),
        endMax   : data.endMax ? dateToUnix(data.endMax) : dateToUnix(data.beginMin)
    };
    var timespanPostData = timespanData;

    delete data.timespan; delete data.beginMin; delete data.endMax;

    _.forEach(data, formatDataKeys);

    api.updateEntityData('timespans', timespanPostData).end(apiUpdateCallback);

    function formatDataKeys(value, key) {
        timespanPostData[key + '_'] = value;
        timespanAttributes[key] = value;
    }

    function apiUpdateCallback() {
        timespanData.id = timespanData.timespan;
        timespanData.attributes = timespanAttributes;

        delete timespanData.timespan;

        state.timespans.put(timespanData.id, TimespanItem(timespanData));
    }
}

TimespanItem.render = function render(timespan, anchor, handles, stateHandles) {
    return h('section.timespanItem', [
        h('span.timespanItem-title', timespan.attributes.title),
        h('div.timespanItem-tools', [
            toolsButton('edit', stateHandles.updateTimespanModal, timespan),
            toolsButton('delete', handles.deleteTimespan, timespan)
        ])
    ]);
};

TimespanItem.renderTimeline = function renderTimeline(timespan, anchor, parentHandles) {
    return h('section.timelineItem', [
        h('h1.h-two', [
            anchor(
                { href : '/timelines/' + timespan.id },
                timespan.attributes.title
            )
        ]),
        h('span.timelineItem-description', timespan.attributes.description),
        h('div.timelineItem-tools', [
            anchor({
                className : 'timelineItem-button',
                href      : '/timelines/' + timespan.id
            }, [
                h('object.icon', {
                    type : 'image/svg+xml',
                    data : '/public/icon-edit.svg'
                }),
                h('span.text', 'edit')
            ]),
            h('a.timelineItem-button', {
                href       : '#!',
                'ev-click' : hg.event(parentHandles.deleteTimeline, timespan)
            }, [
                h('object.icon', {
                    type : 'image/svg+xml',
                    data : '/public/icon-delete.svg'
                }),
                h('span.text', 'delete')
            ])
        ])
    ]);
};

function toolsButton(type, handler, timespan) {
    return h('a.timespanItem-button', {
        href       : '#!',
        'ev-click' : hg.event(handler, timespan)
    }, [
        h('object.icon', {
            type : 'image/svg+xml',
            data : '/public/icon-' + type + '.svg'
        })
    ]);
}
