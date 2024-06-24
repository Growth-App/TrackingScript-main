import { v4 as uuidv4 } from "uuid";
import {
  type ClickEvent,
  type DeviceInfo,
  type SessionData,
} from "./types";

const sessionUrl = process.env.SESSION_DATA_URL!
const sessionEventUrl = process.env.SESSION_EVENT_URL!
const clickEventUrl = process.env.CLICK_EVENT_URL!
const pageViewURl = process.env.PAGE_VIEW_URL!

function getSiteId(): string {
  return window?.GROWTH_APP_SITE_ID || Math.random().toString(36).substring(2, 15);
}

function getDeviceId() {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}

// Helper function to get device info
function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator?.platform || navigator?.userAgentData?.platform || "";
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


// Initialize session data if not already present
function initSession(siteId: string, deviceId: string): SessionData {
  const storedSessionId = localStorage.getItem("sessionId");
  const isReturningVisitor = !!storedSessionId;
  const utmParams = getUTMParams();
  const deviceInfo = getDeviceInfo();

  const sessionData: SessionData = {
    siteId,
    deviceId,
    sessionId: storedSessionId || getSiteId(),
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
    localStorage.setItem("sessionId", sessionData.sessionId);
  }

  return sessionData;
}

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

async function sendSessionData(sessionData: SessionData) {
  const data = {
    siteid: sessionData.siteId,
    deviceId: sessionData.deviceId,
    sessionId: sessionData.sessionId,
    createdAt: new Date().toISOString(),
    deviceInfo: sessionData.device_info,
  };

  try {
    await sendData(sessionUrl, data);
    console.log("Session data sent successfully");
  } catch (error) {
    console.error("Error sending session data:", error);
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

async function sendClickEvents(sessionData: SessionData) {
  try {
    // TODO: Inlcude session id in the payload
    await sendData(sessionEventUrl, sessionData.click_events)
    console.log("Session event data sent successfully");
  } catch (error) {
    console.error("Error sending session event data:", error);
  }
}

function startGrowthAppTracker() {
  const deviceId = getDeviceId();
  const siteId = getSiteId();
  const sessionData = initSession(siteId, deviceId);

  // Record clicks
  document.addEventListener("click", (event) => {
    sessionData.click_events.push({
      sessionId: sessionData.sessionId,
      element: (event.target as HTMLElement).tagName,
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    });
  });

  // Record mouse movements
  document.addEventListener("mousemove", (event) => {
    sessionData.mouseMovements.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    });
  });

  // Record scroll depth
  window.addEventListener("scroll", function () {
    let scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    let scrollPosition = window.scrollY || document.documentElement.scrollTop;
    sessionData.scroll_depth = Math.max(sessionData.scroll_depth, (scrollPosition / scrollHeight) * 100);
  });

  // Record form interactions
  document.querySelectorAll("form").forEach((form) => {
    // Record form submissions
    form.addEventListener("submit", (event) => {
      const formId = (event.target as HTMLFormElement).id || "unknown";
      let formInteraction = sessionData.form_interactions.find(({ formId }) => formId == formId);

      if (!formInteraction) {
        formInteraction = {
          formId: formId,
          fieldInteractions: [],
          submitted: true,
        };
      }

      formInteraction.submitted = true;
      sessionData.form_interactions.push(formInteraction);
    });

    // Record form field interactions
    form.addEventListener("focus", (event) => {
      const formId = (event.target as HTMLFormElement).id || "unknown";
      let formInteraction = sessionData.form_interactions.find(({ formId }) => formId == formId);

      if (!formInteraction) {
        formInteraction = {
          formId: formId,
          fieldInteractions: [],
          submitted: false,
        };

        sessionData.form_interactions.push(formInteraction);
      }

      formInteraction.fieldInteractions.push({
        fieldName: (event.target as HTMLInputElement).name,
        timestamp: Date.now(),
      });
    }, true);
  });

  // For debugging
  if (!process.env.NODE_ENV?.includes("prod")) {
    setInterval(() => console.log({ sessionData }), 10000);
  }
}

window.startGrowthAppTracker = startGrowthAppTracker;

// Initialize WP plugin
if (growth_app_args?.WP) {
  window.WP = true
  window.GROWTH_APP_SITE_ID = growth_app_args.GROWTH_APP_SITE_ID;

  startGrowthAppTracker()
}