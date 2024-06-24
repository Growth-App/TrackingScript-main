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

wp_enqueue_script("growth-app-script", plugins_url("js/main.js", __FILE__), [], "1.0.0", false);
