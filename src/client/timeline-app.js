'use strict';

var hg       = require('mercury');
var h        = hg.h;
var _        = require('lodash');
var document = require('global/document');
var moment   = require('moment');

var Router          = require('./libs/router/');
var api             = require('./api');
var utils           = require('./utils');
var flattenTimespan = utils.flattenTimespan;
var TimespanItem    = require('./timespan-item');
import Header, {render as HeaderRender} from './components/header';

module.exports = TimelineApp;

function TimelineApp(data) {
    var route = Router();

    var state = hg.state({
        header: Header(route),
        timelines : hg.varhash(data.timelines || {}, TimespanItem),
        route     : route,
        forms : hg.struct({
            event : hg.struct({
                url         : hg.value(''),
                title       : hg.value(''),
                description : hg.value(''),
                media       : hg.value(''),
                beginMin    : hg.value(moment().format('YYYY,MM,DD')),
                endMax      : hg.value('')
            }),
            timeline : hg.struct({
                title       : hg.value(''),
                description : hg.value('')
            })
        }),
        editModal : hg.struct({
            visible    : hg.value(false),
            timespanID : hg.value(false),
            parentID   : hg.value(false)
        }),
        handles : {
            addTimeline             : addTimeline,
            deleteTimeline          : deleteTimeline,
            updateTimeline          : updateTimeline,
            updateTimespanModal     : updateTimespanModal,
            closeTimespanModal      : closeTimespanModal,
            addEventFormValues      : addEventFormValues,
            resetEventFormValues    : resetEventFormValues,
            resetTimelineFormValues : resetTimelineFormValues
        }
    });

    return state;
}

function addTimeline(state, data) {
    var postData = {
        clock      : '<~>',
        beginMin   : 0,
        endMax     : 0,
        attributes : data
    };

    postData.attributes.type = 'timeline';

    api.postEntityData('timespans', postData)
        .end(function (res) {
            postData.id = res.body.id;

            state.timelines.put(postData.id, TimespanItem(postData));
        });
}

function deleteTimeline(state, data) {
    api.deleteEntityData('timespans', { timespan : data.id })
        .end(function (res) {
            state.timelines.delete(data.id);
        });
}

function updateTimeline(state, data, id) {
    api.updateEntityData('timespans', _.merge(data, { timespan : data.id }))
        .end(function (res) {
            state.timelines.put(data.id, data);
        });
}

function updateTimespanModal(state, timespan) {
    state.editModal.set({
        visible    : true,
        timespanID : timespan.id,
        parentID   : timespan.parent
    });
}

function closeTimespanModal(state) {
    state.editModal.set({
        visible    : false,
        timespanID : false,
        parentID   : false
    });
}

function addEventFormValues(state, data) {
    api.parseOpenGraph(data.url).end(apiParseOGCallback);

    function apiParseOGCallback(res) {
        state.forms.event.title.set(res.body.title || '');
        state.forms.event.description.set(res.body.description || '');
        state.forms.event.media.set(setMedia());

        function setMedia() {
            if      (res.body.video) { return res.body.video.url; }
            else if (res.body.image) { return res.body.image.url; }
            else                     { return ''; }
        }
    }
}

function resetEventFormValues(state) {
    var eventFormValues = {
        url         : '',
        title       : '',
        description : '',
        media       : '',
        beginMin    : moment().format('YYYY,MM,DD'),
        endMax      : ''
    };

    state.forms.event.set(eventFormValues);
}

function resetTimelineFormValues(state) {
    var timelineFormValues = {
        title       : '',
        description : ''
    };

    state.forms.timeline.set(timelineFormValues);
}

TimelineApp.render = function render(state) {
    return h('.mytimelines-wrapper', [
        hg.partial(HeaderRender, state.header),
        Router.render(state.route, {
            '/' : function (params) {
                if (document.getElementById('timeline')) {
                    document.getElementById('timeline').innerHTML = '';
                    document.getElementById('timeline').removeAttribute('style');
                    document.getElementById('timeline').removeAttribute('class');
                }

                return homeView();
            },
            '/timelines' : function () {
                return hg.partial(timelinesListView, state);
            },
            '/timelines/:id' : function (params) {
                return hg.partial(timelineView, state, params.id);
            }
        }),
        h('#timeline.timeline'),
        hg.partial(editModal, state)
    ]);
};

