<?php

/**
 * Plugin Name: Growth App
 * Description: Growth App - The only AI powered CRO solution you need.
 * Version: 1.0.0
 * Author: Growth App
 * Author URI: https://growthapp.io
 * Text Domain: growth-app
 */

defined("ABSPATH") || exit;

function growth_app_tracking_settings_page()
{
?>
  <style>
    #growth-app-cro #submit {
      background-color: #01012D;
      padding: 10px 30px 10px 30px;
      border-radius: 6px;
    }

    .wrap {
      background-color: #fff;
      padding: 3.5em;
    }

    #growth-app-cro .form-table th {
      width: 70px;
      padding-top: 30px;
    }

    input[type=text] {
      padding: 10px 14px 10px 14px;
      border-radius: 8px;
      border: 1px solid #DDE1E9;
      min-width: 250px;
    }
  </style>
  <div class="wrap">
    <h2>GrowthApp CRO AI Tracking Settings</h2>
    <div>
      <img src="<?php echo plugin_dir_url(__FILE__) . 'images/growth-cro.svg'; ?>" alt="GrowthApp CRO AI Settings Page" />
    </div>
    <div>
      <h3>How to get your Project ID and API key</h3>
      <p>
        Donec suscipit suscipit eros porta malesuada. Maecenas malesuada id ex ut mollis.
        Donec suscipit suscipit eros porta malesuada. Maecenas malesuada id ex ut mollis.
        Donec suscipit suscipit eros porta malesuada.
      </p>
    </div>
    <form id="growth-app-cro" method="post" action="options.php">
      <?php settings_fields('growth-app-tracking-settings-group'); ?>
      <table class="form-table">
        <tr valign="top">
          <th scope="row">ProjectID</th>
          <td><input type="text" name="growth_app_project_id" placeholder="growth app project id" value="<?php echo esc_attr(get_option('growth_app_project_id')); ?>" /></td>
        </tr>
        <tr valign="top">
          <th scope="row">API Key</th>
          <td><input type="text" name="growth_app_api_key" placeholder="API keys" value="<?php echo esc_attr(get_option('growth_app_api_key')); ?>" /></td>
        </tr>
      </table>
      <?php submit_button(); ?>
    </form>
  </div>
<?php
}

function growth_app_tracking_menu()
{
  add_menu_page(
    __('Growth App Tracking Settings', 'growth-app'),
    'GrowthApp AI',
    'manage_options',
    'growth-app-tracking-settings',
    'growth_app_tracking_settings_page',
    plugin_dir_url(__FILE__) . 'images/growth-app.png',
    16
  );
}

function growth_app_tracking_settings()
{
  register_setting('growth-app-tracking-settings-group', 'growth_app_project_id');
  register_setting('growth-app-tracking-settings-group', 'growth_app_api_key');
}

function enqueue_growth_app_script()
{
  $project_id = get_option('growth_app_project_id');
  $api_key = get_option('growth_app_api_key');
  $script_name = "growth-app-script";

  if ($project_id && $api_key) {
    wp_register_script($script_name, plugins_url("js/main.js", __FILE__), [], "1.0.0", false);
    wp_enqueue_script($script_name);
    wp_localize_script(
      $script_name,
      "growth_app_args",
      [
        "GROWTH_APP_SITE_ID" => $project_id,
        "GROWTH_APP_API_KEY" => $api_key,
        "WP" => true,
      ],
    );
  }
}

add_action('admin_init', 'growth_app_tracking_settings');
add_action('admin_menu', 'growth_app_tracking_menu');
add_action("wp_enqueue_scripts", "enqueue_growth_app_script");
