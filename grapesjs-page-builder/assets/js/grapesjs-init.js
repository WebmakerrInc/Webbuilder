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

      var blockManager = editor.BlockManager;

      blockManager.add('hero', {
        label: 'Hero Section',
        category: 'Sections',
        attributes: { class: 'fa fa-header' },
        content: "\n      <section class=\"bg-gray-100 py-20 text-center\">\n        <h1 class=\"text-4xl font-bold mb-4\">Welcome to Your New Site</h1>\n        <p class=\"text-gray-600 mb-6\">You can edit this section easily.</p>\n        <button class=\"bg-black text-white px-6 py-2 rounded\">Get Started</button>\n      </section>\n    ",
      });

      blockManager.add('features', {
        label: 'Features Grid',
        category: 'Sections',
        attributes: { class: 'fa fa-th' },
        content: "\n      <section class=\"py-16\">\n        <div class=\"grid md:grid-cols-3 gap-8 text-center\">\n          <div><h3 class=\"text-xl font-semibold mb-2\">Fast</h3><p>Quick to set up.</p></div>\n          <div><h3 class=\"text-xl font-semibold mb-2\">Reliable</h3><p>Powered by Webmakerr.</p></div>\n          <div><h3 class=\"text-xl font-semibold mb-2\">Scalable</h3><p>Built for growth.</p></div>\n        </div>\n      </section>\n    ",
      });

      blockManager.add('footer', {
        label: 'Footer',
        category: 'Sections',
        attributes: { class: 'fa fa-bars' },
        content: "\n      <footer class=\"bg-gray-900 text-white text-center py-6\">\n        <p>&copy; 2025 Webmakerr. All rights reserved.</p>\n      </footer>\n    ",
      });

      blockManager.add('two-cols', {
        label: 'Two Columns',
        category: 'Layout',
        attributes: { class: 'fa fa-columns' },
        content: "\n    <section class=\"py-16 grid md:grid-cols-2 gap-8 items-center\">\n      <div><h2 class=\"text-3xl font-bold mb-4\">Left Column</h2><p>Text or image here.</p></div>\n      <div><img src=\"https://placehold.co/500x300\" class=\"rounded\"></div>\n    </section>\n  ",
      });

      blockManager.add('testimonials', {
        label: 'Testimonials',
        category: 'Sections',
        attributes: { class: 'fa fa-comments' },
        content: "\n    <section class=\"bg-gray-50 py-16 text-center\">\n      <h2 class=\"text-2xl font-semibold mb-8\">What Our Users Say</h2>\n      <div class=\"grid md:grid-cols-3 gap-6\">\n        <div class=\"p-4 border rounded\"><p>\"Amazing product!\"</p><p class=\"mt-2 text-sm text-gray-500\">— Sarah</p></div>\n        <div class=\"p-4 border rounded\"><p>\"So easy to use.\"</p><p class=\"mt-2 text-sm text-gray-500\">— Alex</p></div>\n        <div class=\"p-4 border rounded\"><p>\"Highly recommend.\"</p><p class=\"mt-2 text-sm text-gray-500\">— Maria</p></div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('pricing', {
        label: 'Pricing Table',
        category: 'Sections',
        attributes: { class: 'fa fa-table' },
        content: "\n    <section class=\"py-20 text-center\">\n      <h2 class=\"text-3xl font-bold mb-10\">Pricing Plans</h2>\n      <div class=\"grid md:grid-cols-3 gap-8\">\n        <div class=\"border rounded p-6\">\n          <h3 class=\"font-semibold mb-2\">Basic</h3>\n          <p class=\"text-2xl font-bold mb-4\">$9/mo</p>\n          <button class=\"bg-black text-white px-6 py-2 rounded\">Choose</button>\n        </div>\n        <div class=\"border rounded p-6 bg-gray-100\">\n          <h3 class=\"font-semibold mb-2\">Pro</h3>\n          <p class=\"text-2xl font-bold mb-4\">$29/mo</p>\n          <button class=\"bg-black text-white px-6 py-2 rounded\">Choose</button>\n        </div>\n        <div class=\"border rounded p-6\">\n          <h3 class=\"font-semibold mb-2\">Enterprise</h3>\n          <p class=\"text-2xl font-bold mb-4\">$99/mo</p>\n          <button class=\"bg-black text-white px-6 py-2 rounded\">Choose</button>\n        </div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('contact', {
        label: 'Contact Section',
        category: 'Sections',
        attributes: { class: 'fa fa-envelope' },
        content: "\n    <section class=\"py-16 bg-gray-100 text-center\">\n      <h2 class=\"text-3xl font-bold mb-6\">Get in Touch</h2>\n      <form class=\"max-w-md mx-auto grid gap-4\">\n        <input type=\"text\" placeholder=\"Name\" class=\"border p-2 rounded\">\n        <input type=\"email\" placeholder=\"Email\" class=\"border p-2 rounded\">\n        <textarea placeholder=\"Message\" class=\"border p-2 rounded\"></textarea>\n        <button class=\"bg-black text-white py-2 rounded\">Send Message</button>\n      </form>\n    </section>\n  ",
      });

      blockManager.add('hero-right', {
        label: 'Hero (Image Right)',
        category: 'Sections',
        attributes: { class: 'fa fa-image' },
        content: "\n    <section class=\"py-20 bg-gray-50\">\n      <div class=\"max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center\">\n        <div>\n          <h1 class=\"text-5xl font-bold mb-4\">Build Faster with Webmakerr</h1>\n          <p class=\"text-gray-600 mb-6\">A complete no-code builder for WordPress multisite.</p>\n          <button class=\"bg-black text-white px-6 py-2 rounded\">Get Started</button>\n        </div>\n        <div>\n          <img src=\"https://placehold.co/500x400\" class=\"w-full rounded\">\n        </div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('header-bar', {
        label: 'Header Bar',
        category: 'Layout',
        attributes: { class: 'fa fa-bars' },
        content: "\n    <header class=\"bg-white shadow py-4\">\n      <div class=\"max-w-6xl mx-auto flex justify-between items-center px-4\">\n        <div class=\"font-bold text-xl\">Webmakerr</div>\n        <nav class=\"space-x-6\">\n          <a href=\"#\" class=\"text-gray-700 hover:text-black\">Home</a>\n          <a href=\"#\" class=\"text-gray-700 hover:text-black\">About</a>\n          <a href=\"#\" class=\"text-gray-700 hover:text-black\">Contact</a>\n        </nav>\n      </div>\n    </header>\n  ",
      });

      blockManager.add('three-features', {
        label: 'Three Features',
        category: 'Sections',
        attributes: { class: 'fa fa-th-large' },
        content: "\n    <section class=\"py-16 text-center\">\n      <h2 class=\"text-3xl font-bold mb-12\">Our Core Features</h2>\n      <div class=\"grid md:grid-cols-3 gap-8 max-w-6xl mx-auto\">\n        <div class=\"p-6 border rounded\">\n          <h3 class=\"font-semibold mb-2\">Speed</h3>\n          <p class=\"text-gray-600\">Optimized for performance and quick deployment.</p>\n        </div>\n        <div class=\"p-6 border rounded bg-gray-50\">\n          <h3 class=\"font-semibold mb-2\">Scalability</h3>\n          <p class=\"text-gray-600\">Built to handle large multisite networks with ease.</p>\n        </div>\n        <div class=\"p-6 border rounded\">\n          <h3 class=\"font-semibold mb-2\">Security</h3>\n          <p class=\"text-gray-600\">Protected by industry-standard security practices.</p>\n        </div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('services', {
        label: 'Services Grid',
        category: 'Sections',
        attributes: { class: 'fa fa-cogs' },
        content: "\n    <section class=\"py-20 bg-gray-100\">\n      <div class=\"max-w-6xl mx-auto text-center\">\n        <h2 class=\"text-3xl font-bold mb-12\">What We Offer</h2>\n        <div class=\"grid md:grid-cols-4 gap-6\">\n          <div class=\"p-6 bg-white rounded border\">\n            <h4 class=\"font-semibold mb-2\">SEO Optimization</h4>\n            <p class=\"text-gray-600 text-sm\">Boost your visibility organically.</p>\n          </div>\n          <div class=\"p-6 bg-white rounded border\">\n            <h4 class=\"font-semibold mb-2\">Analytics</h4>\n            <p class=\"text-gray-600 text-sm\">Real-time data and insights.</p>\n          </div>\n          <div class=\"p-6 bg-white rounded border\">\n            <h4 class=\"font-semibold mb-2\">Integrations</h4>\n            <p class=\"text-gray-600 text-sm\">Connect to all your favorite tools.</p>\n          </div>\n          <div class=\"p-6 bg-white rounded border\">\n            <h4 class=\"font-semibold mb-2\">Support</h4>\n            <p class=\"text-gray-600 text-sm\">We’re here 24/7 to help you grow.</p>\n          </div>\n        </div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('team', {
        label: 'Team Section',
        category: 'Sections',
        attributes: { class: 'fa fa-users' },
        content: "\n    <section class=\"py-20 text-center\">\n      <h2 class=\"text-3xl font-bold mb-10\">Meet Our Team</h2>\n      <div class=\"grid md:grid-cols-3 gap-8 max-w-5xl mx-auto\">\n        <div><img src=\"https://placehold.co/150x150\" class=\"rounded-full mb-4 mx-auto\"><h3 class=\"font-semibold\">Jane</h3><p class=\"text-sm text-gray-500\">CEO</p></div>\n        <div><img src=\"https://placehold.co/150x150\" class=\"rounded-full mb-4 mx-auto\"><h3 class=\"font-semibold\">Mark</h3><p class=\"text-sm text-gray-500\">CTO</p></div>\n        <div><img src=\"https://placehold.co/150x150\" class=\"rounded-full mb-4 mx-auto\"><h3 class=\"font-semibold\">Sara</h3><p class=\"text-sm text-gray-500\">Designer</p></div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('testimonials-alt', {
        label: 'Testimonials',
        category: 'Sections',
        attributes: { class: 'fa fa-comment' },
        content: "\n    <section class=\"bg-gray-50 py-20 text-center\">\n      <h2 class=\"text-3xl font-bold mb-10\">What Clients Say</h2>\n      <div class=\"grid md:grid-cols-3 gap-6 max-w-6xl mx-auto\">\n        <div class=\"p-6 border rounded\"><p>\"Webmakerr made building our site effortless!\"</p><p class=\"mt-2 text-sm text-gray-500\">— Amanda</p></div>\n        <div class=\"p-6 border rounded\"><p>\"Fast, flexible, and reliable.\"</p><p class=\"mt-2 text-sm text-gray-500\">— Daniel</p></div>\n        <div class=\"p-6 border rounded\"><p>\"We scaled to 100 sites without issues.\"</p><p class=\"mt-2 text-sm text-gray-500\">— Priya</p></div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('pricing-plans', {
        label: 'Pricing Plans',
        category: 'Sections',
        attributes: { class: 'fa fa-dollar' },
        content: "\n    <section class=\"py-20 text-center\">\n      <h2 class=\"text-3xl font-bold mb-10\">Choose Your Plan</h2>\n      <div class=\"grid md:grid-cols-3 gap-8 max-w-6xl mx-auto\">\n        <div class=\"border rounded p-6\">\n          <h3 class=\"font-semibold mb-2\">Starter</h3>\n          <p class=\"text-3xl font-bold mb-4\">$9/mo</p>\n          <ul class=\"text-sm text-gray-600 mb-4\"><li>1 Website</li><li>Email Support</li></ul>\n          <button class=\"bg-black text-white px-6 py-2 rounded\">Select</button>\n        </div>\n        <div class=\"border rounded p-6 bg-gray-50\">\n          <h3 class=\"font-semibold mb-2\">Professional</h3>\n          <p class=\"text-3xl font-bold mb-4\">$29/mo</p>\n          <ul class=\"text-sm text-gray-600 mb-4\"><li>5 Websites</li><li>Priority Support</li></ul>\n          <button class=\"bg-black text-white px-6 py-2 rounded\">Select</button>\n        </div>\n        <div class=\"border rounded p-6\">\n          <h3 class=\"font-semibold mb-2\">Enterprise</h3>\n          <p class=\"text-3xl font-bold mb-4\">$99/mo</p>\n          <ul class=\"text-sm text-gray-600 mb-4\"><li>Unlimited Sites</li><li>Dedicated Support</li></ul>\n          <button class=\"bg-black text-white px-6 py-2 rounded\">Select</button>\n        </div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('faq', {
        label: 'FAQ Section',
        category: 'Sections',
        attributes: { class: 'fa fa-question-circle' },
        content: "\n    <section class=\"py-20 bg-gray-50\">\n      <div class=\"max-w-4xl mx-auto\">\n        <h2 class=\"text-3xl font-bold text-center mb-10\">Frequently Asked Questions</h2>\n        <div class=\"space-y-6\">\n          <div><h4 class=\"font-semibold mb-2\">How does Webmakerr work?</h4><p class=\"text-gray-600\">It provides templates and an editor to manage your entire site visually.</p></div>\n          <div><h4 class=\"font-semibold mb-2\">Can I host multiple sites?</h4><p class=\"text-gray-600\">Yes, our multisite setup supports unlimited websites.</p></div>\n          <div><h4 class=\"font-semibold mb-2\">Is support included?</h4><p class=\"text-gray-600\">Absolutely — we offer 24/7 dedicated support.</p></div>\n        </div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('contact-form', {
        label: 'Contact Form',
        category: 'Sections',
        attributes: { class: 'fa fa-envelope' },
        content: "\n    <section class=\"py-20 text-center bg-gray-100\">\n      <h2 class=\"text-3xl font-bold mb-6\">Get in Touch</h2>\n      <form class=\"max-w-md mx-auto grid gap-4\">\n        <input type=\"text\" placeholder=\"Your Name\" class=\"border p-2 rounded\">\n        <input type=\"email\" placeholder=\"Your Email\" class=\"border p-2 rounded\">\n        <textarea placeholder=\"Message\" class=\"border p-2 rounded\"></textarea>\n        <button class=\"bg-black text-white py-2 rounded\">Send</button>\n      </form>\n    </section>\n  ",
      });

      blockManager.add('about', {
        label: 'About Section',
        category: 'Sections',
        attributes: { class: 'fa fa-user' },
        content: "\n    <section class=\"py-20 bg-white text-center\">\n      <div class=\"max-w-4xl mx-auto\">\n        <h2 class=\"text-3xl font-bold mb-6\">About Us</h2>\n        <p class=\"text-gray-600 text-lg leading-relaxed mb-8\">\n          Webmakerr helps businesses build beautiful, scalable websites in minutes — \n          without touching code. We focus on design, performance, and simplicity.\n        </p>\n        <img src=\"https://placehold.co/800x400\" class=\"rounded shadow mx-auto\">\n      </div>\n    </section>\n  ",
      });

      blockManager.add('stats', {
        label: 'Stats Section',
        category: 'Sections',
        attributes: { class: 'fa fa-bar-chart' },
        content: "\n    <section class=\"py-20 bg-gray-50 text-center\">\n      <h2 class=\"text-3xl font-bold mb-10\">Our Numbers Speak for Themselves</h2>\n      <div class=\"grid md:grid-cols-4 gap-8 max-w-6xl mx-auto\">\n        <div><h3 class=\"text-5xl font-bold text-black mb-2\">500+</h3><p class=\"text-gray-600\">Clients</p></div>\n        <div><h3 class=\"text-5xl font-bold text-black mb-2\">1K+</h3><p class=\"text-gray-600\">Websites</p></div>\n        <div><h3 class=\"text-5xl font-bold text-black mb-2\">99.9%</h3><p class=\"text-gray-600\">Uptime</p></div>\n        <div><h3 class=\"text-5xl font-bold text-black mb-2\">24/7</h3><p class=\"text-gray-600\">Support</p></div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('gallery', {
        label: 'Gallery',
        category: 'Media',
        attributes: { class: 'fa fa-picture-o' },
        content: "\n    <section class=\"py-16 bg-white\">\n      <div class=\"max-w-6xl mx-auto\">\n        <h2 class=\"text-3xl font-bold text-center mb-10\">Gallery</h2>\n        <div class=\"grid md:grid-cols-3 gap-4\">\n          <img src=\"https://placehold.co/400x300\" class=\"rounded shadow\">\n          <img src=\"https://placehold.co/400x300\" class=\"rounded shadow\">\n          <img src=\"https://placehold.co/400x300\" class=\"rounded shadow\">\n          <img src=\"https://placehold.co/400x300\" class=\"rounded shadow\">\n          <img src=\"https://placehold.co/400x300\" class=\"rounded shadow\">\n          <img src=\"https://placehold.co/400x300\" class=\"rounded shadow\">\n        </div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('cta', {
        label: 'Call to Action',
        category: 'Sections',
        attributes: { class: 'fa fa-bullhorn' },
        content: "\n    <section class=\"py-20 bg-black text-white text-center\">\n      <h2 class=\"text-3xl font-bold mb-4\">Ready to Grow Your Business?</h2>\n      <p class=\"text-gray-300 mb-6\">Join thousands of creators using Webmakerr today.</p>\n      <button class=\"bg-white text-black px-6 py-3 rounded font-semibold\">Get Started Now</button>\n    </section>\n  ",
      });

      blockManager.add('blog', {
        label: 'Blog Grid',
        category: 'Content',
        attributes: { class: 'fa fa-newspaper-o' },
        content: "\n    <section class=\"py-20 bg-gray-50\">\n      <div class=\"max-w-6xl mx-auto text-center\">\n        <h2 class=\"text-3xl font-bold mb-12\">Latest Articles</h2>\n        <div class=\"grid md:grid-cols-3 gap-8\">\n          <article class=\"bg-white p-6 border rounded\">\n            <img src=\"https://placehold.co/400x200\" class=\"rounded mb-4\">\n            <h3 class=\"font-semibold text-lg mb-2\">How to Build Faster</h3>\n            <p class=\"text-gray-600 text-sm\">Learn how Webmakerr helps you scale your website creation process...</p>\n            <a href=\"#\" class=\"text-black underline mt-2 inline-block\">Read more</a>\n          </article>\n          <article class=\"bg-white p-6 border rounded\">\n            <img src=\"https://placehold.co/400x200\" class=\"rounded mb-4\">\n            <h3 class=\"font-semibold text-lg mb-2\">Why Tailwind Rules</h3>\n            <p class=\"text-gray-600 text-sm\">Tailwind CSS simplifies your front-end workflow. Here’s how...</p>\n            <a href=\"#\" class=\"text-black underline mt-2 inline-block\">Read more</a>\n          </article>\n          <article class=\"bg-white p-6 border rounded\">\n            <img src=\"https://placehold.co/400x200\" class=\"rounded mb-4\">\n            <h3 class=\"font-semibold text-lg mb-2\">Scaling Multisite</h3>\n            <p class=\"text-gray-600 text-sm\">Tips on managing hundreds of sites using one core theme...</p>\n            <a href=\"#\" class=\"text-black underline mt-2 inline-block\">Read more</a>\n          </article>\n        </div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('newsletter', {
        label: 'Newsletter Signup',
        category: 'Forms',
        attributes: { class: 'fa fa-envelope-o' },
        content: "\n    <section class=\"py-20 bg-gray-100 text-center\">\n      <h2 class=\"text-3xl font-bold mb-6\">Stay in the Loop</h2>\n      <p class=\"text-gray-600 mb-8\">Get updates, tutorials, and exclusive offers right in your inbox.</p>\n      <form class=\"max-w-md mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4\">\n        <input type=\"email\" placeholder=\"Your Email\" class=\"border p-2 rounded col-span-2\">\n        <button class=\"bg-black text-white py-2 rounded\">Subscribe</button>\n      </form>\n    </section>\n  ",
      });

      blockManager.add('timeline', {
        label: 'Timeline',
        category: 'Sections',
        attributes: { class: 'fa fa-clock-o' },
        content: "\n    <section class=\"py-20 bg-gray-50\">\n      <div class=\"max-w-4xl mx-auto\">\n        <h2 class=\"text-3xl font-bold text-center mb-10\">Our Journey</h2>\n        <ol class=\"relative border-l border-gray-200\">\n          <li class=\"mb-10 ml-6\">\n            <div class=\"absolute -left-3 flex items-center justify-center w-6 h-6 bg-black rounded-full\"></div>\n            <h3 class=\"font-semibold text-lg mb-1\">Founded in 2020</h3>\n            <p class=\"text-gray-600\">Started as a small team building sites for startups.</p>\n          </li>\n          <li class=\"mb-10 ml-6\">\n            <div class=\"absolute -left-3 flex items-center justify-center w-6 h-6 bg-black rounded-full\"></div>\n            <h3 class=\"font-semibold text-lg mb-1\">Launched Webmakerr</h3>\n            <p class=\"text-gray-600\">Released our SaaS platform for WordPress Multisite.</p>\n          </li>\n          <li class=\"ml-6\">\n            <div class=\"absolute -left-3 flex items-center justify-center w-6 h-6 bg-black rounded-full\"></div>\n            <h3 class=\"font-semibold text-lg mb-1\">Expanding Worldwide</h3>\n            <p class=\"text-gray-600\">Serving thousands of clients across 50+ countries.</p>\n          </li>\n        </ol>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('partners', {
        label: 'Partner Logos',
        category: 'Sections',
        attributes: { class: 'fa fa-handshake-o' },
        content: "\n    <section class=\"py-12 bg-white text-center\">\n      <h2 class=\"text-2xl font-semibold mb-8\">Trusted by Leading Brands</h2>\n      <div class=\"flex flex-wrap justify-center gap-8 opacity-80\">\n        <img src=\"https://placehold.co/120x40\" class=\"h-10 grayscale\">\n        <img src=\"https://placehold.co/120x40\" class=\"h-10 grayscale\">\n        <img src=\"https://placehold.co/120x40\" class=\"h-10 grayscale\">\n        <img src=\"https://placehold.co/120x40\" class=\"h-10 grayscale\">\n        <img src=\"https://placehold.co/120x40\" class=\"h-10 grayscale\">\n      </div>\n    </section>\n  ",
      });

      blockManager.add('steps', {
        label: 'Steps Section',
        category: 'Sections',
        attributes: { class: 'fa fa-list-ol' },
        content: "\n    <section class=\"py-20 bg-gray-100\">\n      <div class=\"max-w-5xl mx-auto text-center\">\n        <h2 class=\"text-3xl font-bold mb-12\">How It Works</h2>\n        <div class=\"grid md:grid-cols-3 gap-8\">\n          <div class=\"p-6 bg-white rounded border\">\n            <h3 class=\"text-xl font-semibold mb-2\">1. Sign Up</h3>\n            <p class=\"text-gray-600 text-sm\">Create your Webmakerr account.</p>\n          </div>\n          <div class=\"p-6 bg-white rounded border\">\n            <h3 class=\"text-xl font-semibold mb-2\">2. Customize</h3>\n            <p class=\"text-gray-600 text-sm\">Pick a template and edit visually.</p>\n          </div>\n          <div class=\"p-6 bg-white rounded border\">\n            <h3 class=\"text-xl font-semibold mb-2\">3. Launch</h3>\n            <p class=\"text-gray-600 text-sm\">Publish your site instantly.</p>\n          </div>\n        </div>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('video', {
        label: 'Video Embed',
        category: 'Media',
        attributes: { class: 'fa fa-play-circle' },
        content: "\n    <section class=\"py-20 bg-black text-center\">\n      <h2 class=\"text-3xl font-bold text-white mb-8\">Watch How It Works</h2>\n      <div class=\"max-w-4xl mx-auto aspect-video\">\n        <iframe class=\"w-full h-96 rounded\" src=\"https://www.youtube.com/embed/dQw4w9WgXcQ\" allowfullscreen></iframe>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('map', {
        label: 'Google Map',
        category: 'Media',
        attributes: { class: 'fa fa-map-marker' },
        content: "\n    <section class=\"py-20\">\n      <h2 class=\"text-3xl font-bold text-center mb-10\">Find Us</h2>\n      <div class=\"w-full h-96\">\n        <iframe class=\"w-full h-full border-0\"\n          src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151!2d144.9631!3d-37.8136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf5776cf47eaa6a0!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sau!4v1614556800000!5m2!1sen!2sau\"\n          loading=\"lazy\">\n        </iframe>\n      </div>\n    </section>\n  ",
      });

      blockManager.add('footer-dark', {
        label: 'Footer (Dark)',
        category: 'Sections',
        attributes: { class: 'fa fa-circle' },
        content: "\n    <footer class=\"bg-black text-gray-300 py-10\">\n      <div class=\"max-w-6xl mx-auto grid md:grid-cols-4 gap-8 px-4\">\n        <div>\n          <h3 class=\"text-white font-semibold mb-4\">Webmakerr</h3>\n          <p class=\"text-sm text-gray-400\">Simplifying multisite web creation for everyone.</p>\n        </div>\n        <div>\n          <h4 class=\"text-white font-semibold mb-3\">Company</h4>\n          <ul class=\"space-y-2 text-sm\">\n            <li><a href=\"#\" class=\"hover:text-white\">About</a></li>\n            <li><a href=\"#\" class=\"hover:text-white\">Careers</a></li>\n            <li><a href=\"#\" class=\"hover:text-white\">Press</a></li>\n          </ul>\n        </div>\n        <div>\n          <h4 class=\"text-white font-semibold mb-3\">Resources</h4>\n          <ul class=\"space-y-2 text-sm\">\n            <li><a href=\"#\" class=\"hover:text-white\">Docs</a></li>\n            <li><a href=\"#\" class=\"hover:text-white\">API</a></li>\n            <li><a href=\"#\" class=\"hover:text-white\">Support</a></li>\n          </ul>\n        </div>\n        <div>\n          <h4 class=\"text-white font-semibold mb-3\">Follow</h4>\n          <ul class=\"space-y-2 text-sm\">\n            <li><a href=\"#\" class=\"hover:text-white\">Twitter</a></li>\n            <li><a href=\"#\" class=\"hover:text-white\">LinkedIn</a></li>\n            <li><a href=\"#\" class=\"hover:text-white\">GitHub</a></li>\n          </ul>\n        </div>\n      </div>\n      <div class=\"text-center text-gray-500 text-sm mt-8\">© 2025 Webmakerr — All rights reserved.</div>\n    </footer>\n  ",
      });

      if (editor && editor.Panels) {
        editor.Panels.addButton('options', [
          {
            id: 'load-layouts',
            className: 'fa fa-folder-open',
            attributes: { title: 'Load Layout' },
            command: 'open-layouts',
          },
        ]);
      }

      editor.Commands.add('open-layouts', {
        run: function (ed) {
          if (document.querySelector('.gjs-load-layout-panel')) {
            return;
          }

          if (typeof window.wp === 'undefined' || !window.wp.apiRequest) {
            window.alert('WordPress API is not available.');
            return;
          }

          var panel = document.createElement('div');
          panel.className = 'gjs-load-layout-panel';
          panel.style.position = 'fixed';
          panel.style.top = '50%';
          panel.style.left = '50%';
          panel.style.transform = 'translate(-50%, -50%)';
          panel.style.background = '#fff';
          panel.style.padding = '20px';
          panel.style.border = '1px solid #ccc';
          panel.style.zIndex = '9999';
          panel.innerHTML =
            '<h3 style="margin-bottom:10px;">Select a Layout</h3>' +
            '<button data-layout="home">Home</button>' +
            '<button data-layout="about">About</button>' +
            '<button data-layout="services">Services</button>' +
            '<button id="close-layouts" style="float:right;">Close</button>';
          document.body.appendChild(panel);

          var closePanel = function () {
            panel.remove();
          };

          panel.querySelectorAll('button[data-layout]').forEach(function (btn) {
            btn.addEventListener('click', function (event) {
              var layout = event.target.getAttribute('data-layout');

              window.wp
                .apiRequest({ path: '/webbuilder/v1/layout/' + layout })
                .then(function (response) {
                  if (!response) {
                    return;
                  }

                  ed.setComponents(response.html || '');
                  ed.setStyle(response.css || '');
                  window.alert('Layout loaded!');
                  closePanel();
                })
                .catch(function (error) {
                  window.alert('Unable to load the selected layout.');
                  // eslint-disable-next-line no-console
                  console.error('GrapesJS Page Builder:', error);
                });
            });
          });

          var closeButton = panel.querySelector('#close-layouts');

          if (closeButton) {
            closeButton.addEventListener('click', closePanel);
          }
        },
      });

      var postId = parseInt(container.dataset.postId || '0', 10);
      var saveButtonSelector = container.dataset.saveButton || '';
      var saveStatusSelector = container.dataset.saveStatus || '';
      var saveButton = saveButtonSelector ? document.querySelector(saveButtonSelector) : null;
      var saveStatus = saveStatusSelector ? document.querySelector(saveStatusSelector) : null;

      var saveContent = function () {
        if (
          !(postId > 0 &&
          typeof window.grapesjsPageBuilder !== 'undefined' &&
          window.grapesjsPageBuilder.ajaxUrl)
        ) {
          window.alert('Saving is not configured for this editor.');
          return Promise.reject(new Error('Saving is not configured.'));
        }

        if (saveStatus) {
          setStatusMessage(saveStatus, '');
        }

        if (saveButton) {
          saveButton.disabled = true;
        }

        var params = new window.URLSearchParams();
        params.append('action', 'grapesjs_save_content');
        params.append('nonce', window.grapesjsPageBuilder.nonce || '');
        params.append('post_id', String(postId));
        params.append('content', editor.getHtml());
        params.append('css', editor.getCss());

        return fetch(window.grapesjsPageBuilder.ajaxUrl, {
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

            if (saveStatus) {
              setStatusMessage(saveStatus, strings.saveSuccess, 'success');
            }

            return payload;
          })
          .catch(function (error) {
            // eslint-disable-next-line no-console
            console.error('GrapesJS Page Builder:', error);
            var message = error && error.message ? error.message : strings.saveError;

            if (saveStatus) {
              setStatusMessage(saveStatus, message, 'error');
            }

            throw error;
          })
          .finally(function () {
            if (saveButton) {
              saveButton.disabled = false;
            }
          });
      };

      editor.Commands.add('save-db', {
        run: function () {
          saveContent().catch(function () {
            // Errors are already logged and surfaced to the user.
          });
        },
      });

      if (editor && editor.Panels) {
        editor.Panels.addButton('options', [
          {
            id: 'save',
            className: 'fa fa-floppy-o',
            command: 'save-db',
            attributes: { title: 'Save to WordPress' },
          },
        ]);
      }

      if (saveButton) {
        saveButton.addEventListener('click', function (event) {
          event.preventDefault();
          editor.runCommand('save-db');
        });
      }

      if (postId > 0 && typeof window.wp !== 'undefined' && window.wp.apiRequest) {
        window.wp
          .apiRequest({ path: '/wp/v2/pages/' + postId })
          .then(function (page) {
            if (!page || !page.meta) {
              return;
            }

            var html = page.meta._webbuilder_html || '';
            var css = page.meta._webbuilder_css || '';

            if (html) {
              editor.setComponents(html);
            }

            if (css) {
              editor.setStyle(css);
            }
          })
          .catch(function (error) {
            // eslint-disable-next-line no-console
            console.error('GrapesJS Page Builder:', error);
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