function homeView() {
    return [h('section.main', h('.l-container', [
        h('.hugeLogo'),
        h('.informativeText', [
            h('h1.h-one', 'Get creative with time'),
            h('p.ingress', 'Create your own timeline about whatever topic you want - share it, expand it and learn more about the things that YOU care about, in a brand new timetastic way!'),
            h('p', 'With MyTimelines you can go even further than just creating a static timeline. Want to find other events that happened during the same period as yours? Well you can! You can even choose to add these events to your own timeline, or invite your friends to collaborate on your timelines. Got a history project you need to do? A visual overview of your travel history to compare with your friends? With MyTimelines, all this will soon be possible!')
        ]),
        h('.squigglyArt', [
            h('object.icon', {
                type : 'image/svg+xml',
                data : '/public/front-illu.svg'
            })
        ])
    ])), h('.lightMain', [
        Router.anchor({ className : 'getStarted', href : '/timelines' }, [h('object.icon', {
            type : 'image/svg+xml',
            data : '/public/get-started.svg'
        })])
    ])];
}

function mainSection(elements) {
    return h('section.main', [
        h('div.l-container', elements)
    ]);
}

function timelinesListView(state) {
    if (document.getElementById('timeline')) {
        document.getElementById('timeline').innerHTML = '';
        document.getElementById('timeline').removeAttribute('style');
        document.getElementById('timeline').removeAttribute('class');
    }

    return mainSection([
        h('div.g-twelve-col', [
            h('h1.h-one', 'Your timelines')
        ]),
        h('div.g-eight-col', [
            _.toArray(state.timelines).map(function (timespan) {
                return TimespanItem.renderTimeline(
                    timespan,
                    Router.anchor,
                    state.handles
                );
            })
        ]),
        h('div.g-four-col', [
            addTimelineSection(state)
        ])
    ]);
}

function addTimelineSection(state) {
    return h('form.timelineForm', {
        'ev-event': [hg.submitEvent(state.handles.addTimeline), hg.submitEvent(state.handles.resetTimelineFormValues)]
    }, [
        h('h2.h-two', 'New timeline'),
        h('input.timelineForm-input', {
            value       : state.forms.timeline.title,
            type        : 'text',
            placeholder : 'Title',
            name        : 'title'
        }),
        h('textarea.timelineForm-input', {
            value       : state.forms.timeline.description,
            type        : 'text',
            placeholder : 'Timeline description.',
            name        : 'description',
            rows        : 4
        }),
        h('input.timelineForm-input.timelineForm-submit', {
            type  : 'submit',
            value : 'Create timeline'
        })
    ]);
}

function timelineView(state, id) {
    if (state.timelines[id] === undefined) {
        return mainSection(
            h('div.g-twelve-col', [h('h1.h-one', 'Create timeline')])
        );
    }

    var storySource = { timeline : {
        headline : state.timelines[id].attributes.title,
        type     : 'default',
        text     : state.timelines[id].attributes.description,
        date     : []
    }};

    _.toArray(state.timelines[id].timespans)
        .map(function (timespan) {
            var storyEvent = {
                headline : timespan.attributes.title,
                text     : timespan.attributes.description
            };

            if (timespan.beginMin) {
                var beginMin = moment.unix(timespan.beginMin);

                storyEvent.startDate = beginMin.year() + ','
                    + (beginMin.month() + 1) + ','
                    + beginMin.date();
            }

            if (!(timespan.endMax === timespan.beginMin)) {
                var endMax = moment.unix(timespan.endMax);

                storyEvent.endDate = endMax.year() + ','
                    + (endMax.month() + 1) + ','
                    + endMax.date();
            }

            if (timespan.attributes.media) {
                storyEvent.asset = { media : timespan.attributes.media };
            }

            storySource.timeline.date.push(storyEvent);
        });

    document.getElementById('timeline').innerHTML = '';
    createStoryJS({
        type     : 'timeline',
        width    : '100%',
        height   : '600',
        source   : storySource,
        embed_id : 'timeline'
    });

    return mainSection([
        h('div.g-twelve-col', [
            h('h1.h-one', 'Create timeline')
        ]),
        h('div.g-eight-col', [
            h('div.timelineEdit', [
                h('input.timelineEdit-title', {
                    value     : state.timelines[id].attributes.title,
                    name      : 'title',
                    'ev-blur' : hg.valueEvent(state.timelines[id].handles.updateTimeline)
                }),
                h('textarea.timelineEdit-description', {
                    value     : state.timelines[id].attributes.description,
                    name      : 'description',
                    rows      : 4,
                    'ev-blur' : hg.valueEvent(state.timelines[id].handles.updateTimeline)
                })
            ]),
            _.toArray(state.timelines[id].timespans).map(function (timespan) {
                return TimespanItem.render(
                    timespan,
                    Router.anchor,
                    state.timelines[id].handles,
                    state.handles
                );
            })
        ]),
        h('div.g-four-col', [
            h('div.timelineForm', [
                h('h2.h-two', "New event"),
                h('form', {
                    'ev-event' : hg.submitEvent(state.handles.addEventFormValues)
                }, [
                    h('input.timelineForm-input-special', {
                        placeholder : 'URL',
                        value       : state.forms.event.url,
                        name        : 'url'
                    }),
                    h('input.timelineForm-button-special.timelineForm-submit', {
                        type  : 'submit',
                        value : 'Parse'
                    })
                ]),
                h('form', {
                    'ev-event' : [
                        hg.submitEvent(state.timelines[id].handles.addTimespan),
                        hg.submitEvent(state.handles.resetEventFormValues)
                    ]
                }, [
                    h('input.timelineForm-input', {
                        value       : state.forms.event.title,
                        placeholder : 'Title',
                        name        : 'title'
                    }),
                    h('textarea.timelineForm-input', {
                        value       : state.forms.event.description,
                        placeholder : 'Event description',
                        name        : 'description',
                        rows        : 4
                    }),
                    h('input.timelineForm-input', {
                        value       : state.forms.event.media,
                        placeholder : 'Media (url to image/youtube)',
                        name        : 'media'
                    }),
                    h('input.timelineForm-input-half', {
                        value       : state.forms.event.beginMin,
                        placeholder : 'YYYY,MM,DD',
                        name        : 'beginMin'
                    }),
                    h('input.timelineForm-input-half.timelineForm-input-half--right', {
                        value       : state.forms.event.endMax,
                        placeholder : 'YYYY,MM,DD',
                        name        : 'endMax'
                    }),
                    h('input', {
                        value  : id,
                        name   : 'timespan',
                        hidden : true
                    }),
                    h('input.timelineForm-input.timelineForm-submit', {
                        type  : 'submit',
                        value : 'Create event'
                    })
                ])
            ])
        ])
    ]);
}

