'use strict';

import hg, {h} from 'mercury';

import Router from 'mytimelines/client/libs/router';

// Import styleseets
import style from './header.css';
import layout from 'mytimelines/client/styles/layout.css';

const GITHUB_URL = 'https://github.com/cerpus/mytimelines';

export default function Header(route) {
    const state = hg.state({
        route: route
    });

    return state;
}

export function render({ route }) {
    return h('header', { className: style.root }, [
        h('div', { className: layout.container }, [
            h('div', { className: style.logo }),
            h('nav', { className: style.nav }, [
                link('/', 'Home', route === '/'),
                link('/timelines', 'Timelines', route === '/timelines'),
                h('span', { className: style.nav__item }, [
                    h('a', { href: GITHUB_URL }, 'Source code')
                ])
            ])
        ])
    ]);
};

function link(uri, text, isActive) {
    return h('span', {
        className : className(isActive)
    }, [
        Router.anchor({ href: uri }, text)
    ]);

    function className(isActive) {
        if (isActive) { return `${style.nav__item} ${style.active}`; }
        else          { return style.nav__item; }
    }
}
