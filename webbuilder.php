<?php
/**
 * Plugin Name: Webbuilder
 * Description: Visual page builder with template library for WordPress.
 * Version: 2.0.0
 * Author: Webmakerr
 * Text Domain: webbuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! defined( 'WEBBUILDER_VERSION' ) ) {
    define( 'WEBBUILDER_VERSION', '2.0.0' );
}

if ( ! defined( 'WEBBUILDER_PLUGIN_DIR' ) ) {
    define( 'WEBBUILDER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'WEBBUILDER_PLUGIN_URL' ) ) {
    define( 'WEBBUILDER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}

require_once WEBBUILDER_PLUGIN_DIR . 'includes/class-webbuilder-loader.php';
require_once WEBBUILDER_PLUGIN_DIR . 'includes/class-webbuilder-admin.php';
require_once WEBBUILDER_PLUGIN_DIR . 'includes/class-webbuilder-ajax.php';
require_once WEBBUILDER_PLUGIN_DIR . 'includes/class-webbuilder-edit-links.php';

/**
 * Bootstrap the plugin.
 */
function webbuilder_run() {
    $loader = new Webbuilder_Loader();

    $admin = new Webbuilder_Admin( WEBBUILDER_VERSION );
    $admin->register( $loader );

    $ajax = new Webbuilder_Ajax();
    $ajax->register( $loader );

    $edit_links = new Webbuilder_Edit_Links();
    $edit_links->register();

    $loader->run();
}
webbuilder_run();

/**
 * Provide template selector data for PHP rendering.
 *
 * @return array<string, array<string, string>>
 */
function webbuilder_get_template_selector_data() {
    $data = [
        'templates' => [
            'coffee-shop' => __( 'Coffee Shop', 'webbuilder' ),
            'barber'      => __( 'Barber', 'webbuilder' ),
            'school'      => __( 'School', 'webbuilder' ),
        ],
        'pages'     => [
            'home'     => __( 'Home', 'webbuilder' ),
            'about'    => __( 'About', 'webbuilder' ),
            'services' => __( 'Services', 'webbuilder' ),
            'contact'  => __( 'Contact', 'webbuilder' ),
        ],
    ];

    return apply_filters( 'webbuilder/template_selector_data', $data );
}

/**
 * Starter template definitions for headers and footers.
 *
 * @return array<string, array<string, array<string, string>>>
 */
function webbuilder_get_starter_templates() {
    $templates = [
        'headers' => [
            'classic'  => [
                'label' => __( 'Classic', 'webbuilder' ),
                'file'  => 'templates-library/headers/classic.html',
            ],
            'centered' => [
                'label' => __( 'Centered', 'webbuilder' ),
                'file'  => 'templates-library/headers/centered.html',
            ],
            'minimal'  => [
                'label' => __( 'Minimal', 'webbuilder' ),
                'file'  => 'templates-library/headers/minimal.html',
            ],
        ],
        'footers' => [
            'basic'    => [
                'label' => __( 'Basic Columns', 'webbuilder' ),
                'file'  => 'templates-library/footers/basic.html',
            ],
            'centered' => [
                'label' => __( 'Centered', 'webbuilder' ),
                'file'  => 'templates-library/footers/centered.html',
            ],
            'minimal'  => [
                'label' => __( 'Minimal', 'webbuilder' ),
                'file'  => 'templates-library/footers/minimal.html',
            ],
        ],
    ];

    return apply_filters( 'webbuilder/starter_templates', $templates );
}

add_filter( 'theme_page_templates', 'webbuilder_register_canvas_template' );

/**
 * Add the Webbuilder canvas template to the available page templates.
 *
 * @param array<string, string> $templates Theme templates.
 *
 * @return array<string, string>
 */
function webbuilder_register_canvas_template( $templates ) {
    $templates['webbuilder-canvas.php'] = __( 'Webbuilder Canvas', 'webbuilder' );

    return $templates;
}

add_filter( 'page_template', 'webbuilder_use_canvas_template' );

/**
 * Resolve the Webbuilder canvas template path when assigned to a page.
 *
 * @param string $template Current template path.
 *
 * @return string
 */
function webbuilder_use_canvas_template( $template ) {
    if ( is_singular( 'page' ) ) {
        $page_template = get_page_template_slug( get_queried_object_id() );

        if ( 'webbuilder-canvas.php' === $page_template ) {
            $plugin_template = WEBBUILDER_PLUGIN_DIR . 'templates/webbuilder-canvas.php';

            if ( file_exists( $plugin_template ) ) {
                return $plugin_template;
            }
        }
    }

    return $template;
}

add_action( 'save_post_page', 'webbuilder_auto_assign_canvas_template', 10, 3 );

