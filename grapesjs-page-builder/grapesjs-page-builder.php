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
    $css     = isset( $_POST['css'] ) ? sanitize_textarea_field( wp_unslash( $_POST['css'] ) ) : '';

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

    update_post_meta( $post_id, '_webbuilder_html', $content );
    update_post_meta( $post_id, '_webbuilder_css', $css );

    wp_send_json_success( [ 'message' => __( 'Content saved.', 'grapesjs-page-builder' ) ] );
}

add_action( 'wp_ajax_grapesjs_save_content', 'grapesjs_page_builder_save_content' );
