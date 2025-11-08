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
        'title' => 'Edit with WebBuilder',
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
        $actions['edit_webbuilder'] = '<a href="' . esc_url($url) . '">Edit with WebBuilder</a>';
    }
    return $actions;
}, 10, 2);
