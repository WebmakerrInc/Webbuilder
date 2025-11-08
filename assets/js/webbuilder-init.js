(function ($) {
    'use strict';

    const initEditor = () => {
        const container = document.getElementById('webbuilder-editor');

        if (!container) {
            return null;
        }

        return grapesjs.init({
            container: '#webbuilder-editor',
            height: 'calc(100vh - 140px)',
            fromElement: false,
            storageManager: false,
            styleManager: { clearProperties: true }
        });
    };

    const editor = initEditor();

    if (!editor || typeof webbuilderData === 'undefined') {
        return;
    }

    const templateSelect = document.getElementById('webbuilder-template-select');
    const pageSelect = document.getElementById('webbuilder-page-select');
    const loadButton = document.getElementById('webbuilder-load-template');
    const saveButton = document.getElementById('webbuilder-save-page');
    const noticeEl = document.getElementById('webbuilder-notice');
    const postId = parseInt(webbuilderData.postId, 10) || 0;
    const restBase = typeof webbuilderData.restUrl === 'string' ? webbuilderData.restUrl : '';
    const restNonce = typeof webbuilderData.restNonce === 'string' ? webbuilderData.restNonce : '';

    const setNotice = (message, type = 'success') => {
        if (!noticeEl) {
            return;
        }

        noticeEl.textContent = message;
        noticeEl.classList.remove('is-success', 'is-error');
        noticeEl.classList.add(type === 'success' ? 'is-success' : 'is-error');
    };

    const clearNotice = () => {
        if (!noticeEl) {
            return;
        }

        noticeEl.textContent = '';
        noticeEl.classList.remove('is-success', 'is-error');
    };

    const requestTemplate = (template, page) => {
        const params = new URLSearchParams();
        params.append('action', 'webbuilder_load_template');
        params.append('template', template);
        params.append('page', page);
        params.append('_ajax_nonce', webbuilderData.nonce);

        return fetch(webbuilderData.ajaxUrl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: params.toString(),
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
    };

    const toggleButtonState = (button, isLoading) => {
        if (!button) {
            return;
        }

        if (isLoading) {
            button.classList.add('is-loading');
            button.setAttribute('disabled', 'disabled');
        } else {
            button.classList.remove('is-loading');
            button.removeAttribute('disabled');
        }
    };

    const getRestEndpoint = () => {
        if (!restBase) {
            return '';
        }

        return `${restBase}pages/${postId}`;
    };

    const loadExistingContent = () => {
        if (!postId || !restBase || !restNonce) {
            return Promise.resolve();
        }

        return fetch(getRestEndpoint(), {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-WP-Nonce': restNonce,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Unable to load existing content');
                }

                return response.json();
            })
            .then((data) => {
                if (!data) {
                    return;
                }

                if (data.html) {
                    editor.setComponents(data.html);
                }

                if (data.css) {
                    editor.setStyle(data.css);
                }
            })
            .catch(() => {
                setNotice(webbuilderData.messages.loadExistingError, 'error');
            });
    };

    const savePageContent = () => {
        if (!postId || !restBase || !restNonce) {
            return;
        }

        clearNotice();
        toggleButtonState(saveButton, true);

        const payload = {
            html: editor.getHtml(),
            css: editor.getCss(),
        };

        fetch(getRestEndpoint(), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': restNonce,
            },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Unable to save');
                }

                return response.json();
            })
            .then((data) => {
                if (!data || (data.success !== true && data.success !== 'true')) {
                    throw new Error('Save failed');
                }

                setNotice(webbuilderData.messages.saveSuccess, 'success');
            })
            .catch(() => {
                setNotice(webbuilderData.messages.saveError, 'error');
            })
            .finally(() => {
                toggleButtonState(saveButton, false);
            });
    };

    if (loadButton) {
        loadButton.addEventListener('click', () => {
            if (!templateSelect || !pageSelect) {
                return;
            }

            clearNotice();

            const template = templateSelect.value;
            const page = pageSelect.value;

            if (!template || !page) {
                setNotice(webbuilderData.messages.loadError, 'error');
                return;
            }

            loadButton.classList.add('is-loading');
            loadButton.setAttribute('disabled', 'disabled');

            requestTemplate(template, page)
                .then((response) => {
                    if (!response || !response.success) {
                        throw new Error('Invalid response');
                    }

                    editor.setComponents(response.data ? response.data.html : response.html);
                    setNotice(webbuilderData.messages.loadSuccess, 'success');
                })
                .catch(() => {
                    setNotice(webbuilderData.messages.loadError, 'error');
                })
                .finally(() => {
                    loadButton.classList.remove('is-loading');
                    loadButton.removeAttribute('disabled');
                });
        });
    }

    if (saveButton) {
        if (!postId || !restBase || !restNonce) {
            saveButton.classList.add('is-disabled');
            saveButton.setAttribute('disabled', 'disabled');
        } else {
            saveButton.addEventListener('click', savePageContent);
            loadExistingContent();
        }
    } else {
        loadExistingContent();
    }
})(jQuery);
