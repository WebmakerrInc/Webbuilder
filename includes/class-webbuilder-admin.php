<?php
/**
 * Admin functionality for Webbuilder.
 *
 * @package Webbuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Handles admin menus and assets.
 */
class Webbuilder_Admin {

    /**
     * Plugin slug.
     *
     * @var string
     */
    protected $plugin_name = 'webbuilder';

    /**
     * Plugin version.
     *
     * @var string
     */
    protected $version;

    /**
     * Constructor.
     *
     * @param string $version Plugin version.
     */
    public function __construct( $version ) {
        $this->version = $version;
    }

    /**
     * Register hooks with loader.
     *
     * @param Webbuilder_Loader $loader Loader instance.
     */
    public function register( Webbuilder_Loader $loader ) {
        $loader->add_action( 'admin_menu', $this, 'register_menu' );
        $loader->add_action( 'admin_enqueue_scripts', $this, 'enqueue_assets' );
    }

    /**
     * Register Webbuilder admin page.
     */
    public function register_menu() {
        add_menu_page(
            __( 'Webbuilder', 'webbuilder' ),
            __( 'Webbuilder', 'webbuilder' ),
            'edit_pages',
            $this->plugin_name,
            [ $this, 'render_admin_page' ],
            WEBBUILDER_PLUGIN_URL . 'assets/img/webbuilder.gif',
            3
        );
    }

    /**
     * Enqueue scripts and styles for the builder page.
     *
     * @param string $hook Current admin page hook.
     */
    public function enqueue_assets( $hook ) {
        if ( 'toplevel_page_' . $this->plugin_name !== $hook ) {
            return;
        }

        $assets_url = WEBBUILDER_PLUGIN_URL;
        $post_id    = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        if ( $post_id && ! get_post( $post_id ) ) {
            $post_id = 0;
        }

        wp_enqueue_style(
            'webbuilder-grapesjs',
            $assets_url . 'assets/vendor/grapesjs/grapes.min.css',
            [],
            '0.22.4'
        );

        wp_enqueue_style(
            'webbuilder-admin',
            $assets_url . 'assets/css/admin.css',
            [ 'webbuilder-grapesjs' ],
            $this->version
        );

        wp_enqueue_script(
            'webbuilder-grapesjs',
            $assets_url . 'assets/vendor/grapesjs/grapes.min.js',
            [],
            '0.22.4',
            true
        );

        wp_enqueue_script(
            'webbuilder-init',
            $assets_url . 'assets/js/webbuilder-init.js',
            [ 'webbuilder-grapesjs', 'jquery' ],
            $this->version,
            true
        );

        $selector_data = webbuilder_get_template_selector_data();

        wp_localize_script(
            'webbuilder-init',
            'webbuilderData',
            [
                'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
                'nonce'    => wp_create_nonce( 'webbuilder_load_template' ),
                'restUrl'  => trailingslashit( rest_url( 'webbuilder/v1' ) ),
                'restNonce'=> wp_create_nonce( 'wp_rest' ),
                'postId'   => $post_id,
                'templates'=> $selector_data['templates'],
                'pages'    => $selector_data['pages'],
                'messages' => [
                    'loadSuccess'      => __( 'Template loaded successfully.', 'webbuilder' ),
                    'loadError'        => __( 'Unable to load the selected template.', 'webbuilder' ),
                    'saveSuccess'      => __( 'Page saved successfully.', 'webbuilder' ),
                    'saveError'        => __( 'Unable to save the page.', 'webbuilder' ),
                    'loadExistingError'=> __( 'Unable to load existing content for this page.', 'webbuilder' ),
                ],
            ]
        );
    }

    /**
     * Render the admin page template.
     */
    public function render_admin_page() {
        $template = WEBBUILDER_PLUGIN_DIR . 'templates/admin-builder.php';

        if ( file_exists( $template ) ) {
            include $template;
        }
    }
}
