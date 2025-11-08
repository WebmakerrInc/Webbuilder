<?php
/*
Template Name: Webbuilder Canvas
Description: Full-width blank template for Webbuilder pages.
*/
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: auto;
      overflow-x: hidden;
    }

    .webbuilder-canvas {
      width: 100%;
      max-width: none;
      margin: 0;
    }
  </style>
</head>
<body <?php body_class('webbuilder-canvas'); ?>>
  <?php
  while ( have_posts() ) :
      the_post();
      the_content();
  endwhile;
  ?>
  <?php wp_footer(); ?>
</body>
</html>
