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
$has_templates = ! empty( $selector_data['registry'] );
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
        <label for="webbuilder-template-select"><?php esc_html_e( 'Select Business', 'webbuilder' ); ?></label>
        <select
            id="webbuilder-template-select"
            class="webbuilder-select bg-white border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
            <?php disabled( ! $has_templates ); ?>
        >
            <option value=""><?php esc_html_e( 'Choose a business type', 'webbuilder' ); ?></option>
        </select>

        <label for="webbuilder-page-select"><?php esc_html_e( 'Select Page Template', 'webbuilder' ); ?></label>
        <select
            id="webbuilder-page-select"
            class="webbuilder-select bg-white border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
            <?php disabled( ! $has_templates ); ?>
        >
            <option value=""><?php esc_html_e( 'Choose a page layout', 'webbuilder' ); ?></option>
        </select>

        <button
            type="button"
            class="webbuilder-load-button inline-flex items-center justify-center px-4 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
            id="webbuilder-load-template"
            <?php disabled( ! $has_templates ); ?>
        >
            <?php esc_html_e( 'Load Page', 'webbuilder' ); ?>
        </button>
        <div class="webbuilder-notice" id="webbuilder-notice" role="status" aria-live="polite"></div>
    </div>
    <div id="webbuilder-editor"><?php echo $post_content; ?></div>
</div>
