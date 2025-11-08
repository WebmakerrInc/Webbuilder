(function ($) {
    'use strict';

    const initEditor = () => {
        const container = document.getElementById('webbuilder-editor');

        if (!container) {
            return { editor: null, initialMarkup: '' };
        }

        const initialMarkup = container.innerHTML;
        container.innerHTML = '';

        const pluginUrl = (typeof webbuilderData !== 'undefined' && webbuilderData.pluginUrl) ? webbuilderData.pluginUrl : '';

        const canvasStyles = [
            pluginUrl ? `${pluginUrl}assets/vendor/grapesjs/grapes.min.css` : null,
            pluginUrl ? `${pluginUrl}assets/css/admin.css` : null,
            'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
        ].filter(Boolean);

        const editorInstance = grapesjs.init({
            container: '#webbuilder-editor',
            height: 'calc(100vh - 140px)',
            fromElement: false,
            storageManager: false,
            styleManager: { clearProperties: true },
            canvas: {
                styles: canvasStyles,
                scripts: []
            },
            plugins: [
                'gjs-blocks-basic',
                'grapesjs-plugin-forms',
                'grapesjs-navbar',
                'grapesjs-component-countdown',
                'grapesjs-style-flexbox'
            ],
            pluginsOpts: {
                'gjs-blocks-basic': {
                    flexGrid: true
                }
            }
        });

        return { editor: editorInstance, initialMarkup };
    };

    const { editor, initialMarkup } = initEditor();

    if (!editor) {
        return;
    }

    const applyInitialMarkup = (markup) => {
        if (!markup || !markup.trim()) {
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = markup;

        const styleNodes = wrapper.querySelectorAll('style');
        let combinedCss = '';

        styleNodes.forEach((styleNode) => {
            combinedCss += (styleNode.innerHTML || '') + '\n';
            styleNode.remove();
        });

        const html = wrapper.innerHTML.trim();

        if (html) {
            editor.setComponents(html);
        }

        if (combinedCss.trim()) {
            editor.setStyle(combinedCss);
        }
    };

    applyInitialMarkup(initialMarkup);

    const builderData = typeof webbuilderData !== 'undefined' ? webbuilderData : null;

    if (!builderData) {
        return;
    }

    const runtimeVars = typeof webbuilder_vars !== 'undefined' ? webbuilder_vars : null;

    const templateSelect = document.getElementById('webbuilder-template-select');
    const pageSelect = document.getElementById('webbuilder-page-select');
    const loadButton = document.getElementById('webbuilder-load-template');
    const noticeEl = document.getElementById('webbuilder-notice');

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
        params.append('_ajax_nonce', builderData.nonce);

        return fetch(builderData.ajaxUrl, {
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

    if (loadButton) {
        loadButton.addEventListener('click', () => {
            if (!templateSelect || !pageSelect) {
                return;
            }

            clearNotice();

            const template = templateSelect.value;
            const page = pageSelect.value;

            if (!template || !page) {
                setNotice(builderData.messages.loadError, 'error');
                return;
            }

            loadButton.classList.add('is-loading');
            loadButton.setAttribute('disabled', 'disabled');

            requestTemplate(template, page)
                .then((response) => {
                    if (!response || !response.success) {
                        throw new Error('Invalid response');
                    }

                    editor.CssComposer.getAll().reset();
                    editor.setStyle('');
                    editor.setComponents(response.data ? response.data.html : response.html);
                    setNotice(builderData.messages.loadSuccess, 'success');
                })
                .catch(() => {
                    setNotice(builderData.messages.loadError, 'error');
                })
                .finally(() => {
                    loadButton.classList.remove('is-loading');
                    loadButton.removeAttribute('disabled');
                });
        });
    }

    if (runtimeVars) {
        editor.Panels.addButton('options', {
            id: 'save-page',
            className: 'fa fa-save',
            command: 'save-page',
            attributes: { title: 'Save Page' },
        });

        editor.Commands.add('save-page', {
            run: function (editorInstance) {
                const postID = runtimeVars.post_id;

                if (!postID) {
                    window.alert('⚠️ Cannot save: No page selected.');
                    return;
                }

                const html = editorInstance.getHtml();
                const css = editorInstance.getCss();
                const content = css && css.trim() ? `<style>${css}</style>${html}` : html;

                const body = new URLSearchParams({
                    action: 'webbuilder_save_page',
                    post_id: postID,
                    content,
                    _webbuilder_used: '1'
                });

                fetch(runtimeVars.ajaxurl, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: body.toString(),
                })
                    .then((response) => response.json())
                    .then((result) => {
                        if (result && result.success) {
                            const message = result.data && result.data.message ? result.data.message : 'Page saved successfully!';
                            editorInstance.Modal.open({
                                title: '✅ Saved',
                                content: '<p style="padding:10px;">' + message + '</p>',
                            });
                            setTimeout(() => editorInstance.Modal.close(), 1500);
                        } else {
                            const errorMessage = result && result.data && result.data.message ? result.data.message : 'Save failed.';
                            window.alert('❌ Save failed: ' + errorMessage);
                        }
                    })
                    .catch(() => {
                        window.alert('⚠️ Network error while saving.');
                    });
            },
        });

        editor.Panels.addButton('options', {
            id: 'preview-page',
            className: 'fa fa-eye',
            command: 'preview-page',
            attributes: { title: 'Preview Page' },
        });

        editor.Commands.add('preview-page', {
            run: function () {
                if (runtimeVars.preview_url) {
                    window.open(runtimeVars.preview_url, '_blank');
                } else {
                    window.alert('⚠️ Preview URL is not available.');
                }
            },
        });
    }
})(jQuery);
