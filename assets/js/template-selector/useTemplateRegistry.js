(function (global) {
    'use strict';

    var namespace = global.Webbuilder = global.Webbuilder || {};

    function cloneTemplate(template) {
        var copy = {};

        for (var key in template) {
            if (Object.prototype.hasOwnProperty.call(template, key)) {
                copy[key] = template[key];
            }
        }

        return copy;
    }

    function cloneTemplates(templates) {
        return templates.map(function (template) {
            return cloneTemplate(template);
        });
    }

    function normaliseEntry(entry) {
        if (!entry || typeof entry !== 'object') {
            return null;
        }

        var category = entry.category ? String(entry.category) : '';
        var slug = entry.slug ? String(entry.slug) : '';
        var path = entry.path ? String(entry.path) : '';

        if (!category || !slug || !path) {
            return null;
        }

        return {
            id: entry.id ? String(entry.id) : (entry.relative_path ? String(entry.relative_path) : slug),
            category: category,
            categoryLabel: entry.category_label ? String(entry.category_label) : category,
            slug: slug,
            name: entry.name ? String(entry.name) : slug,
            path: path,
            relativePath: entry.relative_path ? String(entry.relative_path) : null,
        };
    }

    namespace.useTemplateRegistry = function (entries) {
        var normalised = Array.isArray(entries)
            ? entries.map(normaliseEntry).filter(function (value) { return Boolean(value); })
            : [];

        var categoryMap = new Map();

        normalised.forEach(function (entry) {
            var categoryData = categoryMap.get(entry.category);

            if (!categoryData) {
                categoryData = {
                    slug: entry.category,
                    label: entry.categoryLabel,
                    templates: [],
                };
                categoryMap.set(entry.category, categoryData);
            }

            categoryData.templates.push(entry);
        });

        categoryMap.forEach(function (categoryData) {
            categoryData.templates.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
        });

        var sortedCategories = Array.from(categoryMap.values()).sort(function (a, b) {
            return a.label.localeCompare(b.label);
        });

        function getTemplatesForCategory(categorySlug) {
            var category = categoryMap.get(categorySlug);
            return category ? cloneTemplates(category.templates) : [];
        }

        function findTemplate(categorySlug, templateId) {
            var templates = getTemplatesForCategory(categorySlug);
            for (var i = 0; i < templates.length; i += 1) {
                if (templates[i].id === templateId) {
                    return templates[i];
                }
            }

            return null;
        }

        return {
            entries: cloneTemplates(normalised),
            hasTemplates: normalised.length > 0,
            getCategories: function () {
                return sortedCategories.map(function (category) {
                    return {
                        slug: category.slug,
                        label: category.label,
                    };
                });
            },
            getTemplatesForCategory: getTemplatesForCategory,
            findTemplate: findTemplate,
        };
    };
})(window);
