document.addEventListener('DOMContentLoaded', () => {
  const postId = new URLSearchParams(window.location.search).get('post_id');

  const editor = grapesjs.init({
    container: '#gjs',
    height: '100vh',
    width: 'auto',
    storageManager: { autoload: false },
    plugins: ['gjs-blocks-basic'],
    canvas: {
      styles: [
        'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
      ]
    }
  });

  // Remove only unsafe panels
  editor.Panels.removeButton('options', 'export-template');
  editor.Panels.removeButton('options', 'gjs-open-import-webpage');
  editor.Panels.removeButton('options', 'gjs-open-templates');
  editor.Panels.removeButton('views', 'open-sm');  // style manager
  editor.Panels.removeButton('views', 'open-layers');
  editor.Panels.removeButton('views', 'open-tm');  // trait manager

  // Keep block manager + device manager
  editor.Panels.getButton('views', 'open-blocks').set('active', true);
  const blockManager = editor.BlockManager;

  // Hero Section
  blockManager.add('hero', {
    label: 'Hero Section',
    category: 'Sections',
    attributes: { class: 'fa fa-header' },
    content: `
      <section class="bg-gray-100 py-20 text-center">
        <h1 class="text-4xl font-bold mb-4">Welcome to Your New Site</h1>
        <p class="text-gray-600 mb-6">You can edit this section easily.</p>
        <button class="bg-black text-white px-6 py-2 rounded">Get Started</button>
      </section>
    `
  });

  // Features Grid
  blockManager.add('features', {
    label: 'Features Grid',
    category: 'Sections',
    attributes: { class: 'fa fa-th' },
    content: `
      <section class="py-16">
        <div class="grid md:grid-cols-3 gap-8 text-center">
          <div><h3 class="text-xl font-semibold mb-2">Fast</h3><p>Quick to set up.</p></div>
          <div><h3 class="text-xl font-semibold mb-2">Reliable</h3><p>Powered by Webmakerr.</p></div>
          <div><h3 class="text-xl font-semibold mb-2">Scalable</h3><p>Built for growth.</p></div>
        </div>
      </section>
    `
  });

  // Footer
  blockManager.add('footer', {
    label: 'Footer',
    category: 'Sections',
    attributes: { class: 'fa fa-bars' },
    content: `
      <footer class="bg-gray-900 text-white text-center py-6">
        <p>&copy; 2025 Webmakerr. All rights reserved.</p>
      </footer>
    `
  });
  
  // Two Column Section
blockManager.add('two-cols', {
  label: 'Two Columns',
  category: 'Layout',
  attributes: { class: 'fa fa-columns' },
  content: `
    <section class="py-16 grid md:grid-cols-2 gap-8 items-center">
      <div><h2 class="text-3xl font-bold mb-4">Left Column</h2><p>Text or image here.</p></div>
      <div><img src="https://placehold.co/500x300" class="rounded"></div>
    </section>
  `
});

// Testimonial Section
blockManager.add('testimonials', {
  label: 'Testimonials',
  category: 'Sections',
  attributes: { class: 'fa fa-comments' },
  content: `
    <section class="bg-gray-50 py-16 text-center">
      <h2 class="text-2xl font-semibold mb-8">What Our Users Say</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="p-4 border rounded"><p>"Amazing product!"</p><p class="mt-2 text-sm text-gray-500">— Sarah</p></div>
        <div class="p-4 border rounded"><p>"So easy to use."</p><p class="mt-2 text-sm text-gray-500">— Alex</p></div>
        <div class="p-4 border rounded"><p>"Highly recommend."</p><p class="mt-2 text-sm text-gray-500">— Maria</p></div>
      </div>
    </section>
  `
});

// Pricing Section
blockManager.add('pricing', {
  label: 'Pricing Table',
  category: 'Sections',
  attributes: { class: 'fa fa-table' },
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
  `
});

// Contact Section
blockManager.add('contact', {
  label: 'Contact Section',
  category: 'Sections',
  attributes: { class: 'fa fa-envelope' },
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
  `
});

// Hero with Image Right
blockManager.add('hero-right', {
  label: 'Hero (Image Right)',
  category: 'Sections',
  attributes: { class: 'fa fa-image' },
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
  `
});

// Simple Header Bar
blockManager.add('header-bar', {
  label: 'Header Bar',
  category: 'Layout',
  attributes: { class: 'fa fa-bars' },
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
  `
});

// Three Feature Cards
blockManager.add('three-features', {
  label: 'Three Features',
  category: 'Sections',
  attributes: { class: 'fa fa-th-large' },
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
  `
});

// Services Grid
blockManager.add('services', {
  label: 'Services Grid',
  category: 'Sections',
  attributes: { class: 'fa fa-cogs' },
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
  `
});

  // Team Section
blockManager.add('team', {
  label: 'Team Section',
  category: 'Sections',
  attributes: { class: 'fa fa-users' },
  content: `
    <section class="py-20 text-center">
      <h2 class="text-3xl font-bold mb-10">Meet Our Team</h2>
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div><img src="https://placehold.co/150x150" class="rounded-full mb-4 mx-auto"><h3 class="font-semibold">Jane</h3><p class="text-sm text-gray-500">CEO</p></div>
        <div><img src="https://placehold.co/150x150" class="rounded-full mb-4 mx-auto"><h3 class="font-semibold">Mark</h3><p class="text-sm text-gray-500">CTO</p></div>
        <div><img src="https://placehold.co/150x150" class="rounded-full mb-4 mx-auto"><h3 class="font-semibold">Sara</h3><p class="text-sm text-gray-500">Designer</p></div>
      </div>
    </section>
  `
});

// Testimonials Section
blockManager.add('testimonials', {
  label: 'Testimonials',
  category: 'Sections',
  attributes: { class: 'fa fa-comment' },
  content: `
    <section class="bg-gray-50 py-20 text-center">
      <h2 class="text-3xl font-bold mb-10">What Clients Say</h2>
      <div class="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div class="p-6 border rounded"><p>"Webmakerr made building our site effortless!"</p><p class="mt-2 text-sm text-gray-500">— Amanda</p></div>
        <div class="p-6 border rounded"><p>"Fast, flexible, and reliable."</p><p class="mt-2 text-sm text-gray-500">— Daniel</p></div>
        <div class="p-6 border rounded"><p>"We scaled to 100 sites without issues."</p><p class="mt-2 text-sm text-gray-500">— Priya</p></div>
      </div>
    </section>
  `
});

  // Pricing
blockManager.add('pricing', {
  label: 'Pricing Plans',
  category: 'Sections',
  attributes: { class: 'fa fa-dollar' },
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
  `
});

// FAQ
blockManager.add('faq', {
  label: 'FAQ Section',
  category: 'Sections',
  attributes: { class: 'fa fa-question-circle' },
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
  `
});

// Contact Section
blockManager.add('contact', {
  label: 'Contact Form',
  category: 'Sections',
  attributes: { class: 'fa fa-envelope' },
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
  `
});

 blockManager.add('about', {
  label: 'About Section',
  category: 'Sections',
  attributes: { class: 'fa fa-user' },
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
  `
});

  blockManager.add('stats', {
  label: 'Stats Section',
  category: 'Sections',
  attributes: { class: 'fa fa-bar-chart' },
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
  `
});

 blockManager.add('gallery', {
  label: 'Gallery',
  category: 'Media',
  attributes: { class: 'fa fa-picture-o' },
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
  `
});

  blockManager.add('cta', {
  label: 'Call to Action',
  category: 'Sections',
  attributes: { class: 'fa fa-bullhorn' },
  content: `
    <section class="py-20 bg-black text-white text-center">
      <h2 class="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
      <p class="text-gray-300 mb-6">Join thousands of creators using Webmakerr today.</p>
      <button class="bg-white text-black px-6 py-3 rounded font-semibold">Get Started Now</button>
    </section>
  `
});

  blockManager.add('blog', {
  label: 'Blog Grid',
  category: 'Content',
  attributes: { class: 'fa fa-newspaper-o' },
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
  `
});

  blockManager.add('newsletter', {
  label: 'Newsletter Signup',
  category: 'Forms',
  attributes: { class: 'fa fa-envelope-o' },
  content: `
    <section class="py-20 bg-gray-100 text-center">
      <h2 class="text-3xl font-bold mb-6">Stay in the Loop</h2>
      <p class="text-gray-600 mb-8">Get updates, tutorials, and exclusive offers right in your inbox.</p>
      <form class="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input type="email" placeholder="Your Email" class="border p-2 rounded col-span-2">
        <button class="bg-black text-white py-2 rounded">Subscribe</button>
      </form>
    </section>
  `
});

  blockManager.add('timeline', {
  label: 'Timeline',
  category: 'Sections',
  attributes: { class: 'fa fa-clock-o' },
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
  `
});

  blockManager.add('partners', {
  label: 'Partner Logos',
  category: 'Sections',
  attributes: { class: 'fa fa-handshake-o' },
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
  `
});

  blockManager.add('steps', {
  label: 'Steps Section',
  category: 'Sections',
  attributes: { class: 'fa fa-list-ol' },
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
  `
});

  blockManager.add('video', {
  label: 'Video Embed',
  category: 'Media',
  attributes: { class: 'fa fa-play-circle' },
  content: `
    <section class="py-20 bg-black text-center">
      <h2 class="text-3xl font-bold text-white mb-8">Watch How It Works</h2>
      <div class="max-w-4xl mx-auto aspect-video">
        <iframe class="w-full h-96 rounded" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
      </div>
    </section>
  `
});

  blockManager.add('map', {
  label: 'Google Map',
  category: 'Media',
  attributes: { class: 'fa fa-map-marker' },
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
  `
});

  blockManager.add('footer-dark', {
  label: 'Footer (Dark)',
  category: 'Sections',
  attributes: { class: 'fa fa-circle' },
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
  `
});
// Load Layouts Start

 // ---- Load Pre-made Layouts ----
editor.Panels.addButton('options', [{
  id: 'load-layouts',
  className: 'fa fa-folder-open',
  attributes: { title: 'Load Layout' },
  command: 'open-layouts'
}]);

editor.Commands.add('open-layouts', {
  run: function(ed) {
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '50%';
    panel.style.left = '50%';
    panel.style.transform = 'translate(-50%, -50%)';
    panel.style.background = '#fff';
    panel.style.padding = '20px';
    panel.style.border = '1px solid #ccc';
    panel.style.zIndex = '9999';
    panel.innerHTML = `
      <h3 style="margin-bottom:10px;">Select a Layout</h3>
      <button data-layout="home">Home</button>
      <button data-layout="about">About</button>
      <button data-layout="services">Services</button>
      <button id="close-layouts" style="float:right;">Close</button>
    `;
    document.body.appendChild(panel);

    panel.querySelectorAll('button[data-layout]').forEach(btn => {
      btn.addEventListener('click', e => {
        const layout = e.target.getAttribute('data-layout');
        wp.apiRequest({ path: '/webbuilder/v1/layout/' + layout }).done(res => {
          ed.setComponents(res.html);
          ed.setStyle(res.css || '');
          alert('Layout loaded!');
        });
      });
    });
    panel.querySelector('#close-layouts').addEventListener('click', () => panel.remove());
  }
});

  // Load Layouts ends
  // Save button
  editor.Panels.addButton('options',[{
    id:'save',
    className:'fa fa-floppy-o',
    command:'save-db',
    attributes:{ title:'Save to WordPress' }
  }]);

  // Load existing content if available
  wp.apiRequest({ path: `/wp/v2/pages/${postId}` }).done(p => {
    const html = p.meta?._webbuilder_html || '';
    const css  = p.meta?._webbuilder_css  || '';
    if (html) editor.setComponents(html);
    if (css)  editor.setStyle(css);
  });

  // Save logic
  editor.Commands.add('save-db',{
    run:(ed,s)=>{
      s&&s.set('active');
      wp.apiRequest({
        path:'/webbuilder/v1/save',
        method:'POST',
        data:{
          post_id:postId,
          html:ed.getHtml(),
          css:ed.getCss()
        }
      }).done(()=>alert('Saved!'));
    }
  });
});
