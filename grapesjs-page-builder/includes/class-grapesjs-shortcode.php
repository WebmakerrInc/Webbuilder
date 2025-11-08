<?php
/**
 * Shortcode handler.
 *
 * @package GrapesJS\PageBuilder
 */

namespace GrapesJS\PageBuilder;

defined( 'ABSPATH' ) || exit;

class Shortcode {
    private $loader;

    public function __construct( Loader $loader ) {
        $this->loader = $loader;
    }

    public function register(): void {
        add_shortcode( 'grapesjs_builder', [ $this, 'render_shortcode' ] );
    }

    public function render_shortcode(): string {
        if ( ! is_admin() ) {
            $this->loader->enqueue_editor_assets();
        }

        ob_start();
        $this->loader->template( 'frontend-builder.php', [] );

        return (string) ob_get_clean();
    }
}
