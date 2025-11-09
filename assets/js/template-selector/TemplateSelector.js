(function (global) {
    'use strict';

    var namespace = global.Webbuilder = global.Webbuilder || {};

    function getLabels(options) {
        var defaults = {
            businessPlaceholder: 'Choose a business type',
            templatePlaceholder: 'Choose a page layout',
        };

        var labels = options && options.labels ? options.labels : {};

        return {
            businessPlaceholder: labels.businessPlaceholder || defaults.businessPlaceholder,
            templatePlaceholder: labels.templatePlaceholder || defaults.templatePlaceholder,
        };
    }

    function setDisabledState(element, disabled) {
        if (!element) {
            return;
        }

        if (disabled) {
            element.disabled = true;
            element.setAttribute('disabled', 'disabled');
        } else {
            element.disabled = false;
            element.removeAttribute('disabled');
        }
    }

    function resetSelect(selectElement, placeholder) {
        if (!selectElement) {
            return;
        }

        while (selectElement.firstChild) {
            selectElement.removeChild(selectElement.firstChild);
        }

        var placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholder || '';
        selectElement.appendChild(placeholderOption);
        selectElement.value = '';
    }

    function TemplateSelector(options) {
        options = options || {};

        this.registry = options.registry || null;
        this.businessSelect = options.businessSelect || null;
        this.templateSelect = options.templateSelect || null;
        this.loadButton = options.loadButton || null;
        this.labels = getLabels(options);
        this.onLoad = typeof options.onLoad === 'function' ? options.onLoad : null;
        this.onLoadSuccess = typeof options.onLoadSuccess === 'function' ? options.onLoadSuccess : null;
        this.onLoadError = typeof options.onLoadError === 'function' ? options.onLoadError : null;
        this.onInvalidSelection = typeof options.onInvalidSelection === 'function' ? options.onInvalidSelection : null;

        this.state = {
            business: '',
            template: '',
        };
        this.isLoading = false;
    }

    TemplateSelector.prototype.init = function () {
        if (!this.businessSelect || !this.templateSelect || !this.loadButton || !this.registry) {
            return;
        }

        this.populateBusinessOptions();
        this.bindEvents();
        this.updateLoadButtonState();
    };

    TemplateSelector.prototype.bindEvents = function () {
        var self = this;

        this.businessSelect.addEventListener('change', function (event) {
            self.state.business = event.target.value;
            self.populateTemplateOptions(self.state.business);
            self.updateLoadButtonState();
        });

        this.templateSelect.addEventListener('change', function (event) {
            self.state.template = event.target.value;
            self.updateLoadButtonState();
        });

        this.loadButton.addEventListener('click', function (event) {
            event.preventDefault();
            self.handleLoad();
        });
    };

    TemplateSelector.prototype.populateBusinessOptions = function () {
        if (!this.registry || typeof this.registry.getCategories !== 'function') {
            return;
        }

        var categories = this.registry.getCategories();
        resetSelect(this.businessSelect, this.labels.businessPlaceholder);

        if (!categories.length) {
            setDisabledState(this.businessSelect, true);
            setDisabledState(this.templateSelect, true);
            return;
        }

        categories.forEach(function (category) {
            var option = document.createElement('option');
            option.value = category.slug;
            option.textContent = category.label;
            option.dataset.categoryLabel = category.label;
            this.businessSelect.appendChild(option);
        }, this);

        setDisabledState(this.businessSelect, false);
        setDisabledState(this.templateSelect, true);
        resetSelect(this.templateSelect, this.labels.templatePlaceholder);
        this.state.business = '';
        this.state.template = '';
    };

    TemplateSelector.prototype.populateTemplateOptions = function (categorySlug) {
        resetSelect(this.templateSelect, this.labels.templatePlaceholder);
        this.state.template = '';

        if (!categorySlug) {
            setDisabledState(this.templateSelect, true);
            return;
        }

        var templates = this.registry.getTemplatesForCategory(categorySlug);

        if (!templates.length) {
            setDisabledState(this.templateSelect, true);
            return;
        }

        templates.forEach(function (template) {
            var option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            option.dataset.templatePath = template.path;
            this.templateSelect.appendChild(option);
        }, this);

        setDisabledState(this.templateSelect, false);
    };

    TemplateSelector.prototype.updateLoadButtonState = function () {
        if (!this.loadButton) {
            return;
        }

        var canLoad = Boolean(
            this.registry &&
            this.registry.hasTemplates &&
            this.state.business &&
            this.state.template &&
            !this.isLoading
        );

        if (canLoad) {
            setDisabledState(this.loadButton, false);
        } else {
            setDisabledState(this.loadButton, true);
        }
    };

    TemplateSelector.prototype.setLoading = function (isLoading) {
        this.isLoading = Boolean(isLoading);

        if (!this.loadButton) {
            return;
        }

        if (this.isLoading) {
            this.loadButton.classList.add('is-loading');
            setDisabledState(this.loadButton, true);
        } else {
            this.loadButton.classList.remove('is-loading');
            this.updateLoadButtonState();
        }
    };

    TemplateSelector.prototype.handleLoad = function () {
        if (!this.onLoad || !this.registry) {
            return;
        }

        if (!this.state.business || !this.state.template) {
            if (this.onInvalidSelection) {
                this.onInvalidSelection();
            }
            return;
        }

        var entry = this.registry.findTemplate(this.state.business, this.state.template);

        if (!entry) {
            if (this.onInvalidSelection) {
                this.onInvalidSelection();
            }
            return;
        }

        var self = this;
        this.setLoading(true);

        Promise.resolve(this.onLoad(entry))
            .then(function (html) {
                self.setLoading(false);
                if (self.onLoadSuccess) {
                    self.onLoadSuccess(html, entry);
                }
            })
            .catch(function (error) {
                self.setLoading(false);
                if (self.onLoadError) {
                    self.onLoadError(error, entry);
                }
            });
    };

    namespace.TemplateSelector = TemplateSelector;
})(window);
