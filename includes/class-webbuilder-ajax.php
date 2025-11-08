<?php
/**
 * AJAX handlers for Webbuilder.
 *
 * @package Webbuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Provides AJAX endpoints.
 */
class Webbuilder_Ajax {

    /**
     * Register hooks with loader.
     *
     * @param Webbuilder_Loader $loader Loader instance.
     */
    public function register( Webbuilder_Loader $loader ) {
        $loader->add_action( 'wp_ajax_webbuilder_load_template', $this, 'load_template' );
    }

    /**
     * Load the selected template file and return it as JSON.
     */
    public function load_template() {
        if ( ! current_user_can( 'edit_pages' ) ) {
            wp_send_json_error( [ 'message' => __( 'You are not allowed to perform this action.', 'webbuilder' ) ], 403 );
        }

        check_ajax_referer( 'webbuilder_load_template' );

        $template = isset( $_POST['template'] ) ? sanitize_key( wp_unslash( $_POST['template'] ) ) : '';
        $page     = isset( $_POST['page'] ) ? sanitize_key( wp_unslash( $_POST['page'] ) ) : '';

        $allowed_templates = [ 'coffee-shop', 'barber', 'school' ];
        $allowed_pages     = [ 'home', 'about', 'services', 'contact' ];

        if ( ! in_array( $template, $allowed_templates, true ) || ! in_array( $page, $allowed_pages, true ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid template selection.', 'webbuilder' ) ], 400 );
        }

        $base_dir = realpath( WEBBUILDER_PLUGIN_DIR . 'templates-library' );

        if ( ! $base_dir ) {
            wp_send_json_error( [ 'message' => __( 'Template directory is missing.', 'webbuilder' ) ], 500 );
        }

        $file_path = $base_dir . '/' . $template . '/' . $page . '.html';
        $real_path = realpath( $file_path );

        if ( ! $real_path || strpos( $real_path, $base_dir ) !== 0 || ! file_exists( $real_path ) ) {
            wp_send_json_error( [ 'message' => __( 'Template file not found.', 'webbuilder' ) ], 404 );
        }

        $contents = file_get_contents( $real_path );

        if ( false === $contents ) {
            wp_send_json_error( [ 'message' => __( 'Unable to read template file.', 'webbuilder' ) ], 500 );
        }

        wp_send_json_success(
            [
                'html' => $contents,
            ]
        );
    }
}
