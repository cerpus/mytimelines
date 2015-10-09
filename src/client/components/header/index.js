'use strict';

import hg, {h} from 'mercury';

import Router from 'mytimelines/client/libs/router';

// Import styleseets
import style from './header.css';
import layout from 'mytimelines/client/styles/layout.css';

console.log(style);

const GITHUB_URL = 'https://github.com/cerpus/mytimelines';

export default function Header(route) {
    const state = hg.state({
        route: route
    });

    return state;
}

export function render({ route }) {
    return h(`header.${style.root}`, [
        h(`div.${layout.container}`, [
            h(`div.${style.logo}`),
            h(`nav.${style.nav}`, [
                link('/', 'Home', route === '/'),
                link('/timelines', 'Timelines', route === '/timelines'),
                h(`span.${style.nav__item}`, [
                    h('a', { href: GITHUB_URL }, 'Source code')
                ])
            ])
        ])
    ]);
};

function link(uri, text, isActive) {
    return h(`span.${style.nav__item}`, {
        className : isActive ? style.active : ''
    }, [
        Router.anchor({ href: uri }, text)
    ]);
}
