(function () {
    'use strict';

    function showNotice(message, type) {
        const existing = document.querySelector('.webbuilder-notice');
        if (existing) {
            existing.remove();
        }
        const notice = document.createElement('div');
        notice.className = 'notice notice-' + (type || 'success') + ' webbuilder-notice';
        notice.innerHTML = '<p>' + message + '</p>';
        const wrap = document.querySelector('#webbuilder-root');
        if (wrap) {
            wrap.prepend(notice);
            setTimeout(function () {
                notice.remove();
            }, 5000);
        }
    }

    function promptLayout(layouts) {
        if (!layouts || !layouts.length) {
            return null;
        }
        const choice = window.prompt(
            'Enter layout name to load: ' + layouts.join(', '),
            layouts[0]
        );
        if (!choice) {
            return null;
        }
        const sanitized = choice.toLowerCase().replace(/[^a-z0-9\-]/g, '');
        if (layouts.indexOf(sanitized) === -1) {
            alert('Layout not found. Available layouts: ' + layouts.join(', '));
            return null;
        }
        return sanitized;
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof grapesjs === 'undefined' || typeof WebBuilderProData === 'undefined') {
            return;
        }

        const data = WebBuilderProData;
        const editor = grapesjs.init({
            container: '#gjs',
            height: 'calc(100vh - 180px)',
            storageManager: false,
            selectorManager: {
                componentFirst: true,
            },
            canvas: {
                styles: [
                    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
                ],
            },
        });

        editor.Commands.remove('gjs-open-import-template');
        editor.Commands.remove('export-template');
        editor.Commands.remove('open-code');

        editor.BlockManager.getAll().forEach(function (block) {
            editor.BlockManager.remove(block.id);
        });

        const safeBlocks = [
            {
                id: 'hero-banner',
                label: '<div class="gjs-block-label">Hero</div>',
                category: 'Sections',
                content:
                    '<section class="bg-gray-900 text-white py-24">' +
                    '<div class="max-w-6xl mx-auto px-6 text-center">' +
                    '<h1 class="text-4xl md:text-5xl font-bold mb-6">Build beautiful pages effortlessly</h1>' +
                    '<p class="text-lg md:text-xl mb-8 text-gray-300">Use predesigned blocks to craft engaging experiences across your entire network.</p>' +
                    '<div class="flex justify-center gap-4">' +
                    '<a href="#" class="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-md font-semibold">Get Started</a>' +
                    '<a href="#" class="border border-gray-200 px-6 py-3 rounded-md font-semibold">Learn More</a>' +
                    '</div>' +
                    '</div>' +
                    '</section>',
            },
            {
                id: 'features-grid',
                label: '<div class="gjs-block-label">Features</div>',
                category: 'Sections',
                content:
                    '<section class="py-20 bg-white">' +
                    '<div class="max-w-6xl mx-auto px-6">' +
                    '<div class="text-center mb-12">' +
                    '<h2 class="text-3xl font-bold mb-3 text-gray-900">Powerful features for teams</h2>' +
                    '<p class="text-gray-600">Deliver consistent layouts, drag-and-drop components, and reliable performance.</p>' +
                    '</div>' +
                    '<div class="grid gap-8 md:grid-cols-3">' +
                    '<div class="p-6 border rounded-lg shadow-sm">' +
                    '<i class="fa-solid fa-layer-group text-indigo-500 text-3xl mb-4"></i>' +
                    '<h3 class="text-xl font-semibold mb-2">Modular blocks</h3>' +
                    '<p class="text-gray-600">Mix and match reusable Tailwind components.</p>' +
                    '</div>' +
                    '<div class="p-6 border rounded-lg shadow-sm">' +
                    '<i class="fa-solid fa-shield-halved text-indigo-500 text-3xl mb-4"></i>' +
                    '<h3 class="text-xl font-semibold mb-2">Secure by default</h3>' +
                    '<p class="text-gray-600">Sanitized output keeps every site compliant.</p>' +
                    '</div>' +
                    '<div class="p-6 border rounded-lg shadow-sm">' +
                    '<i class="fa-solid fa-gauge-high text-indigo-500 text-3xl mb-4"></i>' +
                    '<h3 class="text-xl font-semibold mb-2">Fast publishing</h3>' +
                    '<p class="text-gray-600">Publish layouts quickly with GrapesJS editing.</p>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</section>',
            },
            {
                id: 'pricing-table',
                label: '<div class="gjs-block-label">Pricing</div>',
                category: 'Sections',
                content:
                    '<section class="py-20 bg-gray-50">' +
                    '<div class="max-w-5xl mx-auto px-6">' +
                    '<div class="text-center mb-12">' +
                    '<h2 class="text-3xl font-bold text-gray-900">Plans made for growth</h2>' +
                    '<p class="text-gray-600">Choose the right package for your organization.</p>' +
                    '</div>' +
                    '<div class="grid gap-8 md:grid-cols-3">' +
                    '<div class="p-8 bg-white rounded-xl border shadow-sm flex flex-col">' +
                    '<h3 class="text-xl font-semibold mb-2">Starter</h3>' +
                    '<p class="text-4xl font-bold mb-4">$19</p>' +
                    '<ul class="space-y-2 text-gray-600 mb-6">' +
                    '<li>Essential blocks</li>' +
                    '<li>Email support</li>' +
                    '<li>Multisite ready</li>' +
                    '</ul>' +
                    '<a href="#" class="mt-auto bg-indigo-500 hover:bg-indigo-600 text-white text-center px-5 py-3 rounded-md">Select</a>' +
                    '</div>' +
                    '<div class="p-8 bg-indigo-600 text-white rounded-xl shadow-lg flex flex-col">' +
                    '<h3 class="text-xl font-semibold mb-2">Professional</h3>' +
                    '<p class="text-4xl font-bold mb-4">$49</p>' +
                    '<ul class="space-y-2 text-indigo-100 mb-6">' +
                    '<li>Advanced layouts</li>' +
                    '<li>Priority support</li>' +
                    '<li>Team collaboration</li>' +
                    '</ul>' +
                    '<a href="#" class="mt-auto bg-white text-indigo-600 text-center px-5 py-3 rounded-md font-semibold">Select</a>' +
                    '</div>' +
                    '<div class="p-8 bg-white rounded-xl border shadow-sm flex flex-col">' +
                    '<h3 class="text-xl font-semibold mb-2">Enterprise</h3>' +
                    '<p class="text-4xl font-bold mb-4">$99</p>' +
                    '<ul class="space-y-2 text-gray-600 mb-6">' +
                    '<li>Custom onboarding</li>' +
                    '<li>Dedicated success manager</li>' +
                    '<li>Compliance reviews</li>' +
                    '</ul>' +
                    '<a href="#" class="mt-auto bg-indigo-500 hover:bg-indigo-600 text-white text-center px-5 py-3 rounded-md">Select</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</section>',
            },
            {
                id: 'contact-section',
                label: '<div class="gjs-block-label">Contact</div>',
                category: 'Sections',
                content:
                    '<section class="py-20 bg-white">' +
                    '<div class="max-w-4xl mx-auto px-6 grid gap-10 md:grid-cols-2">' +
                    '<div>' +
                    '<h2 class="text-3xl font-bold text-gray-900 mb-4">Let\'s connect</h2>' +
                    '<p class="text-gray-600 mb-6">Reach out to learn how WebBuilder Pro empowers your network of sites.</p>' +
                    '<div class="space-y-4 text-gray-700">' +
                    '<div class="flex items-start gap-3">' +
                    '<i class="fa-solid fa-envelope mt-1 text-indigo-500"></i>' +
                    '<div><strong>Email</strong><br>team@example.com</div>' +
                    '</div>' +
                    '<div class="flex items-start gap-3">' +
                    '<i class="fa-solid fa-phone mt-1 text-indigo-500"></i>' +
                    '<div><strong>Phone</strong><br>(123) 456-7890</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<form class="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">' +
                    '<input type="text" class="w-full px-4 py-3 border rounded-md" placeholder="Your Name">' +
                    '<input type="email" class="w-full px-4 py-3 border rounded-md" placeholder="Email Address">' +
                    '<textarea class="w-full px-4 py-3 border rounded-md h-32" placeholder="How can we help?"></textarea>' +
                    '<button type="submit" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-md font-semibold">Send Message</button>' +
                    '</form>' +
                    '</div>' +
                    '</section>',
            },
        ];

        safeBlocks.forEach(function (block) {
            editor.BlockManager.add(block.id, {
                label: block.label,
                category: block.category,
                content: block.content,
            });
        });

        if (data.initialHtml) {
            editor.setComponents(data.initialHtml);
        }
        if (data.initialCss) {
            editor.setStyle(data.initialCss);
        }

        editor.on('load', function () {
            const panels = editor.Panels;
            panels.removeButton('options', 'export-template');
            panels.removeButton('options', 'gjs-open-import-template');
            panels.removeButton('options', 'open-code');

            const openBlocks = panels.getButton('views', 'open-blocks');
            if (openBlocks) {
                openBlocks.set('active', 1);
            }
            editor.BlockManager.open();
        });

        const deviceManager = editor.DeviceManager;
        deviceManager.getAll().slice().forEach(function (device) {
            deviceManager.remove(device.id);
        });
        [
            { id: 'desktop', name: 'Desktop', width: '' },
            { id: 'tablet', name: 'Tablet', width: '768px' },
            { id: 'mobile', name: 'Mobile', width: '375px' },
        ].forEach(function (device) {
            deviceManager.add(device.id, {
                name: device.name,
                width: device.width,
            });
        });
        deviceManager.select('desktop');

        const deviceButtons = document.querySelectorAll('.webbuilder-devices .button');
        deviceButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                deviceButtons.forEach(function (btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                const device = button.getAttribute('data-device');
                if (device) {
                    editor.setDevice(device);
                }
            });
        });
        const defaultDeviceButton = document.querySelector('.webbuilder-devices .button[data-device="desktop"]');
        if (defaultDeviceButton) {
            defaultDeviceButton.classList.add('active');
        }

        const saveButton = document.getElementById('webbuilder-save');
        const loadLayoutButton = document.getElementById('webbuilder-load-layout');

        function toggleSaving(state) {
            if (!saveButton) {
                return;
            }
            if (state) {
                saveButton.setAttribute('disabled', 'disabled');
                saveButton.textContent = 'Saving...';
            } else {
                saveButton.removeAttribute('disabled');
                saveButton.textContent = 'Save';
            }
        }

        function saveContent() {
            toggleSaving(true);
            const payload = {
                id: data.postId,
                html: editor.getHtml(),
                css: editor.getCss(),
            };

            window.fetch(data.restUrl + 'save', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': data.nonce,
                },
                body: JSON.stringify(payload),
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Failed to save layout.');
                    }
                    return response.json();
                })
                .then(function () {
                    showNotice('Layout saved successfully.', 'success');
                })
                .catch(function (error) {
                    console.error(error);
                    alert('Unable to save layout. Please try again.');
                })
                .finally(function () {
                    toggleSaving(false);
                });
        }

        if (saveButton) {
            saveButton.addEventListener('click', function (event) {
                event.preventDefault();
                saveContent();
            });
        }

        if (loadLayoutButton) {
            loadLayoutButton.addEventListener('click', function (event) {
                event.preventDefault();
                const layout = promptLayout(data.layouts);
                if (!layout) {
                    return;
                }
                window.fetch(data.restUrl + 'layout/' + layout, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'X-WP-Nonce': data.nonce,
                    },
                })
                    .then(function (response) {
                        if (!response.ok) {
                            throw new Error('Layout not found.');
                        }
                        return response.json();
                    })
                    .then(function (result) {
                        if (result && result.html) {
                            editor.setComponents(result.html);
                            editor.setStyle('');
                            showNotice('Layout loaded.', 'info');
                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                        alert('Unable to load layout.');
                    });
            });
        }
    });
})();
