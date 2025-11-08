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
     * Registered WordPress filters.
     *
     * @var array<int, array{hook:string, component:object, callback:string, priority:int, accepted_args:int}>
     */
    protected $filters = [];

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
     * Register a WordPress filter.
     *
     * @param string $hook          Hook name.
     * @param object $component     Component instance.
     * @param string $callback      Callback method name.
     * @param int    $priority      Priority.
     * @param int    $accepted_args Accepted arguments.
     */
    public function add_filter( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
        $this->filters[] = [
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

        foreach ( $this->filters as $filter ) {
            add_filter(
                $filter['hook'],
                [ $filter['component'], $filter['callback'] ],
                $filter['priority'],
                $filter['accepted_args']
            );
        }
    }
}
