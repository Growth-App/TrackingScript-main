export interface FormInteraction {
  form_id: string;
  field_interactions: { field_name: string; timestamp: number }[];
  submitted: boolean;
}

export interface ClickEvent {
  session_id:string;
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

export interface DeviceInfo {
  deviceType: string;
  browserType: string;
  operatingSystem: string;
}

export interface SessionData {
  session_id: string;
  device_id:string;
  site_id:string;
  source: string;
  utm_source: string;
  utm_campaign: string;
  utm_medium: string;
  device_type: string;
  browser_type: string;
  operating_system: string;
  page_url: string;
  form_interactions: FormInteraction[];
  click_events: ClickEvent[];
  scroll_depth: number;
  js_errors: JsError[];
  broken_links: string[];
  device_info: DeviceInfo;
  start_time: number;
  mouse_movements: { x: number; y: number; timestamp: number }[];
  new_visitor: boolean,
  geographic_location?: string;
}