/**
 * Automatically assign the Webbuilder canvas template when saving via Webbuilder.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 * @param bool    $update  Whether this is an existing post being updated.
 */
function webbuilder_auto_assign_canvas_template( $post_id, $post, $update ) {
    unset( $update );

    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
        return;
    }

    if ( isset( $_POST['_webbuilder_used'] ) && '1' === $_POST['_webbuilder_used'] ) {
        update_post_meta( $post_id, '_wp_page_template', 'webbuilder-canvas.php' );
    }
}

add_action( 'add_meta_boxes', 'webbuilder_register_assignment_meta_box' );

/**
 * Register assignment meta boxes for header and footer templates.
 */
function webbuilder_register_assignment_meta_box() {
    $post_types = [ 'webbuilder_header', 'webbuilder_footer' ];

    foreach ( $post_types as $post_type ) {
        add_meta_box(
            'webbuilder_assignment_' . $post_type,
            __( 'Header/Footer Assignment', 'webbuilder' ),
            'webbuilder_render_assignment_meta_box',
            $post_type,
            'side',
            'default'
        );
    }
}

/**
 * Render the assignment meta box.
 *
 * @param WP_Post $post Current post object.
 */
function webbuilder_render_assignment_meta_box( $post ) {
    if ( ! $post instanceof WP_Post ) {
        return;
    }

    wp_nonce_field( 'webbuilder_assign_template', 'webbuilder_assign_nonce' );

    $assign_all     = (int) get_post_meta( $post->ID, '_assign_all', true );
    $assigned_pages = get_post_meta( $post->ID, '_assigned_pages', true );

    if ( ! is_array( $assigned_pages ) ) {
        $assigned_pages = [];
    }

    $assigned_pages = array_map( 'absint', $assigned_pages );

    echo '<p><label><input type="checkbox" name="webbuilder_assign_all" value="1" ' . checked( 1, $assign_all, false ) . ' /> ' . esc_html__( 'Apply to all pages', 'webbuilder' ) . '</label></p>';
    echo '<p><strong>' . esc_html__( 'Or select specific pages:', 'webbuilder' ) . '</strong></p>';

    $pages = get_posts(
        [
            'post_type'        => 'page',
            'post_status'      => [ 'publish', 'draft', 'pending', 'private' ],
            'numberposts'      => -1,
            'orderby'          => 'title',
            'order'            => 'ASC',
            'suppress_filters' => false,
        ]
    );

    if ( ! empty( $pages ) ) {
        echo '<div class="webbuilder-assignment-list">';

        foreach ( $pages as $page ) {
            $page_id    = (int) $page->ID;
            $page_title = $page->post_title ? $page->post_title : sprintf( __( '(no title) – ID %d', 'webbuilder' ), $page_id );
            $is_checked = in_array( $page_id, $assigned_pages, true ) ? ' checked="checked"' : '';

            printf(
                '<label style="display:block;margin-bottom:6px;"><input type="checkbox" name="webbuilder_assigned_pages[]" value="%1$s"%2$s /> %3$s</label>',
                esc_attr( $page_id ),
                $is_checked,
                esc_html( $page_title )
            );
        }

        echo '</div>';
    } else {
        echo '<p><em>' . esc_html__( 'No pages available yet.', 'webbuilder' ) . '</em></p>';
    }
}

add_action( 'save_post', 'webbuilder_save_assignment_meta' );

/**
 * Persist assignment settings for header and footer templates.
 *
 * @param int $post_id Post ID.
 */
