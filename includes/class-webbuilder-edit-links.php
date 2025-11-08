<?php
/**
 * Edit link integrations for Webbuilder.
 *
 * @package Webbuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Registers entry points that link into the builder UI.
 */
class Webbuilder_Edit_Links {

    /**
     * Register the hooks used for integrating edit links.
     */
    public function register() {
        add_filter( 'page_row_actions', [ $this, 'add_page_row_action' ], 10, 2 );
        add_action( 'edit_form_after_title', [ $this, 'render_edit_screen_button' ] );
        add_action( 'wp_footer', [ $this, 'render_frontend_button' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_frontend_styles' ] );
    }

    /**
     * Add "Edit with Webmakerr" link to the page row actions.
     *
     * @param array   $actions Existing actions.
     * @param WP_Post $post    Current post object.
     *
     * @return array
     */
    public function add_page_row_action( $actions, $post ) {
        if ( empty( $post ) || 'page' !== $post->post_type ) {
            return $actions;
        }

        $actions['edit_with_webmakerr'] = sprintf(
            '<a href="%1$s"><span class="dashicons dashicons-admin-customizer" aria-hidden="true" style="margin-right:5px;"></span>%2$s</a>',
            esc_url( $this->get_builder_url( $post->ID ) ),
            esc_html__( 'Edit with Webmakerr', 'webbuilder' )
        );

        return $actions;
    }

    /**
     * Output an "Edit with Webmakerr" button on the classic edit screen.
     *
     * @param WP_Post $post Post object.
     */
    public function render_edit_screen_button( $post ) {
        if ( empty( $post ) || 'page' !== $post->post_type ) {
            return;
        }

        printf(
            '<div style="margin:15px 0;"><a href="%1$s" class="button button-primary" style="background:#01C468;border:none;"><span class="dashicons dashicons-admin-customizer" aria-hidden="true" style="vertical-align:middle;margin-right:5px;"></span>%2$s</a></div>',
            esc_url( $this->get_builder_url( $post->ID ) ),
            esc_html__( 'Edit with Webmakerr', 'webbuilder' )
        );
    }

    /**
     * Render the floating frontend button for users who can edit the page.
     */
    public function render_frontend_button() {
        if ( ! is_singular( 'page' ) ) {
            return;
        }

        $post_id = get_queried_object_id();

        if ( ! $post_id || ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        printf(
            '<a href="%1$s" class="webmakerr-edit-btn"><span class="dashicons dashicons-admin-customizer" aria-hidden="true"></span><span class="webmakerr-edit-label">%2$s</span></a>',
            esc_url( $this->get_builder_url( $post_id ) ),
            esc_html__( 'Edit with Webmakerr', 'webbuilder' )
        );
    }

    /**
     * Enqueue styles for the frontend edit button when needed.
     */
    public function enqueue_frontend_styles() {
        if ( ! is_singular( 'page' ) ) {
            return;
        }

        $post_id = get_queried_object_id();

        if ( ! $post_id || ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        wp_enqueue_style( 'dashicons' );

        wp_enqueue_style(
            'webbuilder-edit-links',
            WEBBUILDER_PLUGIN_URL . 'assets/css/admin.css',
            [ 'dashicons' ],
            WEBBUILDER_VERSION
        );
    }

    /**
     * Build the admin builder URL for a post.
     *
     * @param int $post_id Post ID.
     *
     * @return string
     */
    protected function get_builder_url( $post_id ) {
        return admin_url( 'admin.php?page=webbuilder&post_id=' . absint( $post_id ) );
    }

}
