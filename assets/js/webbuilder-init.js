(function ($) {
    'use strict';

    const initEditor = () => {
        const container = document.getElementById('webbuilder-editor');

        if (!container) {
            return { editor: null, initialMarkup: '' };
        }

        const initialMarkup = container.innerHTML;
        container.innerHTML = '';

        const editorInstance = grapesjs.init({
            container: '#webbuilder-editor',
            height: 'calc(100vh - 140px)',
            fromElement: false,
            storageManager: false,
            styleManager: { clearProperties: true },
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

    const parseMarkup = (markup) => {
        const result = { html: '', css: '' };

        if (!markup || !markup.trim()) {
            return result;
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = markup;

        const styleNodes = wrapper.querySelectorAll('style');
        let combinedCss = '';

        styleNodes.forEach((styleNode) => {
            combinedCss += (styleNode.innerHTML || '') + '\n';
            styleNode.remove();
        });

        result.html = wrapper.innerHTML.trim();
        result.css = combinedCss.trim();

        return result;
    };

    const applyCss = (editorInstance, css) => {
        editorInstance.CssComposer.getAll().reset();
        editorInstance.setStyle(css && css.trim() ? css : '');
    };

    const applyDirectMarkup = (editorInstance, markupData) => {
        if (!markupData.html && !markupData.css) {
            editorInstance.setComponents('');
            editorInstance.setStyle('');
            return;
        }

        editorInstance.setComponents(markupData.html || '');
        applyCss(editorInstance, markupData.css || '');
    };

    const buildWrapperMarkup = (type, innerHtml) => {
        const isGlobal = type !== 'main';
        const classes = ['webbuilder-template-wrapper', `webbuilder-template-${type}`];

        if (isGlobal) {
            classes.push('webbuilder-global-slot');
        }

        const lockedAttr = isGlobal ? ' data-webbuilder-locked="1"' : '';
        const content = innerHtml && innerHtml.trim() ? innerHtml : '';

        return `<div data-webbuilder-template="${type}"${lockedAttr} class="${classes.join(' ')}">${content}</div>`;
    };

    const lockComponent = (component) => {
        if (!component) {
            return;
        }

        component.set({
            removable: false,
            copyable: false,
            draggable: false,
            droppable: false,
            selectable: false,
            hoverable: false,
            layerable: false,
            editable: false,
            highlightable: false,
        });
        component.addClass('webbuilder-locked-component');
    };

    const markMainComponent = (component) => {
        if (!component) {
            return;
        }

        component.set({
            removable: false,
            copyable: false,
            draggable: false,
            droppable: true,
        });
        component.addClass('webbuilder-main-wrapper');
    };

    const getMainWrapperComponent = (editorInstance) => {
        const results = editorInstance.DomComponents.getWrapper().find('[data-webbuilder-template="main"]');
        return results && results.length ? results[0] : null;
    };

    const injectStructure = (editorInstance, markupData, headerHtml, footerHtml) => {
        const wrapper = editorInstance.DomComponents.getWrapper();
        wrapper.components().reset();

        const fragments = [];

        if (headerHtml && headerHtml.trim()) {
            fragments.push(buildWrapperMarkup('header', headerHtml));
        }

        fragments.push(buildWrapperMarkup('main', markupData.html || ''));

        if (footerHtml && footerHtml.trim()) {
            fragments.push(buildWrapperMarkup('footer', footerHtml));
        }

        editorInstance.addComponents(fragments.join(''));

        const lockedComponents = editorInstance.DomComponents.getWrapper().find('[data-webbuilder-locked="1"]');
        lockedComponents.forEach(lockComponent);

        const mainComponent = getMainWrapperComponent(editorInstance);
        markMainComponent(mainComponent);

        applyCss(editorInstance, markupData.css || '');
    };

    const requestHeaderFooter = (ajaxUrl, postId, nonce) => {
        if (!ajaxUrl || !postId) {
            return Promise.resolve({ success: true, data: { header: '', footer: '' } });
        }

        const params = new URLSearchParams();
        params.append('action', 'webbuilder_get_header_footer');
        params.append('post_id', postId);

        if (nonce) {
            params.append('nonce', nonce);
        }

        return fetch(ajaxUrl, {
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

    const parseResponseHtml = (response) => {
        const html = response && response.data ? response.data.html : response && response.html ? response.html : '';
        return parseMarkup(html || '');
    };

    const getMainContentHtml = (editorInstance) => {
        const mainComponent = getMainWrapperComponent(editorInstance);

        if (!mainComponent) {
            return editorInstance.getHtml();
        }

        const mainHtml = mainComponent.toHTML();

        if (!mainHtml) {
            return '';
        }

        const parser = document.createElement('div');
        parser.innerHTML = mainHtml;
        const wrapperEl = parser.querySelector('[data-webbuilder-template="main"]');

        return wrapperEl ? wrapperEl.innerHTML : parser.innerHTML;
    };

    const buildContentForSave = (editorInstance, htmlContent) => {
        const css = editorInstance.getCss();
        return css && css.trim() ? `<style>${css}</style>${htmlContent}` : htmlContent;
    };

    const { editor, initialMarkup } = initEditor();

    if (!editor) {
        return;
    }

    const initialMarkupData = parseMarkup(initialMarkup);
    const builderData = typeof webbuilderData !== 'undefined' ? webbuilderData : null;
    const runtimeVars = typeof webbuilder_vars !== 'undefined' ? webbuilder_vars : null;
    const postType = runtimeVars && runtimeVars.post_type ? runtimeVars.post_type : '';
    const isPageContext = !!(runtimeVars && runtimeVars.post_id && postType === 'page');
    const runtimeMessages = builderData && builderData.messages ? builderData.messages : {};
    const starterTemplates = builderData && builderData.starterTemplates ? builderData.starterTemplates : {};
    const pluginUrl = builderData && builderData.pluginUrl ? builderData.pluginUrl : '';
    const fallbackStarter = {
        headers: 'templates-library/headers/classic.html',
        footers: 'templates-library/footers/basic.html',
    };

    const resolveStarterUrl = (filePath) => {
        if (!filePath) {
            return '';
        }

        const cleanBase = pluginUrl ? pluginUrl.replace(/\/+$/, '') : '';
        const cleanPath = filePath.replace(/^\/+/, '');

        return cleanBase ? `${cleanBase}/${cleanPath}` : cleanPath;
    };

    const fetchStarterTemplate = (filePath) => {
        const requestUrl = resolveStarterUrl(filePath);

        if (!requestUrl) {
            return Promise.reject(new Error('Missing starter file path.'));
        }

        return fetch(requestUrl, {
            method: 'GET',
            credentials: 'same-origin',
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return response.text();
        });
    };

    const openStarterModal = (groupKey, templatesConfig) => {
        const overlay = document.createElement('div');
        overlay.className = 'webbuilder-starter-overlay';

        const panel = document.createElement('div');
        panel.className = 'webbuilder-starter-panel';

        const title = document.createElement('h2');
        const titleText = groupKey === 'headers' ? runtimeMessages.starterHeaderTitle : runtimeMessages.starterFooterTitle;
        title.textContent = titleText || (groupKey === 'headers' ? 'Choose a header starter' : 'Choose a footer starter');
        panel.appendChild(title);

        const list = document.createElement('div');
        list.className = 'webbuilder-starter-list';

        let escListener = null;

        const removeOverlay = () => {
            if (overlay.parentNode) {
                overlay.remove();
            }

            if (escListener) {
                document.removeEventListener('keydown', escListener);
                escListener = null;
            }
        };

        Object.entries(templatesConfig).forEach(([templateKey, templateData]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'webbuilder-starter-item';
            button.textContent = (templateData && templateData.label) ? templateData.label : templateKey;

            button.addEventListener('click', () => {
                overlay.classList.add('is-busy');

                fetchStarterTemplate(templateData && templateData.file ? templateData.file : fallbackStarter[groupKey])
                    .then((html) => {
                        editor.setComponents(html || '');
                        applyCss(editor, '');
                        removeOverlay();
                    })
                    .catch(() => {
                        overlay.classList.remove('is-busy');
                        window.alert(runtimeMessages.starterLoadError || 'Unable to load the starter layout. Please try again.');
                    });
            });

            list.appendChild(button);
        });

        panel.appendChild(list);

        const skipButton = document.createElement('button');
        skipButton.type = 'button';
        skipButton.className = 'webbuilder-starter-skip';
        skipButton.textContent = runtimeMessages.starterSkip || 'Start from blank';
        skipButton.addEventListener('click', removeOverlay);
        panel.appendChild(skipButton);

        overlay.appendChild(panel);
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                removeOverlay();
            }
        });

        escListener = (event) => {
            if (event.key === 'Escape') {
                removeOverlay();
            }
        };

        document.addEventListener('keydown', escListener);
        document.body.appendChild(overlay);
    };

    const maybeShowStarterModal = () => {
        if (postType !== 'webbuilder_header' && postType !== 'webbuilder_footer') {
            return;
        }

        const hasInitialHtml = !!(initialMarkupData.html && initialMarkupData.html.trim());
        const hasInitialCss = !!(initialMarkupData.css && initialMarkupData.css.trim());

        if (hasInitialHtml || hasInitialCss) {
            return;
        }

        const groupKey = postType === 'webbuilder_header' ? 'headers' : 'footers';
        const templatesConfig = starterTemplates[groupKey] || {};
        const templateKeys = Object.keys(templatesConfig);

        if (templateKeys.length) {
            setTimeout(() => openStarterModal(groupKey, templatesConfig), 0);
            return;
        }

        const fallbackFile = fallbackStarter[groupKey];

        if (!fallbackFile) {
            return;
        }

        fetchStarterTemplate(fallbackFile)
            .then((html) => {
                if (!editor.getHtml().trim()) {
                    editor.setComponents(html || '');
                    applyCss(editor, '');
                }
            })
            .catch(() => {});
    };

    let structureReady = false;

    if (isPageContext) {
        requestHeaderFooter(runtimeVars.ajaxurl, runtimeVars.post_id, runtimeVars.layoutNonce)
            .then((result) => {
                if (result && result.success && result.data) {
                    injectStructure(editor, initialMarkupData, result.data.header || '', result.data.footer || '');
                    structureReady = true;
                }
            })
            .catch(() => {})
            .finally(() => {
                if (!structureReady) {
                    injectStructure(editor, initialMarkupData, '', '');
                    structureReady = true;
                }
            });
    } else {
        applyDirectMarkup(editor, initialMarkupData);
        maybeShowStarterModal();
    }

    if (!builderData) {
        return;
    }

    const templateSelect = document.getElementById('webbuilder-template-select');
    const pageSelect = document.getElementById('webbuilder-page-select');
    const loadButton = document.getElementById('webbuilder-load-template');
    const noticeEl = document.getElementById('webbuilder-notice');

    const setNotice = (message, type = 'success') => {
        if (!noticeEl) {
            return;
        }

        const messageText = message || '';
        noticeEl.textContent = messageText;
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
                setNotice(runtimeMessages.loadError, 'error');
                return;
            }

            if (isPageContext && !structureReady) {
                setNotice(runtimeMessages.loadError, 'error');
                return;
            }

            loadButton.classList.add('is-loading');
            loadButton.setAttribute('disabled', 'disabled');

            requestTemplate(template, page)
                .then((response) => {
                    if (!response || !response.success) {
                        throw new Error('Invalid response');
                    }

                    const markupData = parseResponseHtml(response);

                    if (isPageContext) {
                        const mainComponent = getMainWrapperComponent(editor);

                        if (mainComponent) {
                            const collection = mainComponent.components();
                            collection.reset();

                            if (markupData.html) {
                                collection.add(markupData.html);
                            }

                            applyCss(editor, markupData.css || '');
                        } else {
                            applyDirectMarkup(editor, markupData);
                        }
                    } else {
                        applyDirectMarkup(editor, markupData);
                    }

                    setNotice(runtimeMessages.loadSuccess, 'success');
                })
                .catch(() => {
                    setNotice(runtimeMessages.loadError, 'error');
                })
                .finally(() => {
                    loadButton.classList.remove('is-loading');
                    loadButton.removeAttribute('disabled');
                });
        });
    }

    if (runtimeVars) {
        const saveLabel = postType === 'webbuilder_header' || postType === 'webbuilder_footer' ? 'Save Template' : 'Save Page';

        editor.Panels.addButton('options', {
            id: 'save-page',
            className: 'fa fa-save',
            command: 'save-page',
            attributes: { title: saveLabel },
        });

        editor.Commands.add('save-page', {
            run: function (editorInstance) {
                const postID = runtimeVars.post_id;

                if (!postID) {
                    window.alert('⚠️ Cannot save: No post selected.');
                    return;
                }

                const htmlContent = isPageContext ? getMainContentHtml(editorInstance) : editorInstance.getHtml();
                const content = buildContentForSave(editorInstance, htmlContent);

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
