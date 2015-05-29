'use strict';

var mercury  = require('mercury');
var source   = require('geval/source');
var window   = require('global/window');
var document = require('global/document');

module.exports = getRouter;

var cachedRouter = Router();

getRouter.atom   = cachedRouter;
getRouter.anchor = require('./anchor.js');
getRouter.render = require('./view.js');

function getRouter() {
    return cachedRouter;
}

function Router() {
    var inPopState = false;
    var popstates  = popstate();
    var atom       = mercury.value(String(document.location.pathname));

    popstates(onPopState);
    atom(onRouteSet);

    return atom;

    function onPopState(uri) {
        inPopState = true;
        atom.set(uri);
    }

    function onRouteSet(uri) {
        if (inPopState) {
            inPopState = false;
            return;
        }

        pushHistoryState(uri);
    }
}

function pushHistoryState(uri) {
    window.history.pushState(undefined, document.title, uri);
}

function popstate() {
    return source(function broadcaster(broadcast) {
        window.addEventListener('popstate', onPopState);

        function onPopState() {
            broadcast(String(document.location.pathname));
        }
    });
}
