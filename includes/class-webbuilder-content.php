<?php
/**
 * Frontend and persistence features for Webbuilder.
 *
 * @package Webbuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Handles REST routes, meta registration, and rendering.
 */
class Webbuilder_Content {

    /**
     * Cache of CSS loaded for posts.
     *
     * @var array<int, string>
     */
    protected $styles_cache = [];

    /**
     * Register hooks with loader.
     *
     * @param Webbuilder_Loader $loader Loader instance.
     */
    public function register( Webbuilder_Loader $loader ) {
        $loader->add_action( 'init', $this, 'register_meta' );
        $loader->add_action( 'rest_api_init', $this, 'register_routes' );
        $loader->add_action( 'wp_head', $this, 'output_builder_styles', 90 );
        $loader->add_action( 'admin_bar_menu', $this, 'add_admin_bar_link', 90 );
        $loader->add_filter( 'the_content', $this, 'render_builder_content' );
    }

    /**
     * Register post meta for Webbuilder content.
     */
    public function register_meta() {
        $args = [
            'show_in_rest'  => false,
            'single'        => true,
            'type'          => 'string',
            'auth_callback' => function() {
                return current_user_can( 'edit_posts' );
            },
        ];

        register_post_meta( 'page', 'webbuilder_html', $args );
        register_post_meta( 'page', 'webbuilder_css', $args );
    }

    /**
     * Register REST API routes for loading and saving builder data.
     */
    public function register_routes() {
        register_rest_route(
            'webbuilder/v1',
            '/pages/(?P<id>\d+)',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_page_content' ],
                    'permission_callback' => [ $this, 'can_edit_page' ],
                    'args'                => [
                        'id' => [
                            'validate_callback' => 'is_numeric',
                        ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'save_page_content' ],
                    'permission_callback' => [ $this, 'can_edit_page' ],
                    'args'                => [
                        'html' => [
                            'required' => true,
                            'type'     => 'string',
                        ],
                        'css'  => [
                            'required' => true,
                            'type'     => 'string',
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * Permission callback to ensure the user can edit the requested page.
     *
     * @param WP_REST_Request $request Request instance.
     * @return bool
     */
    public function can_edit_page( WP_REST_Request $request ) {
        $post_id = isset( $request['id'] ) ? absint( $request['id'] ) : 0;

        if ( ! $post_id ) {
            return false;
        }

        return current_user_can( 'edit_post', $post_id );
    }

    /**
     * Fetch persisted builder content for a page.
     *
     * @param WP_REST_Request $request Request instance.
     * @return WP_REST_Response|WP_Error
     */
    public function get_page_content( WP_REST_Request $request ) {
        $post_id = absint( $request['id'] );
        $post    = get_post( $post_id );

        if ( ! $post ) {
            return new WP_Error( 'webbuilder_not_found', __( 'Requested page not found.', 'webbuilder' ), [ 'status' => 404 ] );
        }

        $html = (string) get_post_meta( $post_id, 'webbuilder_html', true );
        $css  = (string) get_post_meta( $post_id, 'webbuilder_css', true );

        return rest_ensure_response(
            [
                'html' => $html,
                'css'  => $css,
            ]
        );
    }

    /**
     * Persist builder content for a page.
     *
     * @param WP_REST_Request $request Request instance.
     * @return WP_REST_Response|WP_Error
     */
    public function save_page_content( WP_REST_Request $request ) {
        $post_id = absint( $request['id'] );
        $post    = get_post( $post_id );

        if ( ! $post ) {
            return new WP_Error( 'webbuilder_not_found', __( 'Requested page not found.', 'webbuilder' ), [ 'status' => 404 ] );
        }

        $html = wp_kses_post( wp_unslash( $request->get_param( 'html' ) ) );
        $css  = sanitize_textarea_field( wp_unslash( $request->get_param( 'css' ) ) );

        update_post_meta( $post_id, 'webbuilder_html', $html );
        update_post_meta( $post_id, 'webbuilder_css', $css );

        return rest_ensure_response(
            [
                'success' => true,
            ]
        );
    }

    /**
     * Replace the_content output with builder HTML when available.
     *
     * @param string $content Original post content.
     * @return string
     */
    public function render_builder_content( $content ) {
        if ( ! in_the_loop() || ! is_main_query() ) {
            return $content;
        }

        $post = get_post();

        if ( ! $post ) {
            return $content;
        }

        $html = (string) get_post_meta( $post->ID, 'webbuilder_html', true );

        if ( '' === $html ) {
            return $content;
        }

        $css = (string) get_post_meta( $post->ID, 'webbuilder_css', true );

        if ( '' !== $css ) {
            $this->styles_cache[ $post->ID ] = $css;
        }

        /**
         * Filter the rendered Webbuilder HTML output.
         *
         * @param string $html Webbuilder HTML stored in post meta.
         * @param int    $post_id Current post ID.
         */
        return apply_filters( 'webbuilder/render_content', $html, $post->ID );
    }

    /**
     * Output inline styles for Webbuilder pages.
     */
    public function output_builder_styles() {
        if ( ! is_singular() ) {
            return;
        }

        $post_id = get_queried_object_id();

        if ( ! $post_id ) {
            return;
        }

        $css = '';

        if ( isset( $this->styles_cache[ $post_id ] ) ) {
            $css = $this->styles_cache[ $post_id ];
        } else {
            $css = (string) get_post_meta( $post_id, 'webbuilder_css', true );
        }

        if ( '' === $css ) {
            return;
        }

        printf(
            '<style id="webbuilder-styles-%1$d">%2$s</style>' . "\n",
            esc_attr( $post_id ),
            esc_html( $css )
        );
    }

    /**
     * Add an admin bar shortcut to edit the page in Webbuilder.
     *
     * @param WP_Admin_Bar $admin_bar Admin bar instance.
     */
    public function add_admin_bar_link( WP_Admin_Bar $admin_bar ) {
        if ( is_admin() || ! is_singular() ) {
            return;
        }

        $post_id = get_queried_object_id();

        if ( ! $post_id || ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        $html = (string) get_post_meta( $post_id, 'webbuilder_html', true );

        if ( '' === $html ) {
            return;
        }

        $admin_bar->add_node(
            [
                'id'    => 'webbuilder-edit',
                'title' => __( 'Edit in Webbuilder', 'webbuilder' ),
                'href'  => esc_url(
                    add_query_arg(
                        [
                            'page'    => 'webbuilder',
                            'post_id' => $post_id,
                        ],
                        admin_url( 'admin.php' )
                    )
                ),
                'meta'  => [
                    'class' => 'webbuilder-edit-link',
                ],
            ]
        );
    }
}
