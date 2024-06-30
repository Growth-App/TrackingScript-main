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
  GROWTH_APP_API_KEY?: string;
  WP?: boolean;
};

interface Window  extends GrothAppArgs {
  startGrowthAppTracker?: () => void
}

declare const growth_app_args : GrothAppArgs;
