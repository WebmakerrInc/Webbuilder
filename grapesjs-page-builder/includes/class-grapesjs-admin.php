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
    }

    public function register_menu(): void {
        $this->page_hook = add_submenu_page(
            'tools.php',
            __( 'GrapesJS Builder', 'grapesjs-page-builder' ),
            __( 'GrapesJS Builder', 'grapesjs-page-builder' ),
            'manage_options',
            'grapesjs-page-builder',
            [ $this, 'render_page' ]
        );
    }

    public function enqueue_assets( string $hook ): void {
        if ( $hook !== $this->page_hook ) {
            return;
        }

        $this->loader->enqueue_admin_assets();
    }

    public function render_page(): void {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'grapesjs-page-builder' ) );
        }

        $this->loader->template( 'admin-builder.php', [
            'title' => __( 'GrapesJS Builder', 'grapesjs-page-builder' ),
        ] );
    }
}
