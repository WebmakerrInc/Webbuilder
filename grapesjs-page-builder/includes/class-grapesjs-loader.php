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
        \register_post_meta(
            'page',
            '_webbuilder_html',
            [
                'type'              => 'string',
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => '\\wp_kses_post',
                'auth_callback'     => static function ( $allowed, $meta_key, $post_id ) {
                    return \current_user_can( 'edit_post', $post_id );
                },
            ]
        );

        \register_post_meta(
            'page',
            '_webbuilder_css',
            [
                'type'              => 'string',
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => '\\sanitize_textarea_field',
                'auth_callback'     => static function ( $allowed, $meta_key, $post_id ) {
                    return \current_user_can( 'edit_post', $post_id );
                },
            ]
        );

        wp_register_style(
            'grapesjs-icons',
            $this->plugin_url( 'assets/js/grapesjs/css/grapes.min.css' ),
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

        $plugin_dependencies = [ 'grapesjs-core' ];

        wp_register_script(
            'grapesjs-blocks-basic',
            $this->plugin_url( 'assets/js/grapesjs/plugins/grapesjs-blocks-basic.min.js' ),
            $plugin_dependencies,
            self::GRAPESJS_VERSION,
            true
        );

        wp_register_script(
            'grapesjs-plugin-forms',
            $this->plugin_url( 'assets/js/grapesjs/plugins/grapesjs-plugin-forms.min.js' ),
            $plugin_dependencies,
            self::GRAPESJS_VERSION,
            true
        );

        wp_register_script(
            'grapesjs-navbar',
            $this->plugin_url( 'assets/js/grapesjs/plugins/grapesjs-navbar.min.js' ),
            $plugin_dependencies,
            self::GRAPESJS_VERSION,
            true
        );

        wp_register_script(
            'grapesjs-component-countdown',
            $this->plugin_url( 'assets/js/grapesjs/plugins/grapesjs-component-countdown.min.js' ),
            $plugin_dependencies,
            self::GRAPESJS_VERSION,
            true
        );

        wp_register_script(
            'grapesjs-style-flexbox',
            $this->plugin_url( 'assets/js/grapesjs/plugins/grapesjs-style-flexbox.min.js' ),
            [ 'grapesjs-core' ],
            '1.0.1',
            true
        );

        wp_register_script(
            'grapesjs-page-builder-init',
            $this->plugin_url( 'assets/js/grapesjs-init.js' ),
            [
                'grapesjs-core',
                'grapesjs-blocks-basic',
                'grapesjs-plugin-forms',
                'grapesjs-navbar',
                'grapesjs-component-countdown',
                'grapesjs-style-flexbox',
            ],
            self::VERSION,
            true
        );

        wp_register_style(
            'grapesjs-page-builder-admin',
            $this->plugin_url( 'assets/css/admin.css' ),
            [ 'grapesjs-icons' ],
            self::VERSION
        );
    }

    public function enqueue_editor_assets(): void {
        wp_enqueue_style( 'grapesjs-icons', plugin_dir_url( __FILE__ ) . '../assets/js/grapesjs/css/grapes.min.css' );
        wp_enqueue_script( 'grapesjs-core' );
        wp_enqueue_script( 'grapesjs-blocks-basic' );
        wp_enqueue_script( 'grapesjs-plugin-forms' );
        wp_enqueue_script( 'grapesjs-navbar' );
        wp_enqueue_script( 'grapesjs-component-countdown' );
        wp_enqueue_script( 'grapesjs-style-flexbox' );
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
