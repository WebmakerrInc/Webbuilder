<?php
/**
 * Plugin Name:       GrapesJS Page Builder
 * Plugin URI:        https://example.com/plugins/grapesjs-page-builder
 * Description:       Integrates the GrapesJS visual editor directly inside WordPress for rapid page building.
 * Version:           1.0.0
 * Author:            Webbuilder Team
 * Author URI:        https://example.com
 * License:           BSD-3-Clause
 * License URI:       https://opensource.org/licenses/BSD-3-Clause
 * Text Domain:       grapesjs-page-builder
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

require_once plugin_dir_path( __FILE__ ) . 'includes/class-grapesjs-loader.php';

function grapesjs_page_builder() {
    static $plugin = null;

    if ( null === $plugin ) {
        $plugin = new \GrapesJS\PageBuilder\Loader( __FILE__ );
        $plugin->init();
    }

    return $plugin;
}

grapesjs_page_builder();
