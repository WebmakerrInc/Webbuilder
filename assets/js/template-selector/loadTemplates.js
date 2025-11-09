(function (global) {
    'use strict';

    var namespace = global.Webbuilder = global.Webbuilder || {};

    namespace.loadTemplate = function (path) {
        if (!path) {
            return Promise.reject(new Error('Missing template path.'));
        }

        return fetch(path, { credentials: 'same-origin' }).then(function (response) {
            if (!response.ok) {
                throw new Error('Unable to fetch template.');
            }

            return response.text();
        });
    };
})(window);
