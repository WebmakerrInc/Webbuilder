<?php
/**
 * Admin builder template.
 *
 * @var string $title
 * @var int    $post_id
 * @var string $post_content
 * @var string $post_title
 *
 * @package GrapesJS\PageBuilder
 */

defined( 'ABSPATH' ) || exit;

$is_editing_post      = $post_id > 0;
$template_categories  = [
    'coffee-shop' => __( 'Coffee Shop', 'grapesjs-page-builder' ),
    'barber'      => __( 'Barber', 'grapesjs-page-builder' ),
    'school'      => __( 'School', 'grapesjs-page-builder' ),
];
$template_page_types = [
    'home'     => __( 'Home', 'grapesjs-page-builder' ),
    'about'    => __( 'About', 'grapesjs-page-builder' ),
    'services' => __( 'Services', 'grapesjs-page-builder' ),
    'contact'  => __( 'Contact', 'grapesjs-page-builder' ),
];
?>
<div class="wrap grapesjs-builder-wrap">
    <h1><?php echo esc_html( $title ); ?></h1>
    <div class="grapesjs-template-selector" data-grapesjs-template-loader>
        <div class="grapesjs-template-selector__group">
            <label class="grapesjs-template-selector__label" for="grapesjs-template-category">
                <?php esc_html_e( 'Select Template Category', 'grapesjs-page-builder' ); ?>
            </label>
            <select id="grapesjs-template-category" class="grapesjs-template-selector__select" data-template-category>
                <option value=""><?php esc_html_e( 'Choose a category', 'grapesjs-page-builder' ); ?></option>
                <?php foreach ( $template_categories as $template_slug => $template_label ) : ?>
                    <option value="<?php echo esc_attr( $template_slug ); ?>"><?php echo esc_html( $template_label ); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="grapesjs-template-selector__group">
            <label class="grapesjs-template-selector__label" for="grapesjs-template-page">
                <?php esc_html_e( 'Select Page', 'grapesjs-page-builder' ); ?>
            </label>
            <select id="grapesjs-template-page" class="grapesjs-template-selector__select" data-template-page>
                <option value=""><?php esc_html_e( 'Choose a page', 'grapesjs-page-builder' ); ?></option>
                <?php foreach ( $template_page_types as $page_slug => $page_label ) : ?>
                    <option value="<?php echo esc_attr( $page_slug ); ?>"><?php echo esc_html( $page_label ); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="grapesjs-template-selector__actions">
            <button type="button" class="button button-secondary" data-template-load>
                <?php esc_html_e( 'Load Template', 'grapesjs-page-builder' ); ?>
            </button>
        </div>
    </div>
    <?php if ( $is_editing_post ) : ?>
        <p class="description">
            <?php
            echo wp_kses_post(
                sprintf(
                    /* translators: %s: Page title. */
                    __( 'You are editing the page: %s', 'grapesjs-page-builder' ),
                    '<strong>' . esc_html( $post_title ) . '</strong>'
                )
            );
            ?>
        </p>
    <?php else : ?>
        <div class="grapesjs-notice notice notice-info">
            <p><?php esc_html_e( 'Use the GrapesJS editor below to create and experiment with layouts directly inside WordPress.', 'grapesjs-page-builder' ); ?></p>
        </div>
    <?php endif; ?>

    <?php if ( $is_editing_post ) : ?>
        <div class="grapesjs-editor-actions">
            <button type="button" class="button button-primary" id="grapesjs-save-button">
                <?php esc_html_e( 'Save', 'grapesjs-page-builder' ); ?>
            </button>
            <span class="grapesjs-save-status" id="grapesjs-save-status" aria-live="polite"></span>
        </div>
    <?php endif; ?>

    <div class="grapesjs-editor-shell">
        <div
            class="grapesjs-editor"
            id="gjs"
            data-grapesjs-editor
            data-editor-height="78vh"
            data-post-id="<?php echo esc_attr( $post_id ); ?>"
            <?php if ( $is_editing_post ) : ?>data-save-button="#grapesjs-save-button" data-save-status="#grapesjs-save-status"<?php endif; ?>
            style="min-height: 78vh;"
        >
            <?php echo wp_kses_post( $post_content ); ?>
        </div>
    </div>
</div>
