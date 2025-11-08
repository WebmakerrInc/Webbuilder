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
require_once WEBBUILDER_PLUGIN_DIR . 'includes/class-webbuilder-content.php';

/**
 * Bootstrap the plugin.
 */
function webbuilder_run() {
    $loader = new Webbuilder_Loader();

    $admin = new Webbuilder_Admin( WEBBUILDER_VERSION );
    $admin->register( $loader );

    $ajax = new Webbuilder_Ajax();
    $ajax->register( $loader );

    $content = new Webbuilder_Content();
    $content->register( $loader );

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
