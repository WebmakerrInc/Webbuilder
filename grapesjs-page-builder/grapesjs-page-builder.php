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
 * Sanitize CSS submitted from the GrapesJS editor.
 *
 * @param string $css Raw CSS string.
 *
 * @return string
 */
function grapesjs_page_builder_sanitize_css( string $css ): string {
    $css = wp_unslash( $css );
    $css = wp_kses( $css, [] );

    return trim( $css );
}

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
    $css     = isset( $_POST['css'] ) ? grapesjs_page_builder_sanitize_css( $_POST['css'] ) : '';

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

    if ( '' !== $css ) {
        update_post_meta( $post_id, '_grapesjs_css', $css );
    } else {
        delete_post_meta( $post_id, '_grapesjs_css' );
    }

    wp_send_json_success( [ 'message' => __( 'Content saved.', 'grapesjs-page-builder' ) ] );
}

add_action( 'wp_ajax_grapesjs_save_content', 'grapesjs_page_builder_save_content' );

/**
 * Print saved GrapesJS CSS on the front end.
 */
function grapesjs_page_builder_print_saved_css(): void {
    if ( is_admin() ) {
        return;
    }

    if ( ! is_singular() ) {
        return;
    }

    $post_id = get_queried_object_id();

    if ( ! $post_id ) {
        return;
    }

    $css = get_post_meta( $post_id, '_grapesjs_css', true );

    if ( '' === $css ) {
        return;
    }

    echo '<style id="grapesjs-page-builder-styles">' . esc_html( (string) $css ) . '</style>';
}

add_action( 'wp_head', 'grapesjs_page_builder_print_saved_css' );
