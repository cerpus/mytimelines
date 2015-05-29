'use strict';

var h          = require('mercury').h;
var clickEvent = require('mercury').clickEvent;

var routeAtom = require('./index.js').atom;

module.exports = anchor;

function anchor(props, text) {
    var href = props.href;

    props.href = href;

    props['ev-click'] = clickEvent(pushState, null, {
        ctrl           : false,
        meta           : false,
        rightClick     : false,
        preventDefault : true
    });

    return h('a', props, text);

    function pushState() {
        routeAtom.set(href);
    }
}
