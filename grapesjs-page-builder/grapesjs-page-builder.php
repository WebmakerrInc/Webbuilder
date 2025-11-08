<?php
/**
 * Plugin Name:       GrapesJS Page Builder
 * Plugin URI:        https://example.com/plugins/grapesjs-page-builder
 * Description:       Integrates the GrapesJS visual editor directly inside WordPress for rapid page building.
 * Version:           1.0.0
 * Author:            Webbuilder Team
 * Author URI:        https://example.com
 * License:           BSD-3-Clause
 * License URI:       https://opensource.org/licenses/BSD-3-Clause
 * Text Domain:       grapesjs-page-builder
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

require_once plugin_dir_path( __FILE__ ) . 'includes/class-grapesjs-loader.php';

function grapesjs_page_builder() {
    static $plugin = null;

    if ( null === $plugin ) {
        $plugin = new \GrapesJS\PageBuilder\Loader( __FILE__ );
        $plugin->init();
    }

    return $plugin;
}

grapesjs_page_builder();

/**
 * Handle saving GrapesJS content via AJAX.
 */
function grapesjs_page_builder_save_content(): void {
    $nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';

    if ( ! $nonce || ! wp_verify_nonce( $nonce, 'grapesjs_save_content' ) ) {
        wp_send_json_error( [ 'message' => __( 'Invalid security token.', 'grapesjs-page-builder' ) ], 403 );
    }

    $post_id = isset( $_POST['post_id'] ) ? absint( wp_unslash( $_POST['post_id'] ) ) : 0;

    if ( $post_id <= 0 ) {
        wp_send_json_error( [ 'message' => __( 'Invalid page selected.', 'grapesjs-page-builder' ) ], 400 );
    }

    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        wp_send_json_error( [ 'message' => __( 'You are not allowed to edit this page.', 'grapesjs-page-builder' ) ], 403 );
    }

    $content = isset( $_POST['content'] ) ? wp_kses_post( wp_unslash( $_POST['content'] ) ) : '';

    $result = wp_update_post(
        [
            'ID'           => $post_id,
            'post_content' => $content,
        ],
        true
    );

    if ( is_wp_error( $result ) ) {
        wp_send_json_error( [ 'message' => $result->get_error_message() ], 500 );
    }

    wp_send_json_success( [ 'message' => __( 'Content saved.', 'grapesjs-page-builder' ) ] );
}

add_action( 'wp_ajax_grapesjs_save_content', 'grapesjs_page_builder_save_content' );

/**
 * Provide predefined layouts for the editor via the REST API.
 */
function grapesjs_page_builder_get_layouts(): array {
    return [
        'home'     => [
            'html' => '<section class="py-16 bg-white text-center"><div class="max-w-4xl mx-auto"><h1 class="text-4xl font-bold mb-4">Welcome to Your New Page</h1><p class="text-lg text-gray-600 mb-8">Kick-start your next project with this hero section including a call to action.</p><a class="inline-block px-6 py-3 bg-blue-600 text-white rounded" href="#">Get Started</a></div></section>',
            'css'  => '',
        ],
        'about'    => [
            'html' => '<section class="py-16 bg-gray-50"><div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center"><div><h2 class="text-3xl font-semibold mb-4">About Our Team</h2><p class="text-gray-600 leading-relaxed">Share your story, values, and what makes your team unique. This layout is perfect for introducing visitors to your brand.</p></div><div class="bg-white shadow rounded p-6"><h3 class="text-xl font-semibold mb-3">Quick Facts</h3><ul class="space-y-2 text-gray-600"><li>✔️ Founded in 2021</li><li>✔️ Remote-first team</li><li>✔️ Focused on user experience</li></ul></div></div></section>',
            'css'  => '',
        ],
        'services' => [
            'html' => '<section class="py-16 bg-white"><div class="max-w-6xl mx-auto text-center"><h2 class="text-3xl font-semibold mb-6">What We Offer</h2><div class="grid md:grid-cols-3 gap-6"><div class="border rounded-lg p-6 shadow-sm"><h3 class="text-xl font-semibold mb-2">Design</h3><p class="text-gray-600">Beautiful, responsive layouts tailored to your brand.</p></div><div class="border rounded-lg p-6 shadow-sm"><h3 class="text-xl font-semibold mb-2">Development</h3><p class="text-gray-600">Robust, scalable code built on modern standards.</p></div><div class="border rounded-lg p-6 shadow-sm"><h3 class="text-xl font-semibold mb-2">Support</h3><p class="text-gray-600">Ongoing partnership to help you grow and iterate.</p></div></div></div></section>',
            'css'  => '',
        ],
    ];
}

/**
 * Handle REST request for retrieving a specific layout.
 */
function grapesjs_page_builder_rest_get_layout( WP_REST_Request $request ) {
    $layouts = grapesjs_page_builder_get_layouts();
    $slug    = $request->get_param( 'slug' );

    if ( ! is_string( $slug ) ) {
        return new WP_Error( 'invalid_layout', __( 'Invalid layout requested.', 'grapesjs-page-builder' ), [ 'status' => 400 ] );
    }

    if ( ! isset( $layouts[ $slug ] ) ) {
        return new WP_Error( 'layout_not_found', __( 'The requested layout could not be found.', 'grapesjs-page-builder' ), [ 'status' => 404 ] );
    }

    return $layouts[ $slug ];
}

add_action(
    'rest_api_init',
    static function () {
        register_rest_route(
            'webbuilder/v1',
            '/layout/(?P<slug>[a-z0-9_-]+)',
            [
                'methods'             => 'GET',
                'callback'            => 'grapesjs_page_builder_rest_get_layout',
                'permission_callback' => static function () {
                    return current_user_can( 'edit_pages' );
                },
            ]
        );
    }
);
