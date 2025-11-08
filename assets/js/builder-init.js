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
            plugins: ['gjs-blocks-basic', 'grapesjs-blocks-basic'],
            pluginsOpts: {
                'grapesjs-blocks-basic': {
                    flexGrid: true,
                    blocks: [
                        'column1',
                        'column2',
                        'column3',
                        'text',
                        'link',
                        'image',
                        'video',
                        'quote',
                        'list',
                        'map',
                        'form',
                        'button',
                    ],
                },
            },
        });

        editor.Commands.remove('gjs-open-import-template');
        editor.Commands.remove('export-template');
        editor.Commands.remove('open-code');

        const pluginBlocks =
            (editor.getConfig() &&
                editor.getConfig().pluginsOpts &&
                editor.getConfig().pluginsOpts['grapesjs-blocks-basic'] &&
                editor.getConfig().pluginsOpts['grapesjs-blocks-basic'].blocks) || [];

        const baseSafeBlocks = [
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

        const extendedBlocks = [
            {
                id: 'hero',
                label: 'Hero Section',
                category: 'Sections',
                content: `
      <section class="bg-gray-100 py-20 text-center">
        <h1 class="text-4xl font-bold mb-4">Welcome to Your New Site</h1>
        <p class="text-gray-600 mb-6">You can edit this section easily.</p>
        <button class="bg-black text-white px-6 py-2 rounded">Get Started</button>
      </section>
                `,
            },
            {
                id: 'features',
                label: 'Features Grid',
                category: 'Sections',
                content: `
      <section class="py-16">
        <div class="grid md:grid-cols-3 gap-8 text-center">
          <div><h3 class="text-xl font-semibold mb-2">Fast</h3><p>Quick to set up.</p></div>
          <div><h3 class="text-xl font-semibold mb-2">Reliable</h3><p>Powered by Webmakerr.</p></div>
          <div><h3 class="text-xl font-semibold mb-2">Scalable</h3><p>Built for growth.</p></div>
        </div>
      </section>
                `,
            },
            {
                id: 'footer',
                label: 'Footer',
                category: 'Sections',
                content: `
      <footer class="bg-gray-900 text-white text-center py-6">
        <p>&copy; 2025 Webmakerr. All rights reserved.</p>
      </footer>
                `,
            },
            {
                id: 'two-cols',
                label: 'Two Columns',
                category: 'Layout',
                content: `
    <section class="py-16 grid md:grid-cols-2 gap-8 items-center">
      <div><h2 class="text-3xl font-bold mb-4">Left Column</h2><p>Text or image here.</p></div>
      <div><img src="https://placehold.co/500x300" class="rounded"></div>
    </section>
                `,
            },
            {
                id: 'testimonials',
                label: 'Testimonials',
                category: 'Sections',
                content: `
    <section class="bg-gray-50 py-16 text-center">
      <h2 class="text-2xl font-semibold mb-8">What Our Users Say</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="p-4 border rounded"><p>"Amazing product!"</p><p class="mt-2 text-sm text-gray-500">— Sarah</p></div>
        <div class="p-4 border rounded"><p>"So easy to use."</p><p class="mt-2 text-sm text-gray-500">— Alex</p></div>
        <div class="p-4 border rounded"><p>"Highly recommend."</p><p class="mt-2 text-sm text-gray-500">— Maria</p></div>
      </div>
    </section>
                `,
            },
            {
                id: 'pricing',
                label: 'Pricing Table',
                category: 'Sections',
                content: `
    <section class="py-20 text-center">
      <h2 class="text-3xl font-bold mb-10">Pricing Plans</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="border rounded p-6">
          <h3 class="font-semibold mb-2">Basic</h3>
          <p class="text-2xl font-bold mb-4">$9/mo</p>
          <button class="bg-black text-white px-6 py-2 rounded">Choose</button>
        </div>
        <div class="border rounded p-6 bg-gray-100">
          <h3 class="font-semibold mb-2">Pro</h3>
          <p class="text-2xl font-bold mb-4">$29/mo</p>
          <button class="bg-black text-white px-6 py-2 rounded">Choose</button>
        </div>
        <div class="border rounded p-6">
          <h3 class="font-semibold mb-2">Enterprise</h3>
          <p class="text-2xl font-bold mb-4">$99/mo</p>
          <button class="bg-black text-white px-6 py-2 rounded">Choose</button>
        </div>
      </div>
    </section>
                `,
            },
            {
                id: 'contact',
                label: 'Contact Section',
                category: 'Sections',
                content: `
    <section class="py-16 bg-gray-100 text-center">
      <h2 class="text-3xl font-bold mb-6">Get in Touch</h2>
      <form class="max-w-md mx-auto grid gap-4">
        <input type="text" placeholder="Name" class="border p-2 rounded">
        <input type="email" placeholder="Email" class="border p-2 rounded">
        <textarea placeholder="Message" class="border p-2 rounded"></textarea>
        <button class="bg-black text-white py-2 rounded">Send Message</button>
      </form>
    </section>
                `,
            },
            {
                id: 'hero-right',
                label: 'Hero (Image Right)',
                category: 'Sections',
                content: `
    <section class="py-20 bg-gray-50">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 class="text-5xl font-bold mb-4">Build Faster with Webmakerr</h1>
          <p class="text-gray-600 mb-6">A complete no-code builder for WordPress multisite.</p>
          <button class="bg-black text-white px-6 py-2 rounded">Get Started</button>
        </div>
        <div>
          <img src="https://placehold.co/500x400" class="w-full rounded">
        </div>
      </div>
    </section>
                `,
            },
            {
                id: 'header-bar',
                label: 'Header Bar',
                category: 'Layout',
                content: `
    <header class="bg-white shadow py-4">
      <div class="max-w-6xl mx-auto flex justify-between items-center px-4">
        <div class="font-bold text-xl">Webmakerr</div>
        <nav class="space-x-6">
          <a href="#" class="text-gray-700 hover:text-black">Home</a>
          <a href="#" class="text-gray-700 hover:text-black">About</a>
          <a href="#" class="text-gray-700 hover:text-black">Contact</a>
        </nav>
      </div>
    </header>
                `,
            },
            {
                id: 'three-features',
                label: 'Three Features',
                category: 'Sections',
                content: `
    <section class="py-16 text-center">
      <h2 class="text-3xl font-bold mb-12">Our Core Features</h2>
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div class="p-6 border rounded">
          <h3 class="font-semibold mb-2">Speed</h3>
          <p class="text-gray-600">Optimized for performance and quick deployment.</p>
        </div>
        <div class="p-6 border rounded bg-gray-50">
          <h3 class="font-semibold mb-2">Scalability</h3>
          <p class="text-gray-600">Built to handle large multisite networks with ease.</p>
        </div>
        <div class="p-6 border rounded">
          <h3 class="font-semibold mb-2">Security</h3>
          <p class="text-gray-600">Protected by industry-standard security practices.</p>
        </div>
      </div>
    </section>
                `,
            },
            {
                id: 'services',
                label: 'Services Grid',
                category: 'Sections',
                content: `
    <section class="py-20 bg-gray-100">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-12">What We Offer</h2>
        <div class="grid md:grid-cols-4 gap-6">
          <div class="p-6 bg-white rounded border">
            <h4 class="font-semibold mb-2">SEO Optimization</h4>
            <p class="text-gray-600 text-sm">Boost your visibility organically.</p>
          </div>
          <div class="p-6 bg-white rounded border">
            <h4 class="font-semibold mb-2">Analytics</h4>
            <p class="text-gray-600 text-sm">Real-time data and insights.</p>
          </div>
          <div class="p-6 bg-white rounded border">
            <h4 class="font-semibold mb-2">Integrations</h4>
            <p class="text-gray-600 text-sm">Connect to all your favorite tools.</p>
          </div>
          <div class="p-6 bg-white rounded border">
            <h4 class="font-semibold mb-2">Support</h4>
            <p class="text-gray-600 text-sm">We’re here 24/7 to help you grow.</p>
          </div>
        </div>
      </div>
    </section>
                `,
            },
            {
                id: 'team',
                label: 'Team Section',
                category: 'Sections',
                content: `
    <section class="py-20 text-center">
      <h2 class="text-3xl font-bold mb-10">Meet Our Team</h2>
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div><img src="https://placehold.co/150x150" class="rounded-full mb-4 mx-auto"><h3 class="font-semibold">Jane</h3><p class="text-sm text-gray-500">CEO</p></div>
        <div><img src="https://placehold.co/150x150" class="rounded-full mb-4 mx-auto"><h3 class="font-semibold">Mark</h3><p class="text-sm text-gray-500">CTO</p></div>
        <div><img src="https://placehold.co/150x150" class="rounded-full mb-4 mx-auto"><h3 class="font-semibold">Sara</h3><p class="text-sm text-gray-500">Designer</p></div>
      </div>
    </section>
                `,
            },
            {
                id: 'testimonials-alt',
                label: 'Testimonials (Alt)',
                category: 'Sections',
                content: `
    <section class="bg-gray-50 py-20 text-center">
      <h2 class="text-3xl font-bold mb-10">What Clients Say</h2>
      <div class="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div class="p-6 border rounded"><p>"Webmakerr made building our site effortless!"</p><p class="mt-2 text-sm text-gray-500">— Amanda</p></div>
        <div class="p-6 border rounded"><p>"Fast, flexible, and reliable."</p><p class="mt-2 text-sm text-gray-500">— Daniel</p></div>
        <div class="p-6 border rounded"><p>"We scaled to 100 sites without issues."</p><p class="mt-2 text-sm text-gray-500">— Priya</p></div>
      </div>
    </section>
                `,
            },
            {
                id: 'pricing-alt',
                label: 'Pricing Plans (Alt)',
                category: 'Sections',
                content: `
    <section class="py-20 text-center">
      <h2 class="text-3xl font-bold mb-10">Choose Your Plan</h2>
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div class="border rounded p-6">
          <h3 class="font-semibold mb-2">Starter</h3>
          <p class="text-3xl font-bold mb-4">$9/mo</p>
          <ul class="text-sm text-gray-600 mb-4"><li>1 Website</li><li>Email Support</li></ul>
          <button class="bg-black text-white px-6 py-2 rounded">Select</button>
        </div>
        <div class="border rounded p-6 bg-gray-50">
          <h3 class="font-semibold mb-2">Professional</h3>
          <p class="text-3xl font-bold mb-4">$29/mo</p>
          <ul class="text-sm text-gray-600 mb-4"><li>5 Websites</li><li>Priority Support</li></ul>
          <button class="bg-black text-white px-6 py-2 rounded">Select</button>
        </div>
        <div class="border rounded p-6">
          <h3 class="font-semibold mb-2">Enterprise</h3>
          <p class="text-3xl font-bold mb-4">$99/mo</p>
          <ul class="text-sm text-gray-600 mb-4"><li>Unlimited Sites</li><li>Dedicated Support</li></ul>
          <button class="bg-black text-white px-6 py-2 rounded">Select</button>
        </div>
      </div>
    </section>
                `,
            },
            {
                id: 'faq',
                label: 'FAQ Section',
                category: 'Sections',
                content: `
    <section class="py-20 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div class="space-y-6">
          <div><h4 class="font-semibold mb-2">How does Webmakerr work?</h4><p class="text-gray-600">It provides templates and an editor to manage your entire site visually.</p></div>
          <div><h4 class="font-semibold mb-2">Can I host multiple sites?</h4><p class="text-gray-600">Yes, our multisite setup supports unlimited websites.</p></div>
          <div><h4 class="font-semibold mb-2">Is support included?</h4><p class="text-gray-600">Absolutely — we offer 24/7 dedicated support.</p></div>
        </div>
      </div>
    </section>
                `,
            },
            {
                id: 'contact-alt',
                label: 'Contact Form (Alt)',
                category: 'Sections',
                content: `
    <section class="py-20 text-center bg-gray-100">
      <h2 class="text-3xl font-bold mb-6">Get in Touch</h2>
      <form class="max-w-md mx-auto grid gap-4">
        <input type="text" placeholder="Your Name" class="border p-2 rounded">
        <input type="email" placeholder="Your Email" class="border p-2 rounded">
        <textarea placeholder="Message" class="border p-2 rounded"></textarea>
        <button class="bg-black text-white py-2 rounded">Send</button>
      </form>
    </section>
                `,
            },
            {
                id: 'about',
                label: 'About Section',
                category: 'Sections',
                content: `
    <section class="py-20 bg-white text-center">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-6">About Us</h2>
        <p class="text-gray-600 text-lg leading-relaxed mb-8">
          Webmakerr helps businesses build beautiful, scalable websites in minutes — 
          without touching code. We focus on design, performance, and simplicity.
        </p>
        <img src="https://placehold.co/800x400" class="rounded shadow mx-auto">
      </div>
    </section>
                `,
            },
            {
                id: 'stats',
                label: 'Stats Section',
                category: 'Sections',
                content: `
    <section class="py-20 bg-gray-50 text-center">
      <h2 class="text-3xl font-bold mb-10">Our Numbers Speak for Themselves</h2>
      <div class="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        <div><h3 class="text-5xl font-bold text-black mb-2">500+</h3><p class="text-gray-600">Clients</p></div>
        <div><h3 class="text-5xl font-bold text-black mb-2">1K+</h3><p class="text-gray-600">Websites</p></div>
        <div><h3 class="text-5xl font-bold text-black mb-2">99.9%</h3><p class="text-gray-600">Uptime</p></div>
        <div><h3 class="text-5xl font-bold text-black mb-2">24/7</h3><p class="text-gray-600">Support</p></div>
      </div>
    </section>
                `,
            },
            {
                id: 'gallery',
                label: 'Gallery',
                category: 'Media',
                content: `
    <section class="py-16 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-10">Gallery</h2>
        <div class="grid md:grid-cols-3 gap-4">
          <img src="https://placehold.co/400x300" class="rounded shadow">
          <img src="https://placehold.co/400x300" class="rounded shadow">
          <img src="https://placehold.co/400x300" class="rounded shadow">
          <img src="https://placehold.co/400x300" class="rounded shadow">
          <img src="https://placehold.co/400x300" class="rounded shadow">
          <img src="https://placehold.co/400x300" class="rounded shadow">
        </div>
      </div>
    </section>
                `,
            },
            {
                id: 'cta',
                label: 'Call to Action',
                category: 'Sections',
                content: `
    <section class="py-20 bg-black text-white text-center">
      <h2 class="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
      <p class="text-gray-300 mb-6">Join thousands of creators using Webmakerr today.</p>
      <button class="bg-white text-black px-6 py-3 rounded font-semibold">Get Started Now</button>
    </section>
                `,
            },
            {
                id: 'blog',
                label: 'Blog Grid',
                category: 'Content',
                content: `
    <section class="py-20 bg-gray-50">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-12">Latest Articles</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <article class="bg-white p-6 border rounded">
            <img src="https://placehold.co/400x200" class="rounded mb-4">
            <h3 class="font-semibold text-lg mb-2">How to Build Faster</h3>
            <p class="text-gray-600 text-sm">Learn how Webmakerr helps you scale your website creation process...</p>
            <a href="#" class="text-black underline mt-2 inline-block">Read more</a>
          </article>
          <article class="bg-white p-6 border rounded">
            <img src="https://placehold.co/400x200" class="rounded mb-4">
            <h3 class="font-semibold text-lg mb-2">Why Tailwind Rules</h3>
            <p class="text-gray-600 text-sm">Tailwind CSS simplifies your front-end workflow. Here’s how...</p>
            <a href="#" class="text-black underline mt-2 inline-block">Read more</a>
          </article>
          <article class="bg-white p-6 border rounded">
            <img src="https://placehold.co/400x200" class="rounded mb-4">
            <h3 class="font-semibold text-lg mb-2">Scaling Multisite</h3>
            <p class="text-gray-600 text-sm">Tips on managing hundreds of sites using one core theme...</p>
            <a href="#" class="text-black underline mt-2 inline-block">Read more</a>
          </article>
        </div>
      </div>
    </section>
                `,
            },
            {
                id: 'newsletter',
                label: 'Newsletter Signup',
                category: 'Forms',
                content: `
    <section class="py-20 bg-gray-100 text-center">
      <h2 class="text-3xl font-bold mb-6">Stay in the Loop</h2>
      <p class="text-gray-600 mb-8">Get updates, tutorials, and exclusive offers right in your inbox.</p>
      <form class="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input type="email" placeholder="Your Email" class="border p-2 rounded col-span-2">
        <button class="bg-black text-white py-2 rounded">Subscribe</button>
      </form>
    </section>
                `,
            },
            {
                id: 'timeline',
                label: 'Timeline',
                category: 'Sections',
                content: `
    <section class="py-20 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-10">Our Journey</h2>
        <ol class="relative border-l border-gray-200">
          <li class="mb-10 ml-6">
            <div class="absolute -left-3 flex items-center justify-center w-6 h-6 bg-black rounded-full"></div>
            <h3 class="font-semibold text-lg mb-1">Founded in 2020</h3>
            <p class="text-gray-600">Started as a small team building sites for startups.</p>
          </li>
          <li class="mb-10 ml-6">
            <div class="absolute -left-3 flex items-center justify-center w-6 h-6 bg-black rounded-full"></div>
            <h3 class="font-semibold text-lg mb-1">Launched Webmakerr</h3>
            <p class="text-gray-600">Released our SaaS platform for WordPress Multisite.</p>
          </li>
          <li class="ml-6">
            <div class="absolute -left-3 flex items-center justify-center w-6 h-6 bg-black rounded-full"></div>
            <h3 class="font-semibold text-lg mb-1">Expanding Worldwide</h3>
            <p class="text-gray-600">Serving thousands of clients across 50+ countries.</p>
          </li>
        </ol>
      </div>
    </section>
                `,
            },
            {
                id: 'partners',
                label: 'Partner Logos',
                category: 'Sections',
                content: `
    <section class="py-12 bg-white text-center">
      <h2 class="text-2xl font-semibold mb-8">Trusted by Leading Brands</h2>
      <div class="flex flex-wrap justify-center gap-8 opacity-80">
        <img src="https://placehold.co/120x40" class="h-10 grayscale">
        <img src="https://placehold.co/120x40" class="h-10 grayscale">
        <img src="https://placehold.co/120x40" class="h-10 grayscale">
        <img src="https://placehold.co/120x40" class="h-10 grayscale">
        <img src="https://placehold.co/120x40" class="h-10 grayscale">
      </div>
    </section>
                `,
            },
            {
                id: 'steps',
                label: 'Steps Section',
                category: 'Sections',
                content: `
    <section class="py-20 bg-gray-100">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-12">How It Works</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="p-6 bg-white rounded border">
            <h3 class="text-xl font-semibold mb-2">1. Sign Up</h3>
            <p class="text-gray-600 text-sm">Create your Webmakerr account.</p>
          </div>
          <div class="p-6 bg-white rounded border">
            <h3 class="text-xl font-semibold mb-2">2. Customize</h3>
            <p class="text-gray-600 text-sm">Pick a template and edit visually.</p>
          </div>
          <div class="p-6 bg-white rounded border">
            <h3 class="text-xl font-semibold mb-2">3. Launch</h3>
            <p class="text-gray-600 text-sm">Publish your site instantly.</p>
          </div>
        </div>
      </div>
    </section>
                `,
            },
            {
                id: 'video',
                label: 'Video Embed',
                category: 'Media',
                content: `
    <section class="py-20 bg-black text-center">
      <h2 class="text-3xl font-bold text-white mb-8">Watch How It Works</h2>
      <div class="max-w-4xl mx-auto aspect-video">
        <iframe class="w-full h-96 rounded" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
      </div>
    </section>
                `,
            },
            {
                id: 'map',
                label: 'Google Map',
                category: 'Media',
                content: `
    <section class="py-20">
      <h2 class="text-3xl font-bold text-center mb-10">Find Us</h2>
      <div class="w-full h-96">
        <iframe class="w-full h-full border-0"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151!2d144.9631!3d-37.8136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf5776cf47eaa6a0!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sau!4v1614556800000!5m2!1sen!2sau"
          loading="lazy">
        </iframe>
      </div>
    </section>
                `,
            },
            {
                id: 'footer-dark',
                label: 'Footer (Dark)',
                category: 'Sections',
                content: `
    <footer class="bg-black text-gray-300 py-10">
      <div class="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 px-4">
        <div>
          <h3 class="text-white font-semibold mb-4">Webmakerr</h3>
          <p class="text-sm text-gray-400">Simplifying multisite web creation for everyone.</p>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-3">Company</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white">About</a></li>
            <li><a href="#" class="hover:text-white">Careers</a></li>
            <li><a href="#" class="hover:text-white">Press</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-3">Resources</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white">Docs</a></li>
            <li><a href="#" class="hover:text-white">API</a></li>
            <li><a href="#" class="hover:text-white">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-3">Follow</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white">Twitter</a></li>
            <li><a href="#" class="hover:text-white">LinkedIn</a></li>
            <li><a href="#" class="hover:text-white">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div class="text-center text-gray-500 text-sm mt-8">© 2025 Webmakerr — All rights reserved.</div>
    </footer>
                `,
            },
        ];

        const safeBlocks = baseSafeBlocks.concat(extendedBlocks);

        const allowedBlocks = new Set(
            pluginBlocks.concat(safeBlocks.map(function (block) {
                return block.id;
            }))
        );

        editor.BlockManager.getAll().forEach(function (block) {
            if (!allowedBlocks.has(block.id)) {
                editor.BlockManager.remove(block.id);
            }
        });

        safeBlocks.forEach(function (block) {
            editor.BlockManager.add(block.id, {
                label: block.label,
                category: block.category,
                content: block.content,
            });
        });

        editor.Commands.add('open-layouts', {
            run: function () {
                if (!data.layouts || !data.layouts.length) {
                    alert('No layouts available.');
                    return;
                }

                const existing = document.querySelector('.webbuilder-layout-panel');
                if (existing) {
                    existing.remove();
                }

                const panel = document.createElement('div');
                panel.className = 'webbuilder-layout-panel';
                panel.style.position = 'fixed';
                panel.style.top = '50%';
                panel.style.left = '50%';
                panel.style.transform = 'translate(-50%, -50%)';
                panel.style.background = '#fff';
                panel.style.padding = '20px';
                panel.style.border = '1px solid #ccc';
                panel.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
                panel.style.zIndex = '9999';
                panel.style.minWidth = '280px';

                const heading = document.createElement('h3');
                heading.textContent = 'Select a Layout';
                heading.style.marginBottom = '10px';
                panel.appendChild(heading);

                const buttonsWrap = document.createElement('div');
                buttonsWrap.style.display = 'flex';
                buttonsWrap.style.flexWrap = 'wrap';
                buttonsWrap.style.gap = '10px';

                data.layouts.forEach(function (layout) {
                    const button = document.createElement('button');
                    button.textContent = layout;
                    button.setAttribute('data-layout', layout);
                    button.style.padding = '6px 12px';
                    button.style.border = '1px solid #111';
                    button.style.background = '#111';
                    button.style.color = '#fff';
                    button.style.cursor = 'pointer';
                    button.addEventListener('click', function () {
                        loadLayout(layout)
                            .then(function () {
                                panel.remove();
                            })
                            .catch(function (error) {
                                console.error(error);
                                alert('Unable to load layout.');
                            });
                    });
                    buttonsWrap.appendChild(button);
                });

                panel.appendChild(buttonsWrap);

                const close = document.createElement('button');
                close.textContent = 'Close';
                close.style.marginTop = '15px';
                close.style.border = 'none';
                close.style.background = 'transparent';
                close.style.cursor = 'pointer';
                close.style.fontWeight = '600';
                close.addEventListener('click', function () {
                    panel.remove();
                });
                panel.appendChild(close);

                document.body.appendChild(panel);
            },
        });

        if (!editor.Panels.getButton('options', 'load-layouts')) {
            editor.Panels.addButton('options', [
                {
                    id: 'load-layouts',
                    className: 'fa fa-folder-open',
                    attributes: { title: 'Load Layout' },
                    command: 'open-layouts',
                },
            ]);
        }

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

        function applyLayout(result) {
            if (!result || !result.html) {
                throw new Error('Layout not found.');
            }
            editor.setComponents(result.html);
            editor.setStyle(result.css || '');
            showNotice('Layout loaded.', 'info');
        }

        function loadLayout(layout) {
            if (!layout) {
                return Promise.reject(new Error('No layout specified.'));
            }

            if (typeof wp !== 'undefined' && wp.apiRequest) {
                return wp
                    .apiRequest({ path: '/webbuilder/v1/layout/' + layout })
                    .then(function (result) {
                        applyLayout(result);
                    });
            }

            return window
                .fetch(data.restUrl + 'layout/' + layout, {
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
                    applyLayout(result);
                });
        }

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
                loadLayout(layout).catch(function (error) {
                    console.error(error);
                    alert('Unable to load layout.');
                });
            });
        }
    });
})();
