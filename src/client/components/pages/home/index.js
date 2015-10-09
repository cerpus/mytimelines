'use strict';

import {h} from 'mercury';

import Router from 'mytimelines/client/libs/router';
import {resetTimelineElement} from 'mytimelines/client/utils';

const TEXT = {
    heading: 'Get creative with time',
    ingress: 'Create your own timeline about whatever topic you want - share it, expand it and learn more about the things that YOU care about, in a brand new timetastic way!',
    body: 'With MyTimelines you can go even further than just creating a static timeline. Want to find other events that happened during the same period as yours? Well you can! You can even choose to add these events to your own timeline, or invite your friends to collaborate on your timelines. Got a history project you need to do? A visual overview of your travel history to compare with your friends? With MyTimelines, all this will soon be possible!'
};

export function render() {
    resetTimelineElement();

    return h('section.main', [
        h('.l-container', [
            h('.hugeLogo'),
            h('.informativeText', [
                h('h1.h-one', TEXT.heading),
                h('p.ingress', TEXT.ingress),
                h('p', TEXT.body)
            ]),
            h('.squigglyArt', [
                h('object.icon', {
                    type : 'image/svg+xml',
                    data : '/public/front-illu.svg'
                })
            ])
        ]),
        h('.lightMain', [
            Router.anchor({ className : 'getStarted', href : '/timelines' }, [
                h('object.icon', {
                    type : 'image/svg+xml',
                    data : '/public/get-started.svg'
                })
            ])
        ])
    ]);
}
