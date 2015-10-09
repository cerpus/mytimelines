'use strict';

import _ from 'lodash';

export function flattenTimespan(timespan) {
    const data =       timespan[0];
    const attributes = timespan[1];

    return {
        id:       data.id,
        beginMin: data.beginMin,
        endMax:   data.endMax,
        parent:   data.parent,
        attributes : {
            title:       getValue(attributes, 'title'),
            type:        getValue(attributes, 'type'),
            description: getValue(attributes, 'description'),
            media:       getValue(attributes, 'media')
        }
    };

    function getValue(attributes, key) {
        const value = _(attributes)
                  .filter({ name : key })
                  .pluck('value')
                  .value().toString();

        return value;
    }
}

export function resetTimelineElement() {
    const timeline = document.getElementById('timeline');

    if (timeline) {
        timeline.innerHTML = '';
        timeline.removeAttribute('style');
        timeline.removeAttribute('class');
    }
}