function editModal(state) {
    var timespanID = state.editModal.timespanID;
    var parentID   = state.editModal.parentID;

    return h('.modal', { className : state.editModal.visible ? 'active' : '' }, [
        h('.modal-content', [
            h('div.timelineForm', [
                h('h2.h-two', "Edit event"),
                h('button.timelineForm-close', { 'ev-click' : hg.clickEvent(state.handles.closeTimespanModal, state) },
                  h('object.icon', {
                      type : 'image/svg+xml',
                      data : '/public/icon-delete.svg'
                  })
                 ),
                h('form', {
                    'ev-event' : [
                        parentID ? hg.submitEvent(state.timelines[parentID].handles.updateTimespan) : hg.submitEvent(state.handles.closeTimespanModal),
                        hg.submitEvent(state.handles.closeTimespanModal),
                    ]
                }, [
                    h('input.timelineForm-input', {
                        value       : timespanID ? state.timelines[parentID].timespans[timespanID].attributes.title : '',
                        placeholder : 'Title',
                        name        : 'title'
                    }),
                    h('textarea.timelineForm-input', {
                        value       : timespanID ? state.timelines[parentID].timespans[timespanID].attributes.description : '',
                        placeholder : 'Event description',
                        name        : 'description',
                        rows        : 4
                    }),
                    h('input.timelineForm-input', {
                        value       : timespanID ? state.timelines[parentID].timespans[timespanID].attributes.media : '',
                        placeholder : 'Media (url to image/youtube)',
                        name        : 'media'
                    }),
                    h('input.timelineForm-input-half', {
                        value       : timespanID ? moment(state.timelines[parentID].timespans[timespanID].beginMin * 1000).format('YYYY,MM,DD') : '',
                        placeholder : 'YYYY,MM,DD',
                        name        : 'beginMin'
                    }),
                    h('input.timelineForm-input-half.timelineForm-input-half--right', {
                        value       : timespanID && !(state.timelines[parentID].timespans[timespanID].endMax === state.timelines[parentID].timespans[timespanID].beginMin )? moment(state.timelines[parentID].timespans[timespanID].endMax * 1000).format('YYYY,MM,DD') : '',
                        placeholder : 'YYYY,MM,DD',
                        name        : 'endMax'
                    }),
                    h('input', {
                        value  : timespanID ? timespanID : false,
                        name   : 'timespan',
                        hidden : true
                    }),
                    h('input', {
                        value  : parentID ? parentID : false,
                        name   : 'parent',
                        hidden : true
                    }),
                    h('input.timelineForm-input.timelineForm-submit', {
                        type  : 'submit',
                        value : 'Update event'
                    })
                ])
            ])
        ])
    ]);
}
