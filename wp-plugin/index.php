<?php
/**
 * Plugin Name: Growth App
 * Description: Growth App - The only AI powered CRO solution you need.
 * Version: 1.0.0
 * Author: Princewill Chiaka
 */

// Exit if accessed directly
if (!defined("ABSPATH")) {
    exit;
}

function initGrowthApp() {
  $script_name = "growth-app-script";

  wp_register_script($script_name, plugins_url("js/main.js", __FILE__), [], "1.0.0", false);
  wp_enqueue_script($script_name);
  wp_localize_script(
    $script_name,
    "growth_app_args", 
    [
      "GROWTH_APP_SITE_ID" => "SITE_ID",
      "WP" => true,
    ],
  );
}

add_action("wp_enqueue_scripts", "initGrowthApp");