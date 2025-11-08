<?php
/**
 * Plugin Name: WebBuilder Pro
 * Description: A secure GrapesJS-based visual page builder with predefined Tailwind layouts for WordPress Multisite.
 * Version: 1.0.0
 * Author: WebBuilder Team
 * Text Domain: webbuilder-pro
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WebBuilder_Pro {
    const META_HTML = '_webbuilder_html';
    const META_CSS  = '_webbuilder_css';
    const REST_NAMESPACE = 'webbuilder/v1';

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'register_admin_page' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
        add_action( 'init', [ $this, 'register_meta' ] );
        add_filter( 'the_content', [ $this, 'prepend_builder_output' ] );
        add_action( 'admin_bar_menu', [ $this, 'register_admin_bar_link' ], 100 );
        add_filter( 'post_row_actions', [ $this, 'add_row_action' ], 10, 2 );
    }

    public function register_meta() {
        register_post_meta( 'page', self::META_HTML, [
            'type'              => 'string',
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => [ $this, 'sanitize_html' ],
            'auth_callback'     => function( $allowed, $meta_key, $post_id, $user_id, $cap, $caps ) {
                return user_can( $user_id, 'edit_post', $post_id );
            },
        ] );

        register_post_meta( 'page', self::META_CSS, [
            'type'              => 'string',
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => [ $this, 'sanitize_css' ],
            'auth_callback'     => function( $allowed, $meta_key, $post_id, $user_id, $cap, $caps ) {
                return user_can( $user_id, 'edit_post', $post_id );
            },
        ] );
    }

    public function register_admin_page() {
        add_menu_page(
            __( 'WebBuilder', 'webbuilder-pro' ),
            __( 'WebBuilder', 'webbuilder-pro' ),
            'edit_pages',
            'webbuilder-pro',
            [ $this, 'render_builder_page' ],
            'dashicons-layout',
            58
        );
    }

    public function enqueue_assets( $hook ) {
        if ( 'toplevel_page_webbuilder-pro' !== $hook ) {
            return;
        }

        wp_enqueue_style( 'grapesjs', 'https://unpkg.com/grapesjs@0.21.7/dist/css/grapes.min.css', [], '0.21.7' );
        wp_enqueue_script( 'grapesjs', 'https://unpkg.com/grapesjs@0.21.7/dist/grapes.min.js', [], '0.21.7', true );
        wp_enqueue_script(
            'grapesjs-blocks-basic',
            'https://unpkg.com/grapesjs-blocks-basic@0.1.10/dist/grapesjs-blocks-basic.min.js',
            [ 'grapesjs' ],
            null,
            true
        );
        wp_enqueue_style( 'tailwind', 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css', [], '2.2.19' );
        wp_enqueue_style( 'font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', [], '6.5.1' );

        wp_enqueue_style( 'webbuilder-pro-admin', plugins_url( 'assets/css/admin.css', __FILE__ ), [], '1.0.0' );

        wp_enqueue_script(
            'webbuilder-pro-init',
            plugins_url( 'assets/js/builder-init.js', __FILE__ ),
            [ 'grapesjs', 'grapesjs-blocks-basic' ],
            '1.0.0',
            true
        );

        $post_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0;
        $post    = $post_id ? get_post( $post_id ) : null;

        if ( ! $post || 'page' !== $post->post_type || ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        $data = [
            'restUrl'     => esc_url_raw( rest_url( self::REST_NAMESPACE . '/' ) ),
            'nonce'       => wp_create_nonce( 'wp_rest' ),
            'postId'      => $post_id,
            'layouts'     => $this->get_available_layouts(),
            'initialHtml' => get_post_meta( $post_id, self::META_HTML, true ),
            'initialCss'  => get_post_meta( $post_id, self::META_CSS, true ),
        ];

        wp_localize_script( 'webbuilder-pro-init', 'WebBuilderProData', $data );
    }

    public function render_builder_page() {
        $post_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0;

        if ( ! $post_id ) {
            echo '<div class="wrap"><h1>' . esc_html__( 'WebBuilder', 'webbuilder-pro' ) . '</h1>';
            echo '<p>' . esc_html__( 'Please access this builder from a specific page.', 'webbuilder-pro' ) . '</p></div>';
            return;
        }

        $post = get_post( $post_id );

        if ( ! $post || 'page' !== $post->post_type || ! current_user_can( 'edit_post', $post_id ) ) {
            wp_die( esc_html__( 'You do not have permission to access this builder.', 'webbuilder-pro' ) );
        }

        echo '<div class="wrap" id="webbuilder-root" data-post-id="' . esc_attr( $post_id ) . '">';
        echo '<h1 class="wp-heading-inline">' . esc_html( get_the_title( $post ) ) . '</h1>';
        echo '<div class="webbuilder-toolbar">';
        echo '<button class="button button-primary" id="webbuilder-save">' . esc_html__( 'Save', 'webbuilder-pro' ) . '</button>';
        echo '<button class="button" id="webbuilder-load-layout">' . esc_html__( 'Load Layout', 'webbuilder-pro' ) . '</button>';
        echo '<div class="webbuilder-devices">';
        echo '<button class="button" data-device="desktop">' . esc_html__( 'Desktop', 'webbuilder-pro' ) . '</button>';
        echo '<button class="button" data-device="tablet">' . esc_html__( 'Tablet', 'webbuilder-pro' ) . '</button>';
        echo '<button class="button" data-device="mobile">' . esc_html__( 'Mobile', 'webbuilder-pro' ) . '</button>';
        echo '</div>';
        echo '</div>';
        echo '<div id="gjs" class="webbuilder-canvas"></div>';
        echo '</div>';
    }

    public function register_rest_routes() {
        register_rest_route(
            self::REST_NAMESPACE,
            '/save',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'rest_save_builder' ],
                'permission_callback' => function( $request ) {
                    $post_id = absint( $request->get_param( 'id' ) );
                    return $post_id && current_user_can( 'edit_post', $post_id );
                },
                'args'                => [
                    'id'   => [
                        'type'     => 'integer',
                        'required' => true,
                    ],
                    'html' => [
                        'type'     => 'string',
                        'required' => true,
                    ],
                    'css'  => [
                        'type'     => 'string',
                        'required' => false,
                    ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/layout/(?P<name>[a-z0-9\-]+)',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'rest_get_layout' ],
                'permission_callback' => function() {
                    return current_user_can( 'edit_pages' );
                },
            ]
        );
    }

    public function rest_save_builder( WP_REST_Request $request ) {
        $post_id = absint( $request->get_param( 'id' ) );
        $html    = $this->sanitize_html( $request->get_param( 'html' ) );
        $css     = $this->sanitize_css( $request->get_param( 'css' ) );

        if ( ! $post_id || ! current_user_can( 'edit_post', $post_id ) ) {
            return new WP_Error( 'webbuilder_forbidden', __( 'You are not allowed to save this page.', 'webbuilder-pro' ), [ 'status' => 403 ] );
        }

        update_post_meta( $post_id, self::META_HTML, $html );
        update_post_meta( $post_id, self::META_CSS, $css );

        return rest_ensure_response( [ 'success' => true ] );
    }

    public function rest_get_layout( WP_REST_Request $request ) {
        $name    = sanitize_key( $request->get_param( 'name' ) );
        $layouts = $this->get_available_layouts();

        if ( ! in_array( $name, $layouts, true ) ) {
            return new WP_Error( 'webbuilder_layout_not_found', __( 'Layout not found.', 'webbuilder-pro' ), [ 'status' => 404 ] );
        }

        $path = plugin_dir_path( __FILE__ ) . 'layouts/' . $name . '.html';

        if ( ! file_exists( $path ) ) {
            return new WP_Error( 'webbuilder_layout_missing', __( 'Layout file is missing.', 'webbuilder-pro' ), [ 'status' => 404 ] );
        }

        $content = file_get_contents( $path );

        if ( false === $content ) {
            return new WP_Error( 'webbuilder_layout_unreadable', __( 'Unable to read layout file.', 'webbuilder-pro' ), [ 'status' => 500 ] );
        }

        return rest_ensure_response( [ 'html' => wp_kses_post( $content ) ] );
    }

    private function get_available_layouts() {
        $files = glob( plugin_dir_path( __FILE__ ) . 'layouts/*.html' );
        $names = [];

        if ( ! empty( $files ) ) {
            foreach ( $files as $file ) {
                $names[] = sanitize_key( basename( $file, '.html' ) );
            }
        }

        return $names;
    }

    public function sanitize_html( $html ) {
        $html = (string) $html;
        $html = wp_kses_post( $html );
        $html = preg_replace( '#<script(.*?)>(.*?)</script>#is', '', $html );
        return $html;
    }

    public function sanitize_css( $css ) {
        $css = (string) $css;
        $css = wp_strip_all_tags( $css );
        return $css;
    }

    public function prepend_builder_output( $content ) {
        if ( ! is_singular( 'page' ) ) {
            return $content;
        }

        $post_id = get_the_ID();
        $html    = get_post_meta( $post_id, self::META_HTML, true );
        $css     = get_post_meta( $post_id, self::META_CSS, true );

        if ( empty( $html ) ) {
            return $content;
        }

        $style_tag = '';

        if ( ! empty( $css ) ) {
            $style_tag = '<style id="webbuilder-pro-styles">' . $this->sanitize_css( $css ) . '</style>';
        }

        $clean_html = $this->sanitize_html( $html );

        return $style_tag . $clean_html . $content;
    }

    public function register_admin_bar_link( $wp_admin_bar ) {
        $post_id = 0;

        if ( is_admin() ) {
            $post_id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0;
        } elseif ( is_singular( 'page' ) ) {
            $post_id = get_the_ID();
        }

        if ( ! $post_id ) {
            return;
        }

        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        $url = add_query_arg(
            [
                'page'    => 'webbuilder-pro',
                'post_id' => $post_id,
            ],
            admin_url( 'admin.php' )
        );

        $wp_admin_bar->add_node(
            [
                'id'    => 'edit-with-webbuilder',
                'title' => __( 'Edit with WebBuilder', 'webbuilder-pro' ),
                'href'  => $url,
            ]
        );
    }

    public function add_row_action( $actions, $post ) {
        if ( 'page' !== $post->post_type ) {
            return $actions;
        }

        if ( ! current_user_can( 'edit_post', $post->ID ) ) {
            return $actions;
        }

        $url = add_query_arg(
            [
                'page'    => 'webbuilder-pro',
                'post_id' => $post->ID,
            ],
            admin_url( 'admin.php' )
        );

        $actions['webbuilder'] = '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Edit with WebBuilder', 'webbuilder-pro' ) . '</a>';

        return $actions;
    }
}

new WebBuilder_Pro();
