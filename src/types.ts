export interface FormInteraction {
  formId: string;
  fieldInteractions: { fieldName: string; timestamp: number }[];
  submitted: boolean;
}

export interface ClickEvent {
  sessionId:string;
  element: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface KeypressEvent {
  element: string;
  key: string;
  timestamp: number;
}

export interface JsError {
  message: string;
  url: string;
  line: number;
  column: number;
  errorObject: string;
}

export interface FormAnalysis {
  formId: string;
  completionRate: number;
  abandonmentRate: number;
}

export interface FunnelAnalysis {
  funnelId: string;
  steps: { stepName: string; completed: boolean; timestamp: number }[];
}

export interface EcommerceMetrics {
  productViews: number;
  cartAdditions: number;
  purchaseCompletions: number;
}

export interface ContentPerformance {
  contentType: string;
  pageViews: number;
  timeSpent: number;
}

export interface TechnicalMeasurements {
  pageLoadTime: number;
  errorTracking: JsError[];
  brokenLinks: string[];
  websiteSpeed: number;
}

export interface SEOPerformance {
  organicTraffic: number;
  keywordRankings: { keyword: string; ranking: number }[];
  landingPagePerformance: { url: string; conversions: number }[];
}

export interface DeviceInfo {
  deviceType: string;
  browserType: string;
  operatingSystem: string;
}

export interface TrafficData {
  sessionId: string;
  deviceId:string;
  siteId:string;
  source: string;
  utm_source: string;
  utm_campaign: string;
  utm_medium: string;
  device_type: string;
  browser_type: string;
  operating_system: string;
  page_url: string;
  social_media_profiles: string[];
  time_spent: number;
  form_interactions: FormInteraction[];
  click_events: ClickEvent[];
  scroll_depth: number;
  js_errors: JsError[];
  heatmap_data: Record<string, number>;
  geographic_location?: string;
  organic_keywords?: string;
  total_sessions: number;
  unique_visitors: number;
  returning_visitors: number;
  new_visitors: number;
  session_duration: number;
  time_on_page: number;
  page_views: number;
  session_recording: any[];
  form_analyses: FormAnalysis[];
  funnel_analyses: FunnelAnalysis[];
  ecommerce_metrics: EcommerceMetrics;
  content_performance?: ContentPerformance;
  technical_measurment?: TechnicalMeasurements;
  seo_performance?: SEOPerformance;
  device_info: DeviceInfo;
  startTime: number;
  mouseMovements: { x: number; y: number; timestamp: number }[];
}