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
            'business'    => __( 'Business', 'webbuilder' ),
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

add_action( 'wp_enqueue_scripts', 'webbuilder_enqueue_tailwind_styles' );

/**
 * Ensure Tailwind CSS is available on the front end for Webbuilder content.
 */
function webbuilder_enqueue_tailwind_styles() {
    if ( ! is_singular() ) {
        return;
    }

    wp_enqueue_style(
        'webbuilder-tailwind',
        'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
        [],
        '2.2.19'
    );
}
