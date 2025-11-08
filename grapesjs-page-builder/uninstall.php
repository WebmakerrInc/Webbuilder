<?php
/**
 * Uninstall handler.
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'grapesjs_page_builder_settings' );
