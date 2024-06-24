declare namespace NodeJS {
  interface ProcessEnv {
    SESSION_DATA_URL: string;
    SESSION_EVENT_URL: string;
    CLICK_EVENT_URL: string;
    PAGE_VIEW_URL: string;
  }
}

interface GrothAppArgs {
  GROWTH_APP_SITE_ID?: string;
  WP?: boolean;
};

interface Window  extends GrothAppArgs {
  startGrowthAppTracker?: (wp_args) => void
}

declare const growth_app_args : GrothAppArgs;
