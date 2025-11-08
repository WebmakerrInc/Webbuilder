(function () {
  'use strict';

  var initEditors = function () {
    if (typeof window.grapesjs === 'undefined') {
      // eslint-disable-next-line no-console
      console.error('GrapesJS Page Builder: grapesjs library is not available.');
      return;
    }

    var containers = document.querySelectorAll('[data-grapesjs-editor]');

    containers.forEach(function (container, index) {
      if (container.dataset.gjsInit === 'true') {
        return;
      }

      if (!container.id) {
        container.id = 'grapesjs-editor-' + index;
      }

      var height = container.dataset.editorHeight || '75vh';
      var storageId = container.dataset.storageId || container.id;

      var editor = window.grapesjs.init({
        container: '#' + container.id,
        height: height,
        storageManager: {
          type: 'local',
          autosave: false,
          autoload: false,
          stepsBeforeSave: 1,
          options: {
            local: {
              key: storageId,
            },
          },
        },
        noticeOnUnload: false,
      });

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
