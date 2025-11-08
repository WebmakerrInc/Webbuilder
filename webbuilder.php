<?php
/**
 * Plugin Name: WebBuilder Pages
 * Description: Per-page GrapesJS builder with admin-bar button, Tailwind canvas, and pre-made layout loading.
 * Version: 1.2
 * Author: Webmakerr
 */

if (!defined('ABSPATH')) exit;

/* ──────────────────────────────
 * Admin page
 * ────────────────────────────── */
// Removed duplicate old admin page registration.
// The new version with welcome screen and editor handler is defined later in this file.
/*
add_action('admin_menu', function () {
    add_menu_page(
        'WebBuilder',
        'WebBuilder',
        'edit_pages',
        'webbuilder',
        function () { echo '<div id="gjs"></div>'; },
        'dashicons-layout',
        3
    );
});
*/

/* ──────────────────────────────
 * Enqueue scripts
 * ────────────────────────────── */
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'toplevel_page_webbuilder') return;

    wp_enqueue_style('grapesjs', 'https://unpkg.com/grapesjs@0.21.5/dist/css/grapes.min.css');
    wp_enqueue_script('grapesjs', 'https://unpkg.com/grapesjs@0.21.5/dist/grapes.min.js', [], null, true);

    wp_enqueue_script(
        'builder-init',
        plugin_dir_url(__FILE__) . 'assets/js/builder-init.js',
        ['grapesjs', 'wp-api-request'],
        null,
        true
    );
});

/* ──────────────────────────────
 * Register REST route for saving
 * ────────────────────────────── */
add_action('rest_api_init', function () {
    register_rest_route('webbuilder/v1', '/save', [
        'methods'  => 'POST',
        'callback' => function ($r) {
            $id = absint($r['post_id']);
            update_post_meta($id, '_webbuilder_html', $r['html']);
            update_post_meta($id, '_webbuilder_css', $r['css']);
            return ['success' => true];
        },
        'permission_callback' => fn() => current_user_can('edit_pages'),
    ]);
});

/* ──────────────────────────────
 * REST endpoint: return premade layouts
 * ────────────────────────────── */
add_action('rest_api_init', function () {
    register_rest_route('webbuilder/v1', '/layout/(?P<name>[a-z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => function ($data) {
            $name = sanitize_text_field($data['name']);
            $file = plugin_dir_path(__FILE__) . 'layouts/' . $name . '.html';
            if (file_exists($file)) {
                $html = file_get_contents($file);
                return ['html' => $html];
            }
            return new WP_Error('not_found', 'Layout not found', ['status' => 404]);
        },
        'permission_callback' => function () {
            return current_user_can('edit_pages');
        },
    ]);
});

/* ──────────────────────────────
 * Expose builder meta in REST API
 * (allows reloading saved designs)
 * ────────────────────────────── */
add_action('init', function () {
    register_meta('post', '_webbuilder_html', [
        'show_in_rest' => true,
        'type' => 'string',
        'single' => true,
        'auth_callback' => function () {
            return current_user_can('edit_pages');
        },
    ]);

    register_meta('post', '_webbuilder_css', [
        'show_in_rest' => true,
        'type' => 'string',
        'single' => true,
        'auth_callback' => function () {
            return current_user_can('edit_pages');
        },
    ]);
});

/* ──────────────────────────────
 * Render builder layout above Gutenberg content
 * ────────────────────────────── */
add_filter('the_content', function ($content) {
    if (is_admin()) return $content;
    global $post;
    if (!$post) return $content;

    $html = get_post_meta($post->ID, '_webbuilder_html', true);
    $css  = get_post_meta($post->ID, '_webbuilder_css', true);

    if ($html) {
        $built = '<style>' . $css . '</style>' . $html;
        return $built . $content; // builder first, Gutenberg below
    }
    return $content;
});

/* ──────────────────────────────
 * Add "Edit with WebBuilder" button in Admin Bar
 * ────────────────────────────── */
add_action('admin_bar_menu', function ($bar) {
    if (is_admin() || !is_page()) return;
    global $post;
    if (!$post) return;

    $url = admin_url('admin.php?page=webbuilder&post_id=' . $post->ID);

    $bar->add_menu([
        'id'    => 'edit-with-webbuilder',
        'title' => '<span style="display:inline-flex;align-items:center;gap:4px;">' . webbuilder_icon_img() . '<span style="display:inline;">Edit with WebBuilder</span></span>',
        'href'  => $url,
        'meta'  => ['title' => 'Edit this page with WebBuilder'],
    ]);
}, 100);

/* ──────────────────────────────
 * Add "Edit with WebBuilder" link in Pages list
 * ────────────────────────────── */
add_filter('page_row_actions', function ($actions, $post) {
    if (current_user_can('edit_page', $post->ID)) {
        $url = admin_url('admin.php?page=webbuilder&post_id=' . $post->ID);
        $actions['edit_webbuilder'] = '<a href="' . esc_url($url) . '" style="display:inline-flex;align-items:center;gap:4px;">' . webbuilder_icon_img() . '<span style="display:inline;">Edit with WebBuilder</span></a>';
    }
    return $actions;
}, 10, 2);


