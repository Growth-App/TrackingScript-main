declare namespace NodeJS {
  interface ProcessEnv {
    SESSION_DATA_URL: string; // Declare your custom environment variables here
    SESSION_EVENT_URL: string; // Declare your custom environment variables here
    CLICK_EVENT_URL: string; // Declare your custom environment variables here
    PAGE_VIEW_URL: string; // Declare your custom environment variables here
    // Other environment variables...
  }
}