function webbuilder_save_assignment_meta( $post_id ) {
    $post_type = get_post_type( $post_id );

    if ( ! in_array( $post_type, [ 'webbuilder_header', 'webbuilder_footer' ], true ) ) {
        return;
    }

    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
        return;
    }

    if ( ! isset( $_POST['webbuilder_assign_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['webbuilder_assign_nonce'] ) ), 'webbuilder_assign_template' ) ) {
        return;
    }

    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    $assign_all = isset( $_POST['webbuilder_assign_all'] ) ? 1 : 0;
    $raw_pages  = isset( $_POST['webbuilder_assigned_pages'] ) ? (array) wp_unslash( $_POST['webbuilder_assigned_pages'] ) : [];

    $assigned_pages = array_filter(
        array_unique(
            array_map( 'absint', $raw_pages )
        )
    );

    if ( $assign_all ) {
        update_post_meta( $post_id, '_assign_all', 1 );
    } else {
        delete_post_meta( $post_id, '_assign_all' );
    }

    if ( ! empty( $assigned_pages ) ) {
        update_post_meta( $post_id, '_assigned_pages', array_values( $assigned_pages ) );
    } else {
        delete_post_meta( $post_id, '_assigned_pages' );
    }
}

add_action( 'add_meta_boxes', 'webbuilder_register_layout_meta_box' );

/**
 * Register the Webbuilder layout meta box for pages.
 */
function webbuilder_register_layout_meta_box() {
    add_meta_box(
        'webbuilder_layout_meta',
        __( 'Webbuilder Layout', 'webbuilder' ),
        'webbuilder_render_layout_meta_box',
        'page',
        'side',
        'default'
    );
}

/**
 * Render the layout meta box.
 *
 * @param WP_Post $post Current post object.
 */
function webbuilder_render_layout_meta_box( $post ) {
    $headers = get_posts(
        [
            'post_type'      => 'webbuilder_header',
            'numberposts'    => -1,
            'orderby'        => 'title',
            'order'          => 'ASC',
            'suppress_filters' => false,
        ]
    );

    $footers = get_posts(
        [
            'post_type'      => 'webbuilder_footer',
            'numberposts'    => -1,
            'orderby'        => 'title',
            'order'          => 'ASC',
            'suppress_filters' => false,
        ]
    );

    $selected_header = get_post_meta( $post->ID, '_webbuilder_header_id', true );
    $selected_footer = get_post_meta( $post->ID, '_webbuilder_footer_id', true );

    wp_nonce_field( 'webbuilder_layout_meta', 'webbuilder_layout_nonce' );

    echo '<p><label for="webbuilder_header_id">' . esc_html__( 'Header Template', 'webbuilder' ) . '</label><br />';
    echo '<select name="webbuilder_header_id" id="webbuilder_header_id">';
    echo '<option value="">' . esc_html__( 'None', 'webbuilder' ) . '</option>';

    foreach ( $headers as $header ) {
        $selected = selected( (int) $selected_header, $header->ID, false );
        printf(
            '<option value="%1$s" %2$s>%3$s</option>',
            esc_attr( $header->ID ),
            $selected,
            esc_html( $header->post_title )
        );
    }

    echo '</select></p>';

    echo '<p><label for="webbuilder_footer_id">' . esc_html__( 'Footer Template', 'webbuilder' ) . '</label><br />';
    echo '<select name="webbuilder_footer_id" id="webbuilder_footer_id">';
    echo '<option value="">' . esc_html__( 'None', 'webbuilder' ) . '</option>';

    foreach ( $footers as $footer ) {
        $selected = selected( (int) $selected_footer, $footer->ID, false );
        printf(
            '<option value="%1$s" %2$s>%3$s</option>',
            esc_attr( $footer->ID ),
            $selected,
            esc_html( $footer->post_title )
        );
    }

    echo '</select></p>';
}

add_action( 'save_post_page', 'webbuilder_save_layout_meta', 10, 2 );

/**
 * Persist selected header and footer templates for a page.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 */
function webbuilder_save_layout_meta( $post_id, $post ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
        return;
    }

    if ( ! isset( $_POST['webbuilder_layout_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['webbuilder_layout_nonce'] ) ), 'webbuilder_layout_meta' ) ) {
        return;
    }

    if ( 'page' !== $post->post_type || ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    $header_id = isset( $_POST['webbuilder_header_id'] ) ? absint( wp_unslash( $_POST['webbuilder_header_id'] ) ) : 0;
    $footer_id = isset( $_POST['webbuilder_footer_id'] ) ? absint( wp_unslash( $_POST['webbuilder_footer_id'] ) ) : 0;

    if ( $header_id ) {
        update_post_meta( $post_id, '_webbuilder_header_id', $header_id );
    } else {
        delete_post_meta( $post_id, '_webbuilder_header_id' );
    }

    if ( $footer_id ) {
        update_post_meta( $post_id, '_webbuilder_footer_id', $footer_id );
    } else {
        delete_post_meta( $post_id, '_webbuilder_footer_id' );
    }
}

/**
 * Retrieve assignment candidates for the provided template type.
 *
 * @param string $post_type Template post type.
 *
 * @return array<int, array{post:WP_Post, assign_all:bool, assigned_pages:array<int, int>}>
 */
function webbuilder_get_assignment_candidates( $post_type ) {
    static $cache = [];

    if ( isset( $cache[ $post_type ] ) ) {
        return $cache[ $post_type ];
    }

    if ( ! in_array( $post_type, [ 'webbuilder_header', 'webbuilder_footer' ], true ) ) {
        $cache[ $post_type ] = [];

        return $cache[ $post_type ];
    }

    $posts = get_posts(
        [
            'post_type'        => $post_type,
            'post_status'      => 'publish',
            'numberposts'      => -1,
            'orderby'          => 'modified',
            'order'            => 'DESC',
            'suppress_filters' => false,
        ]
    );

    $cache[ $post_type ] = array_map(
        static function ( $post ) {
            $assign_all = (int) get_post_meta( $post->ID, '_assign_all', true );
            $pages      = get_post_meta( $post->ID, '_assigned_pages', true );

            if ( ! is_array( $pages ) ) {
                $pages = [];
            }

            $pages = array_values( array_filter( array_map( 'absint', $pages ) ) );

            return [
                'post'           => $post,
                'assign_all'     => (bool) $assign_all,
                'assigned_pages' => $pages,
            ];
        },
        $posts
    );

    return $cache[ $post_type ];
}

/**
 * Resolve the template assigned to a page.
 *
 * @param string   $post_type Template post type.
 * @param int|null $page_id   Page ID.
 *
 * @return int Template post ID or 0 when none match.
 */
function webbuilder_get_assigned_template_id( $post_type, $page_id = null ) {
    static $cache = [];

    $page_id   = $page_id ? absint( $page_id ) : 0;
    $cache_key = $post_type . ':' . $page_id;

    if ( isset( $cache[ $cache_key ] ) ) {
        return $cache[ $cache_key ];
    }

    if ( ! in_array( $post_type, [ 'webbuilder_header', 'webbuilder_footer' ], true ) ) {
        $cache[ $cache_key ] = 0;

        return 0;
    }

    if ( $page_id ) {
        $override_key = 'webbuilder_header' === $post_type ? '_webbuilder_header_id' : '_webbuilder_footer_id';
        $override_id  = (int) get_post_meta( $page_id, $override_key, true );

        if ( $override_id ) {
            $override_post = get_post( $override_id );

            if ( $override_post instanceof WP_Post && 'publish' === $override_post->post_status ) {
                $cache[ $cache_key ] = (int) $override_post->ID;

                return $cache[ $cache_key ];
            }
        }
    }

    $candidates = webbuilder_get_assignment_candidates( $post_type );

    $matched_id = 0;

    if ( $page_id ) {
        foreach ( $candidates as $candidate ) {
            if ( in_array( $page_id, $candidate['assigned_pages'], true ) ) {
                $matched_id = (int) $candidate['post']->ID;
                break;
            }
        }
    }

    if ( ! $matched_id ) {
        foreach ( $candidates as $candidate ) {
            if ( $candidate['assign_all'] ) {
                $matched_id = (int) $candidate['post']->ID;
                break;
            }
        }
    }

    $cache[ $cache_key ] = $matched_id;

    return $matched_id;
}

/**
 * Retrieve the HTML markup for an assigned template.
 *
 * @param string   $post_type Template post type.
 * @param int|null $page_id   Page ID.
 *
 * @return string
 */
function webbuilder_get_assigned_template_html( $post_type, $page_id = null ) {
    $template_id = webbuilder_get_assigned_template_id( $post_type, $page_id );

    return $template_id ? get_post_field( 'post_content', $template_id ) : '';
}

add_action( 'wp_enqueue_scripts', 'webbuilder_enqueue_template_assets' );

/**
 * Ensure template styles and scripts are available on the front end.
 */
function webbuilder_enqueue_template_assets() {
    if ( ! is_singular( [ 'page', 'webbuilder_header', 'webbuilder_footer' ] ) ) {
        return;
    }

    $post_id = get_queried_object_id();

    if ( ! $post_id ) {
        return;
    }

    $template_slug = get_post_meta( $post_id, '_webbuilder_template', true );
    $template_slug = $template_slug ? sanitize_title( $template_slug ) : '';

    wp_enqueue_style(
        'webbuilder-bootstrap-css',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
        [],
        '5.3.2'
    );

    wp_enqueue_style(
        'webbuilder-shared-styles',
        WEBBUILDER_PLUGIN_URL . 'templates-library/shared.css',
        [ 'webbuilder-bootstrap-css' ],
        WEBBUILDER_VERSION
    );

    if ( $template_slug ) {
        $template_path = WEBBUILDER_PLUGIN_DIR . 'templates-library/' . $template_slug . '/style.css';

        if ( file_exists( $template_path ) ) {
            wp_enqueue_style(
                'webbuilder-template-' . $template_slug,
                WEBBUILDER_PLUGIN_URL . 'templates-library/' . $template_slug . '/style.css',
                [ 'webbuilder-shared-styles' ],
                WEBBUILDER_VERSION
            );
        }
    }

    wp_enqueue_script(
        'webbuilder-bootstrap-js',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
        [],
        '5.3.2',
        true
    );
}
