import { v4 as uuidv4 } from "uuid";
import * as dotenv  from "dotenv";
dotenv.config()

const sessionUrl = process.env.SESSION_DATA_URL!
const sessionEventUrl = process.env.SESSION_EVENT_URL!
const clickEventUrl = process.env.CLICK_EVENT_URL!
const pageViewURl = process.env.PAGE_VIEW_URL!


interface FormInteraction {
  formId: string;
  fieldInteractions: { fieldName: string; timestamp: number }[];
  submitted: boolean;
}

interface ClickEvent {
  sessionId:string;
  element: string;
  x: number;
  y: number;
  timestamp: number;
}

interface KeypressEvent {
  element: string;
  key: string;
  timestamp: number;
}

interface JsError {
  message: string;
  url: string;
  line: number;
  column: number;
  errorObject: string;
}

interface FormAnalysis {
  formId: string;
  completionRate: number;
  abandonmentRate: number;
}

interface FunnelAnalysis {
  funnelId: string;
  steps: { stepName: string; completed: boolean; timestamp: number }[];
}

interface EcommerceMetrics {
  productViews: number;
  cartAdditions: number;
  purchaseCompletions: number;
}

interface ContentPerformance {
  contentType: string;
  pageViews: number;
  timeSpent: number;
}

interface TechnicalMeasurements {
  pageLoadTime: number;
  errorTracking: JsError[];
  brokenLinks: string[];
  websiteSpeed: number;
}

interface SEOPerformance {
  organicTraffic: number;
  keywordRankings: { keyword: string; ranking: number }[];
  landingPagePerformance: { url: string; conversions: number }[];
}

interface DeviceInfo {
  deviceType: string;
  browserType: string;
  operatingSystem: string;
}

interface TrafficData {
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

let trafficData: TrafficData | null = null;
let currentPageStartTime: number = Date.now();

// Helper function to generate a unique ID
function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getDeviceId() {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}

const deviceId = getDeviceId()
const siteId = generateUniqueId()

// Helper function to get device info
function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const os = /Windows|Mac|Linux|iPhone|Android/.exec(platform) || ["Unknown"];
  const browser = /Chrome|Firefox|Safari|Edge|Opera/.exec(userAgent) || [
    "Unknown",
  ];
  const deviceType = /Mobile|Tablet|iPad/.exec(userAgent)
    ? "Mobile"
    : "Desktop";

  return {
    deviceType: deviceType,
    browserType: browser[0],
    operatingSystem: os[0],
  };
}

// Helper function to get UTM parameters
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_medium: params.get("utm_medium") || "",
  };
}

// let trafficData:TrafficData | null = null

// Initialize session data if not already present
function initializeSessionData() {
  const storedSessionId = localStorage.getItem("sessionId");
  const isReturningVisitor = !!storedSessionId;
  const utmParams = getUTMParams();
  const deviceInfo = getDeviceInfo();

  trafficData = {
    sessionId: storedSessionId || generateUniqueId(),
    siteId:siteId,
    deviceId:deviceId,
    source: document.referrer,
    utm_source: utmParams.utm_source,
    utm_campaign: utmParams.utm_campaign,
    utm_medium: utmParams.utm_medium,
    device_type: deviceInfo.deviceType,
    browser_type: deviceInfo.browserType,
    operating_system: deviceInfo.operatingSystem,
    page_url: window.location.href,
    social_media_profiles: [],
    time_spent: 0,
    form_interactions: [],
    click_events: [],
    scroll_depth: 0,
    js_errors: [],
    heatmap_data: {},
    total_sessions: isReturningVisitor ? 0 : 1,
    unique_visitors: isReturningVisitor ? 0 : 1,
    returning_visitors: isReturningVisitor ? 1 : 0,
    new_visitors: isReturningVisitor ? 0 : 1,
    session_duration: 0,
    time_on_page: 0,
    page_views: 1,
    session_recording: [],
    form_analyses: [],
    funnel_analyses: [],
    ecommerce_metrics: {
      productViews: 0,
      cartAdditions: 0,
      purchaseCompletions: 0,
    },
    device_info: deviceInfo,
    startTime: 0,
    mouseMovements: [],
  };

  if (!isReturningVisitor) {
    localStorage.setItem("sessionId", trafficData.sessionId);
  }
}

// Ensure sessionData is initialized
if (!trafficData) {
  initializeSessionData();
}

// Event listener for page load
window.addEventListener("load", () => {
  if (trafficData) {
    trafficData.page_views++;
    currentPageStartTime = Date.now();
  }
});

// Event listener for clicks
document.addEventListener("click", (event) => {
  if (trafficData) {
    trafficData.click_events.push({
      sessionId:trafficData.sessionId,
      element: (event.target as HTMLElement).tagName,
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    });
  }
});

