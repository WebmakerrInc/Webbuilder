<?php
/**
 * Admin builder template.
 *
 * @package Webbuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$selector_data = webbuilder_get_template_selector_data();
?>
<div class="wrap webbuilder-wrap">
    <div class="webbuilder-template-bar" role="region" aria-label="<?php esc_attr_e( 'Template Selector', 'webbuilder' ); ?>">
        <div class="webbuilder-field">
            <label for="webbuilder-template-select"><?php esc_html_e( 'Select Template', 'webbuilder' ); ?></label>
            <select id="webbuilder-template-select">
                <?php foreach ( $selector_data['templates'] as $template_key => $template_label ) : ?>
                    <option value="<?php echo esc_attr( $template_key ); ?>"><?php echo esc_html( $template_label ); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="webbuilder-field">
            <label for="webbuilder-page-select"><?php esc_html_e( 'Select Page', 'webbuilder' ); ?></label>
            <select id="webbuilder-page-select">
                <?php foreach ( $selector_data['pages'] as $page_key => $page_label ) : ?>
                    <option value="<?php echo esc_attr( $page_key ); ?>"><?php echo esc_html( $page_label ); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <button type="button" class="button webbuilder-load-button" id="webbuilder-load-template">
            <?php esc_html_e( 'Load Template', 'webbuilder' ); ?>
        </button>
        <div class="webbuilder-notice" id="webbuilder-notice" role="status" aria-live="polite"></div>
    </div>
    <div id="webbuilder-editor"></div>
</div>
