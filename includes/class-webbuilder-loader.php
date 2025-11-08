<?php
/**
 * Loader class for Webbuilder hooks.
 *
 * @package Webbuilder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Registers actions and filters for the plugin.
 */
class Webbuilder_Loader {

    /**
     * Registered WordPress actions.
     *
     * @var array<int, array{hook:string, component:object, callback:string, priority:int, accepted_args:int}>
     */
    protected $actions = [];

    /**
     * Register a WordPress action.
     *
     * @param string $hook          Hook name.
     * @param object $component     Component instance.
     * @param string $callback      Callback method name.
     * @param int    $priority      Priority.
     * @param int    $accepted_args Accepted arguments.
     */
    public function add_action( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
        $this->actions[] = [
            'hook'          => $hook,
            'component'     => $component,
            'callback'      => $callback,
            'priority'      => $priority,
            'accepted_args' => $accepted_args,
        ];
    }

    /**
     * Register the actions with WordPress.
     */
    public function run() {
        foreach ( $this->actions as $action ) {
            add_action(
                $action['hook'],
                [ $action['component'], $action['callback'] ],
                $action['priority'],
                $action['accepted_args']
            );
        }
    }
}

add_action(
    'init',
    function () {
        register_post_type(
            'webbuilder_header',
            [
                'label'         => __( 'Webbuilder Headers', 'webbuilder' ),
                'public'        => false,
                'show_ui'       => true,
                'show_in_menu'  => false,
                'menu_position' => 25,
                'supports'      => [ 'title', 'editor' ],
            ]
        );

        register_post_type(
            'webbuilder_footer',
            [
                'label'         => __( 'Webbuilder Footers', 'webbuilder' ),
                'public'        => false,
                'show_ui'       => true,
                'show_in_menu'  => false,
                'menu_position' => 26,
                'supports'      => [ 'title', 'editor' ],
            ]
        );
    }
);
