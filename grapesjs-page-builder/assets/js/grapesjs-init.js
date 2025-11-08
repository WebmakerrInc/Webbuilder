(function () {
  'use strict';

  var getStrings = function () {
    var defaults = {
      saveSuccess: 'Saved successfully.',
      saveError: 'An error occurred while saving. Please try again.',
    };

    if (typeof window.grapesjsPageBuilder === 'undefined') {
      return defaults;
    }

    var strings = window.grapesjsPageBuilder.strings || {};

    return {
      saveSuccess: strings.saveSuccess || defaults.saveSuccess,
      saveError: strings.saveError || defaults.saveError,
    };
  };

  var setStatusMessage = function (element, message, type) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.classList.remove('grapesjs-status--success', 'grapesjs-status--error');

    if (type) {
      element.classList.add('grapesjs-status--' + type);
    }
  };

  var initEditors = function () {
    if (typeof window.grapesjs === 'undefined') {
      // eslint-disable-next-line no-console
      console.error('GrapesJS Page Builder: grapesjs library is not available.');
      return;
    }

    var containers = document.querySelectorAll('[data-grapesjs-editor]');
    var strings = getStrings();

    containers.forEach(function (container, index) {
      if (container.dataset.gjsInit === 'true') {
        return;
      }

      if (!container.id) {
        container.id = 'grapesjs-editor-' + index;
      }

      var editor = window.grapesjs.init({
        container: '#' + container.id,
        fromElement: true,
        height: '100vh',
        width: 'auto',
        storageManager: false,
        noticeOnUnload: false,
        plugins: [
          'gjs-blocks-basic',
          'grapesjs-plugin-forms',
          'grapesjs-navbar',
          'grapesjs-component-countdown',
          'grapesjs-style-flexbox',
        ],
        pluginsOpts: {
          'gjs-blocks-basic': {
            flexGrid: true,
          },
        },
      });

      editor.BlockManager.add('gjs-hero-section', {
        label: 'Hero Section',
        category: 'Sections',
        attributes: {
          class: 'gjs-fonts gjs-f-hero',
          title: 'Add a hero section',
        },
        content:
          '<section style="padding:50px;text-align:center;background:#f4f4f4;">' +
          '<h1>Welcome to GrapesJS Page Builder</h1>' +
          '<p>Edit this section or drag new blocks from the left panel.</p>' +
          '</section>',
      });

      var postId = parseInt(container.dataset.postId || '0', 10);
      var saveButtonSelector = container.dataset.saveButton || '';
      var saveStatusSelector = container.dataset.saveStatus || '';
      var saveButton = saveButtonSelector ? document.querySelector(saveButtonSelector) : null;
      var saveStatus = saveStatusSelector ? document.querySelector(saveStatusSelector) : null;

      if (
        saveButton &&
        postId > 0 &&
        typeof window.grapesjsPageBuilder !== 'undefined' &&
        window.grapesjsPageBuilder.ajaxUrl
      ) {
        saveButton.addEventListener('click', function (event) {
          event.preventDefault();

          setStatusMessage(saveStatus, '');
          saveButton.disabled = true;

          var params = new window.URLSearchParams();
          params.append('action', 'grapesjs_save_content');
          params.append('nonce', window.grapesjsPageBuilder.nonce || '');
          params.append('post_id', String(postId));
          params.append('content', editor.getHtml());

          fetch(window.grapesjsPageBuilder.ajaxUrl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: params.toString(),
          })
            .then(function (response) {
              if (!response.ok) {
                throw new Error('HTTP status ' + response.status);
              }

              return response.json();
            })
            .then(function (payload) {
              if (!payload || payload.success !== true) {
                var errorMessage = (payload && payload.data && payload.data.message) || strings.saveError;
                throw new Error(errorMessage);
              }

              setStatusMessage(saveStatus, strings.saveSuccess, 'success');
            })
            .catch(function (error) {
              // eslint-disable-next-line no-console
              console.error('GrapesJS Page Builder:', error);
              var message = error && error.message ? error.message : strings.saveError;
              setStatusMessage(saveStatus, message, 'error');
            })
            .finally(function () {
              saveButton.disabled = false;
            });
        });
      }

      container.dataset.gjsInit = 'true';
      container.__grapesjsInstance = editor;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditors);
  } else {
    initEditors();
  }
})();
