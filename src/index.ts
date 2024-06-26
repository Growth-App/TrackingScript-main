import { v4 as uuidv4 } from "uuid";
import {
  type ClickEvent,
  type DeviceInfo,
  type SessionData,
} from "./types";

const sessionUrl = process.env.SESSION_DATA_URL!
const sessionEventUrl = process.env.SESSION_EVENT_URL!
const pageViewURl = process.env.PAGE_VIEW_URL!

console.log(sessionUrl)

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

function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_medium: params.get("utm_medium") || "",
  };
}

function initSession(siteId: string, deviceId: string): SessionData {
  const storedSessionId = localStorage.getItem("sessionId");
  const isReturningVisitor = !!storedSessionId;
  const utmParams = getUTMParams();
  const deviceInfo = getDeviceInfo();

  const sessionData: SessionData = {
    site_id: siteId,
    device_id: deviceId,
    sessionId: storedSessionId || getSiteId(),
    source: document.referrer,
    utm_source: utmParams.utm_source,
    utm_campaign: utmParams.utm_campaign,
    utm_medium: utmParams.utm_medium,
    device_type: deviceInfo.deviceType,
    browser_type: deviceInfo.browserType,
    operating_system: deviceInfo.operatingSystem,
    page_url: window.location.href,
    form_interactions: [],
    click_events: [],
    scroll_depth: 0,
    js_errors: [],
    broken_links: [],
    new_visitor: !isReturningVisitor,
    device_info: deviceInfo,
    start_time: 0,
    mouse_movements: [],
  };

  if (!isReturningVisitor) {
    localStorage.setItem("sessionId", sessionData.sessionId);
  }

  return sessionData;
}

async function sendData(url: string, data: any): Promise<any> {
  try {
    console.log("Sending data to url:", url)
    console.log("Payload:", JSON.stringify(data, null,2))
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
    console.log(response.status)
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
}

async function sendSessionData(sessionData: SessionData) {
  const data = {
    siteId: sessionData.site_id,
    deviceId: sessionData.device_id,
    sessionId: sessionData.sessionId,
    createdAt: new Date().toISOString(),
    deviceInfo: sessionData.device_info,
    scrollDepth: sessionData.scroll_depth,
  };

  try {
    await sendData(sessionUrl, data);
    // console.log("Session data sent successfully");
  } catch (error) {
    console.error("Error sending session data:", error);
  }
}

async function sendPageViewData(sessionData: SessionData) {
  try {
    const pageViewData = {
      sessionId: sessionData.sessionId,
      url: sessionData.page_url,
      referrer: sessionData.source,
    };

    await sendData(pageViewURl, pageViewData);

    // console.log("Page view data sent successfully");
  } catch (error) {
    console.error("Error sending page view data:", error);
  }
}

async function sendSessionEvents(sessionData: SessionData) {
  try {
    const payload = {
      sessionId: sessionData.sessionId,
      clicks: sessionData.click_events,
      mouseMovements: sessionData.mouse_movements,
    };

    await sendData(sessionEventUrl, payload);
    // console.log("Session events data sent successfully");
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
    const clickEvent: ClickEvent = {
      sessionId: sessionData.sessionId,
      element: (event.target as HTMLElement).tagName,
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    }

    sessionData.click_events.push(clickEvent);
  });

  // Record mouse movements
  document.addEventListener("mousemove", (event) => {
    sessionData.mouse_movements.push({
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
      let formInteraction = sessionData.form_interactions.find(({ form_id: formId }) => formId == formId);

      if (!formInteraction) {
        formInteraction = {
          form_id: formId,
          field_interactions: [],
          submitted: true,
        };
      }

      formInteraction.submitted = true;
      sessionData.form_interactions.push(formInteraction);
    });

    // Record form field interactions
    form.addEventListener("focus", (event) => {
      const formId = (event.target as HTMLFormElement).id || "unknown";
      let formInteraction = sessionData.form_interactions.find(({ form_id: formId }) => formId == formId);

      if (!formInteraction) {
        formInteraction = {
          form_id: formId,
          field_interactions: [],
          submitted: false,
        };

        sessionData.form_interactions.push(formInteraction);
      }

      formInteraction.field_interactions.push({
        field_name: (event.target as HTMLInputElement).name,
        timestamp: Date.now(),
      });
    }, true);
  });

  sendPageViewData(sessionData);
  setInterval(() => {
    sendSessionData(sessionData);
    sendSessionEvents(sessionData);
  }, 10000);

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
  window.startGrowthAppTracker();
}
