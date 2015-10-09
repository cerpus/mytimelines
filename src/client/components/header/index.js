'use strict';

import hg, {h} from 'mercury';

import Router from 'mytimelines/client/libs/router';

const GITHUB_URL = 'https://github.com/cerpus/mytimelines';

export default function Header(route) {
    const state = hg.state({
        route: route
    });

    return state;
}

export function render({ route }) {
    return h('header.header', [
        h('div.l-container', [
            h('div.header-logo'),
            h('nav.mainNav', [
                link('/', 'Home', route === '/'),
                link('/timelines', 'Timelines', route === '/timelines'),
                h('span.mainNav-item', [
                    h('a', { href: GITHUB_URL }, 'Source code')
                ])
            ])
        ])
    ]);
};

function link(uri, text, isActive) {
    return h('span.mainNav-item', {
        className : isActive ? 'active' : ''
    }, [
        Router.anchor({ href: uri }, text)
    ]);
}
