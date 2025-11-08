<?php
/**
 * Admin builder template.
 *
 * @package Webbuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$post_id = isset( $_GET['post_id'] ) ? absint( wp_unslash( $_GET['post_id'] ) ) : 0;

if ( ! $post_id ) {
    $pages = get_posts(
        [
            'post_type'   => 'page',
            'post_status' => 'publish',
            'numberposts' => -1,
            'orderby'     => 'title',
            'order'       => 'ASC',
        ]
    );
    ?>
    <div class="wrap webbuilder-wrap">
        <div class="webbuilder-select-page">
            <h2><?php esc_html_e( 'Select a Page to Edit', 'webbuilder' ); ?></h2>
            <select id="webbuilder-page-select">
                <option value=""><?php esc_html_e( 'Select…', 'webbuilder' ); ?></option>
                <?php foreach ( $pages as $page ) : ?>
                    <option value="<?php echo esc_attr( $page->ID ); ?>"><?php echo esc_html( $page->post_title ); ?></option>
                <?php endforeach; ?>
            </select>
            <button type="button" id="webbuilder-open-btn"><?php esc_html_e( 'Open in Builder', 'webbuilder' ); ?></button>
        </div>
    </div>
    <script>
        ( function () {
            const openButton = document.getElementById( 'webbuilder-open-btn' );

            if ( ! openButton ) {
                return;
            }

            openButton.addEventListener( 'click', function () {
                const select = document.getElementById( 'webbuilder-page-select' );

                if ( ! select || ! select.value ) {
                    return;
                }

                try {
                    const url = new URL( window.location.href );
                    url.searchParams.set( 'post_id', select.value );
                    window.location.href = url.toString();
                } catch ( e ) {
                    window.location.href = window.location.href + '&post_id=' + encodeURIComponent( select.value );
                }
            } );
        }() );
    </script>
    <?php
    return;
}

$selector_data = webbuilder_get_template_selector_data();
$post_content = get_post_field( 'post_content', $post_id );
$allowed_html = wp_kses_allowed_html( 'post' );
$allowed_html['style'] = [
    'type'   => true,
    'media'  => true,
    'scoped' => true,
];
$post_content = $post_content ? wp_kses( $post_content, $allowed_html ) : '';
?>
<div class="wrap webbuilder-wrap">
    <div class="webbuilder-template-bar" role="region" aria-label="<?php esc_attr_e( 'Template Selector', 'webbuilder' ); ?>">
        <label for="webbuilder-template-select"><?php esc_html_e( 'Select Template', 'webbuilder' ); ?></label>
        <select id="webbuilder-template-select">
            <?php foreach ( $selector_data['templates'] as $template_key => $template_label ) : ?>
                <option value="<?php echo esc_attr( $template_key ); ?>"><?php echo esc_html( $template_label ); ?></option>
            <?php endforeach; ?>
        </select>

        <label for="webbuilder-page-select"><?php esc_html_e( 'Select Page', 'webbuilder' ); ?></label>
        <select id="webbuilder-page-select">
            <?php foreach ( $selector_data['pages'] as $page_key => $page_label ) : ?>
                <option value="<?php echo esc_attr( $page_key ); ?>"><?php echo esc_html( $page_label ); ?></option>
            <?php endforeach; ?>
        </select>

        <button type="button" class="webbuilder-load-button" id="webbuilder-load-template">
            <?php esc_html_e( 'Load Template', 'webbuilder' ); ?>
        </button>
        <div class="webbuilder-notice" id="webbuilder-notice" role="status" aria-live="polite"></div>
    </div>
    <div id="webbuilder-editor"><?php echo $post_content; ?></div>
</div>