// Event listener for form submissions
document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (trafficData) {
      const formId = (event.target as HTMLFormElement).id || "unknown";
      let formInteraction = trafficData.form_interactions.find(
        (fi) => fi.formId === formId
      );
      if (!formInteraction) {
        formInteraction = {
          formId: formId,
          fieldInteractions: [],
          submitted: false,
        };
        trafficData.form_interactions.push(formInteraction);
      }
      formInteraction.submitted = true;
    }
  });

  form.addEventListener(
    "focus",
    (event) => {
      if (trafficData) {
        const formId = (event.target as HTMLFormElement).id || "unknown";
        let formInteraction = trafficData.form_interactions.find(
          (fi) => fi.formId === formId
        );
        if (!formInteraction) {
          formInteraction = {
            formId: formId,
            fieldInteractions: [],
            submitted: false,
          };
          trafficData.form_interactions.push(formInteraction);
        }
        formInteraction.fieldInteractions.push({
          fieldName: (event.target as HTMLInputElement).name,
          timestamp: Date.now(),
        });
      }
    },
    true
  );
});

// Scroll depth calculation
window.addEventListener("scroll", function () {
  if (trafficData) {
    let scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    let scrollPosition = window.scrollY || document.documentElement.scrollTop;
    trafficData.scroll_depth = Math.max(
      trafficData.scroll_depth,
      (scrollPosition / scrollHeight) * 100
    );
  }
});

// Function to update session duration and time on page
function updateSessionMetrics() {
  if (trafficData) {
    const now = Date.now();
    trafficData.session_duration = (now - trafficData.startTime) / 1000; // duration in seconds
    trafficData.time_on_page = (now - currentPageStartTime) / 1000;
  }
}

// Send data to the server periodically
setInterval(() => {
  updateSessionMetrics();
  if (trafficData) {
    // send session data
    sendSessionData({
      siteId: siteId,
      deviceId: deviceId,
      sessionId: trafficData.sessionId,
      device_Info: trafficData.device_info,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    sendClickData(trafficData.click_events);

    sendPageViewData([
      {
        sessionId: trafficData.sessionId,
        url: trafficData.page_url,
        referrer: trafficData.source,
        created_at: new Date().toISOString(),
      },
    ]);

    // Clear mouse movements to avoid excessive data
    trafficData.mouseMovements = [];
  }
}, 7000);

// Capture heat map data (mouse movements)
document.addEventListener("mousemove", (event) => {
  if (trafficData) {
    trafficData.mouseMovements.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    });
  }
});

// Update session duration before the user leaves the page
window.addEventListener("beforeunload", () => {
  updateSessionMetrics();
});

// an helper function
async function sendData(url: string, data: any): Promise<any> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trafficData: data,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status:${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
}

// send session data
async function sendSessionData(trafficData: any) {
  const sessionData = {
    siteid: trafficData.site_id,
    deviceId: trafficData,
    sessionId: trafficData.sessionId,
    createdAt: new Date().toISOString(),
    deviceInfo: trafficData.device_info,
  };

  try {
    await sendData(sessionUrl, sessionData);
    console.log("Session data sent successfully");
  } catch (error) {
    console.error("Error sending session data:", error);
  }
}

async function sendClickData(clicks: ClickEvent[]) {
  // let trafficData:TrafficData | null = null
  try {
    if (!trafficData) {
      throw new Error("Traffic data is not initialized.");
    }

    await Promise.all(
      clicks.map(async (click) => {
        const clickData = {
          session_id: click.sessionId, // Get sessionId from trafficData
          coord: { x: click.x, y: click.y },
          timestamp: click.timestamp,
        };

        await sendData(
          clickEventUrl,
          clickData
        );
      })
    );
    console.log("Click data sent successfully");
  } catch (error) {
    console.error("Error sending click data:", error);
  }
}



async function sendPageViewData(pageViews: any[]) {
  try {
    await Promise.all(
      pageViews.map(async (pageView) => {
        const pageViewData = {
          session_id: pageView.sessionId,
          url: pageView.url,
          referrer: pageView.referrer,
          created_at: pageView.created_at,
          updated_at: new Date().toISOString(),
        };

        await sendData(
          pageViewURl,
          pageViewData
        );
      })
    );
    console.log("Page view data sent successfully");
  } catch (error) {
    console.error("Error sending page view data:", error);
  }
}

async function sendSessionEventData(events: any[]) {
  try {
    await Promise.all(
      events.map(async (event) => {
        const eventData = {
          session_id: event.sessionId,
          event_type: event.event_type,
          target: event.target,
          timestamp: event.timestamp,
          value: event.value || null,
          x: event.x || null,
          y: event.y || null,
        };

        await sendData(
          sessionEventUrl,
          eventData
        );
      })
    );
    console.log("Session event data sent successfully");
  } catch (error) {
    console.error("Error sending session event data:", error);
  }
}

// Display metrics for debugging
function displayMetrics() {
  if (trafficData) {
    console.log("Session Data:", trafficData);
  }
}

// Periodically display metrics for debugging
setInterval(displayMetrics, 10000);
