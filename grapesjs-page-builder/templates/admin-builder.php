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

$is_editing_post = $post_id > 0;
?>
<div class="wrap grapesjs-builder-wrap">
    <h1><?php echo esc_html( $title ); ?></h1>
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