/**
 * Add "Edit with WebBuilder" button on Page edit screen
 */
add_action('edit_form_after_title', 'webbuilder_add_edit_button_above_editor');
add_action('add_meta_boxes', 'webbuilder_add_sidebar_metabox_button');

function webbuilder_get_edit_url($post_id) {
    return admin_url('admin.php?page=webbuilder&post_id=' . intval($post_id));
}

/**
 * Button above content editor
 */
function webbuilder_add_edit_button_above_editor($post) {
    if ($post->post_type !== 'page') {
        return;
    }

    $url = esc_url(webbuilder_get_edit_url($post->ID));
    echo '<a href="' . $url . '" class="button button-primary" style="background:#000; color:#fff; padding:6px 18px; font-size:14px; margin:6px 0; display:inline-flex; align-items:center;gap:4px;">' . webbuilder_icon_img() . '<span style="display:inline;">Edit with WebBuilder</span></a>';
}

/**
 * Sidebar metabox button
 */
function webbuilder_add_sidebar_metabox_button() {
    add_meta_box(
        'webbuilder_edit_button',
        __('WebBuilder', 'webbuilder'),
        'webbuilder_render_sidebar_metabox',
        'page',
        'side',
        'high'
    );
}

function webbuilder_render_sidebar_metabox($post) {
    $url = esc_url(webbuilder_get_edit_url($post->ID));
    echo '<a href="' . $url . '" class="button button-primary" style="background:#000; color:#fff; width:100%; display:flex; justify-content:center; align-items:center;gap:4px; padding:6px 0; font-size:14px;">' . webbuilder_icon_img() . '<span style="display:inline;">Edit with WebBuilder</span></a>';
}


/**
 * Register WebBuilder admin page (active version)
 */
add_action('admin_menu', function () {
    add_menu_page(
        __('WebBuilder', 'webbuilder'),
        __('WebBuilder', 'webbuilder'),
        'edit_pages',
        'webbuilder',
        'webbuilder_admin_page',
        plugin_dir_url(__FILE__) . 'assets/img/webbuilder.gif',
        3
    );
});

/**
 * WebBuilder main page
 */
function webbuilder_admin_page() {
    $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

    if ($post_id > 0) {
        webbuilder_render_editor($post_id);
    } else {
        webbuilder_render_welcome_screen();
    }
}

/**
 * Welcome / Instructions Screen
 */
function webbuilder_render_welcome_screen() {
    echo '
    <div class="wrap" style="display:flex; justify-content:center; align-items:center; height:80vh;">
        <div style="
            max-width:600px;
            width:100%;
            background:#fff;
            border:1px solid #ddd;
            border-radius:5px;
            padding:40px 50px;
            box-shadow:0 2px 10px rgba(0,0,0,0.05);
            text-align:center;
        ">
            <h1 style="font-size:26px; margin-bottom:15px; color:#111;">Welcome to WebBuilder</h1>
            <p style="font-size:15px; color:#555; line-height:1.7; margin-bottom:25px;">
                Design beautiful WordPress pages visually with WebBuilder’s drag-and-drop editor.
            </p>
            <hr style="border:none; border-top:1px solid #eee; margin:25px 0;">
            <h2 style="font-size:18px; margin-bottom:15px; color:#222;">Getting Started</h2>
            <ol style="font-size:14px; line-height:1.9; color:#333; text-align:left; display:inline-block; margin:0 auto 25px auto; padding-left:20px;">
                <li>Go to <strong>Pages → All Pages</strong>.</li>
                <li>Click <strong>Edit</strong> under any page.</li>
                <li>Click <strong>Edit with WebBuilder</strong> above the editor or in the sidebar.</li>
                <li>Start designing your layout visually.</li>
            </ol>
            <a href="' . admin_url('edit.php?post_type=page') . '" class="button button-primary" style="
                background:#000;
                color:#fff;
                padding:10px 24px;
                font-size:14px;
                border-radius:5px;
                text-decoration:none;
            ">Go to Pages</a>
        </div>
    </div>';
}

/**
 * WebBuilder Editor Screen
 */
function webbuilder_render_editor($post_id) {
    echo '<div class="wrap" style="margin:0; padding:0;">';
    echo '<div id="gjs" style="height:100vh;"></div>';

    // Pass post_id to JS for saving/loading
    echo '<script type="text/javascript">
        window.webbuilder_post_id = ' . intval($post_id) . ';
    </script>';

    echo '</div>';
}


/**
 * WebBuilder icon helper
 */
function webbuilder_icon_img() {
    return '<img src="' . esc_url( plugin_dir_url(__FILE__) . 'assets/img/webbuilder.gif' ) . '" alt="" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;">';
}
