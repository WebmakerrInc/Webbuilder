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

    const parseTemplateContent = (rawHtml) => {
        if (!rawHtml || !rawHtml.trim()) {
            return { html: '', css: '' };
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');
        const styleNodes = doc.querySelectorAll('style');
        let combinedCss = '';

        styleNodes.forEach((styleNode) => {
            combinedCss += (styleNode.innerHTML || '') + '\n';
            styleNode.remove();
        });

        const html = doc.body ? doc.body.innerHTML.trim() : rawHtml.trim();

        return {
            html,
            css: combinedCss.trim(),
        };
    };

    const namespace = typeof window.Webbuilder !== 'undefined' ? window.Webbuilder : null;
    const createRegistry = namespace && typeof namespace.useTemplateRegistry === 'function'
        ? namespace.useTemplateRegistry
        : null;
    const TemplateSelector = namespace && typeof namespace.TemplateSelector === 'function'
        ? namespace.TemplateSelector
        : null;
    const loadTemplateFile = namespace && typeof namespace.loadTemplate === 'function'
        ? namespace.loadTemplate
        : null;

    if (TemplateSelector && createRegistry && loadTemplateFile && templateSelect && pageSelect && loadButton) {
        const registry = createRegistry(builderData.registry || []);

        if (!registry.hasTemplates) {
            setNotice(builderData.messages.noTemplates, 'error');
        }

        const selector = new TemplateSelector({
            registry,
            businessSelect: templateSelect,
            templateSelect: pageSelect,
            loadButton,
            onLoad: (entry) => {
                clearNotice();
                return loadTemplateFile(entry.path);
            },
            onLoadSuccess: (html) => {
                const parsed = parseTemplateContent(html);

                editor.CssComposer.getAll().reset();
                editor.setStyle('');

                if (parsed.html) {
                    editor.setComponents(parsed.html);
                }

                if (parsed.css) {
                    editor.setStyle(parsed.css);
                }

                setNotice(builderData.messages.loadSuccess, 'success');
            },
            onLoadError: (error) => {
                if (window.console && typeof window.console.error === 'function') {
                    window.console.error('Template load failed', error);
                }
                setNotice(builderData.messages.loadError, 'error');
            },
            onInvalidSelection: () => {
                setNotice(builderData.messages.loadError, 'error');
            },
        });

        selector.init();

        templateSelect.addEventListener('change', clearNotice);
        pageSelect.addEventListener('change', clearNotice);
    } else if (noticeEl && (!builderData.registry || builderData.registry.length === 0)) {
        setNotice(builderData.messages.noTemplates, 'error');
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
