<?php
/**
 * Admin builder template.
 *
 * @var string $title
 *
 * @package GrapesJS\PageBuilder
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="wrap grapesjs-builder-wrap">
    <h1><?php echo esc_html( $title ); ?></h1>
    <div class="grapesjs-notice notice notice-info">
        <p><?php esc_html_e( 'Use the GrapesJS editor below to create and experiment with layouts directly inside WordPress.', 'grapesjs-page-builder' ); ?></p>
    </div>
    <div class="grapesjs-editor-shell">
        <div class="grapesjs-editor" data-grapesjs-editor data-editor-height="78vh" style="min-height: 78vh;"></div>
    </div>
</div>
