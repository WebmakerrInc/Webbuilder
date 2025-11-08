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
