<?php
/**
 * GrapesJS loader.
 *
 * @package GrapesJS\PageBuilder
 */

namespace GrapesJS\PageBuilder;

defined( 'ABSPATH' ) || exit;

class Loader {
    public const VERSION = '1.0.0';
    public const GRAPESJS_VERSION = '0.22.13';

    /**
     * Absolute path to the main plugin file.
     *
     * @var string
     */
    private $plugin_file;

    /**
     * Plugin directory path.
     *
     * @var string
     */
    private $plugin_path;

    /**
     * Plugin directory URL.
     *
     * @var string
     */
    private $plugin_url;

    public function __construct( string $plugin_file ) {
        $this->plugin_file = $plugin_file;
        $this->plugin_path = plugin_dir_path( $plugin_file );
        $this->plugin_url  = plugin_dir_url( $plugin_file );

        require_once $this->plugin_path . 'includes/class-grapesjs-admin.php';
        require_once $this->plugin_path . 'includes/class-grapesjs-shortcode.php';
    }

    public function init(): void {
        add_action( 'init', [ $this, 'register_assets' ] );

        $admin = new Admin( $this );
        $admin->register();

        $shortcode = new Shortcode( $this );
        $shortcode->register();
    }

    public function register_assets(): void {
        wp_register_style(
            'grapesjs-core',
            $this->plugin_url( 'assets/js/grapesjs/grapes.min.css' ),
            [],
            self::GRAPESJS_VERSION
        );

        wp_register_script(
            'grapesjs-core',
            $this->plugin_url( 'assets/js/grapesjs/grapes.min.js' ),
            [],
            self::GRAPESJS_VERSION,
            true
        );

        wp_register_script(
            'grapesjs-page-builder-init',
            $this->plugin_url( 'assets/js/grapesjs-init.js' ),
            [ 'grapesjs-core' ],
            self::VERSION,
            true
        );

        wp_register_style(
            'grapesjs-page-builder-admin',
            $this->plugin_url( 'assets/css/admin.css' ),
            [ 'grapesjs-core' ],
            self::VERSION
        );
    }

    public function enqueue_editor_assets(): void {
        wp_enqueue_style( 'grapesjs-core' );
        wp_enqueue_script( 'grapesjs-core' );
        wp_enqueue_script( 'grapesjs-page-builder-init' );
    }

    public function enqueue_admin_assets(): void {
        $this->enqueue_editor_assets();
        wp_enqueue_style( 'grapesjs-page-builder-admin' );
    }

    public function plugin_path( string $path = '' ): string {
        return $this->plugin_path . ltrim( $path, '/' );
    }

    public function plugin_url( string $path = '' ): string {
        return $this->plugin_url . ltrim( $path, '/' );
    }

    public function template( string $name, array $context = [] ): void {
        $template = $this->plugin_path( 'templates/' . $name );

        if ( ! file_exists( $template ) ) {
            return;
        }

        if ( ! empty( $context ) ) {
            extract( $context );
        }

        include $template;
    }
}
