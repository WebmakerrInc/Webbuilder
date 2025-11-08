<?php
/**
 * Admin page handler.
 *
 * @package GrapesJS\PageBuilder
 */

namespace GrapesJS\PageBuilder;

defined( 'ABSPATH' ) || exit;

class Admin {
    private $loader;

    private $page_hook = '';

    public function __construct( Loader $loader ) {
        $this->loader = $loader;
    }

    public function register(): void {
        add_action( 'admin_menu', [ $this, 'register_menu' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
        add_filter( 'page_row_actions', [ $this, 'add_page_row_action' ], 10, 2 );
    }

    public function register_menu(): void {
        $this->page_hook = add_submenu_page(
            'tools.php',
            __( 'GrapesJS Builder', 'grapesjs-page-builder' ),
            __( 'GrapesJS Builder', 'grapesjs-page-builder' ),
            'edit_pages',
            'grapesjs-builder',
            [ $this, 'render_page' ]
        );
    }

    public function enqueue_assets( string $hook ): void {
        if ( $hook !== $this->page_hook ) {
            return;
        }

        $this->loader->enqueue_admin_assets();

        $post_id = isset( $_GET['post_id'] ) ? absint( wp_unslash( $_GET['post_id'] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        wp_localize_script(
            'grapesjs-page-builder-init',
            'grapesjsPageBuilder',
            [
                'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                'nonce'   => wp_create_nonce( 'grapesjs_save_content' ),
                'postId'  => $post_id,
                'strings' => [
                    'saveSuccess' => __( 'Saved successfully.', 'grapesjs-page-builder' ),
                    'saveError'   => __( 'An error occurred while saving. Please try again.', 'grapesjs-page-builder' ),
                ],
            ]
        );
    }

    public function render_page(): void {
        if ( ! current_user_can( 'edit_pages' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'grapesjs-page-builder' ) );
        }

        $post_id      = isset( $_GET['post_id'] ) ? absint( wp_unslash( $_GET['post_id'] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $post_content = '';
        $post_title   = '';

        if ( $post_id > 0 ) {
            if ( ! current_user_can( 'edit_post', $post_id ) ) {
                wp_die( esc_html__( 'You are not allowed to edit this page.', 'grapesjs-page-builder' ) );
            }

            $post = get_post( $post_id );

            if ( $post instanceof \WP_Post ) {
                $post_content = get_post_field( 'post_content', $post_id );
                $post_title   = get_the_title( $post_id );
            } else {
                wp_die( esc_html__( 'The requested page could not be found.', 'grapesjs-page-builder' ) );
            }
        }

        $this->loader->template( 'admin-builder.php', [
            'title' => __( 'GrapesJS Builder', 'grapesjs-page-builder' ),
            'post_id' => $post_id,
            'post_content' => $post_content,
            'post_title' => $post_title,
        ] );
    }

    /**
     * Add "Edit with GrapesJS" action link to page rows.
     *
     * @param array    $actions Existing row actions.
     * @param \WP_Post $post    Current post object.
     *
     * @return array
     */
    public function add_page_row_action( array $actions, $post ): array {
        if ( ! $post instanceof \WP_Post ) {
            return $actions;
        }

        if ( 'page' !== $post->post_type ) {
            return $actions;
        }

        if ( ! current_user_can( 'edit_post', $post->ID ) ) {
            return $actions;
        }

        $url = add_query_arg(
            [
                'page'    => 'grapesjs-builder',
                'post_id' => $post->ID,
            ],
            admin_url( 'tools.php' )
        );

        $actions['grapesjs'] = sprintf(
            '<a href="%1$s">%2$s</a>',
            esc_url( $url ),
            esc_html__( 'Edit with GrapesJS', 'grapesjs-page-builder' )
        );

        return $actions;
    }
}
