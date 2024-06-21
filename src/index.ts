import { v4 as uuidv4 } from "uuid";
interface TrafficData {
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
  // funnel_steps:FunnelStep[]
  ecommerce_metrics: EcommerceMetrics;
  // ecommerce_metrics: EcommerceEvent[];
  content_performance?: ContentPerformance;
  technical_measurment?: TechnicalMeasurements;
  seo_performance?: SEOPerformance;
  device_info: DeviceInfo;
}

interface DeviceInfo {
  device_model: string;
  os: string;
  userAgent: string;
}

interface FormInteraction {
  form_id: string;
  fields: string[];
  time_spent: number;
  submission_status: boolean;
  value?: any;
}

interface ClickEvent {
  element: string;
  id: string;
  class: string;
  time: string;
  x?: number;
  y?: number;
}

interface JsError {
  message: string;
  source: String;
  lineno: number;
  colno: number;
  time: string;
}

interface HeatmapData {
  [key: string]: number;
}

interface FormAnalysis {
  form_id: string;
  completion_rate: number;
  abandonment_rate: number;
}

interface FunnelAnalysis {
  stage: string;
  completion_rate: number;
}

interface EcommerceMetrics {
  product_views: number;
  cart_additions: number;
  purchase_completions: number;
}

interface EcommerceEvent {
  event: string;
  data: Record<string, any>;
  timestamp: number;
}

interface FunnelStep {
  step: string;
  timestamp: number;
}
interface ContentPerformance {
  page_views_by_content_type: Record<string, number>;
  time_spent_on_content: Record<string, number>;
  scroll_depth: Record<string, number>;
  content_shares: Record<string, number>;
}

interface TechnicalMeasurements {
  page_load_time: number;
  error_tracking: JsError[];
  broken_links: string[];
  website_speed: number;
}

interface SEOPerformance {
  organic_traffic: number;
  keyword_ranking: Record<string, number>;
  landing_page_performance: Record<string, number>;
}

document.addEventListener("DOMContentLoaded", function () {
  const sessionId = uuidv4();
  const siteId = uuidv4();

  function getDeviceId() {
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("device_id", deviceId);
    }
    return deviceId;
  }

  const deviceId = getDeviceId()

  function updateSession(){
    const sessionData = {
      site_id: siteId,
      device_id: deviceId,
      session_id: sessionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      device_info: trafficData.device_info,
    };

    sendData("http://localhost:8000/api/tracker/sessions", sessionData);
  }

  fetch(`http://localhost:8000/api/tracker/sessions/${deviceId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Session not found");
      }
      // Update the existing session document
      updateSession();
    })
    .catch(() => {
      // Create a new session document
      updateSession();
    });

  // Function to parse the query string
  function getQueryStringParams(query: string): Record<string, string> {
    return query
      ? (/^[?#]/.test(query) ? query.slice(1) : query)
          .split("&")
          .reduce((params: Record<string, string>, param: string) => {
            let [key, value] = param.split("=");
            params[key] = value
              ? decodeURIComponent(value.replace(/\+/g, " "))
              : "";
            return params;
          }, {})
      : {};
  }

  function detectDeviceType(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return "tablet";
    } else if (/mobile|iphone|ipod|iemobile|blackberry|android/i.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }

  let source = "Direct";
  let referrer = document.referrer;
  console.log("referrer:", referrer);

  const urlParams = getQueryStringParams(window.location.search);
  const utmSource = urlParams.utm_source || "not set";
  const utmCampaign = urlParams.utm_campaign || "not set";
  const utmMedium = urlParams.utm_medium || "not set";

  // Detect device type
  const deviceType = detectDeviceType();

  // Browser type and version
  const browserName =
    navigator.userAgent.match(
      /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
    ) || [];

  let browserType: string;

  if (/trident/i.test(browserName[1])) {
    browserType =
      "IE " + (/\brv[ :]+(\d+)/g.exec(navigator.userAgent) || [])[1];
  } else if (browserName[1] === "Chrome") {
    let temp = navigator.userAgent.match(/\b(OPR|Edge)\/(\d+)/);
    if (temp != null)
      browserType = temp.slice(1).join(" ").replace("OPR", "Opera");
    else browserType = browserName.join(" ");
  } else browserType = browserName.join(" ");

  // Operating system
  const os = navigator.platform;

  if (referrer) {
    const a = document.createElement("a");
    a.href = referrer;
    const referrerHostname = a.hostname;
    if (
      referrerHostname.indexOf("google") > -1 ||
      referrerHostname.indexOf("bing") > -1 ||
      referrerHostname.indexOf("yahoo") > -1 ||
      referrerHostname.indexOf("duckduckgo") > -1
    )
      source = "Organic Search";
    // add more serach engine
    // simplify the logic (exit early in the code)
    else if (
      referrerHostname.indexOf("facebook") > -1 ||
      referrerHostname.indexOf("twitter") > -1 ||
      referrerHostname.indexOf("instagram") > -1 ||
      referrerHostname.indexOf("linkedin") > -1 ||
      referrerHostname.indexOf("pinterest") > -1
      // capture more social media domains
    )
      source = "Social Media";
    else source = "Referral (" + referrerHostname + ")";
  }

  // Prepare data to be sent
  const trafficData: TrafficData = {
    source: source,
    utm_source: utmSource,
    utm_campaign: utmCampaign,
    utm_medium: utmMedium,
    device_type: deviceType,
    browser_type: browserType,
    operating_system: os,
    // geographic_location will be determined server-side based on IP address
    page_url: window.location.href,
    social_media_profiles: [],
    time_spent: 0,
    form_interactions: [],
    click_events: [],
    scroll_depth: 0,
    js_errors: [],
    heatmap_data: {},
    total_sessions: 0,
    unique_visitors: 0,
    returning_visitors: 0,
    new_visitors: 0,
    session_duration: 0,
    time_on_page: 0,
    page_views: 0,
    session_recording: [],
    form_analyses: [],
    funnel_analyses: [],
    // funnel_steps: [],
    ecommerce_metrics: {
      product_views: 0,
      cart_additions: 0,
      purchase_completions: 0,
    },
    // ecommerce_metrics: [],
    content_performance: {
      page_views_by_content_type: {},
      time_spent_on_content: {},
      scroll_depth: {},
      content_shares: {},
    },
    technical_measurment: {
      page_load_time: 0,
      error_tracking: [],
      broken_links: [],
      website_speed: 0,
    },
    seo_performance: {
      organic_traffic: 0,
      keyword_ranking: {},
      landing_page_performance: {},
    },
    device_info: {
      device_model: detectDeviceType(),
      os: navigator.platform,
      userAgent: navigator.userAgent,
    },
  };

  // Extended Features starts here

  // Social Media Profiles (LinkedIn and Facebook)
  if (navigator.userAgent.indexOf("LinkedIn") !== -1) {
    trafficData.social_media_profiles.push("LinkedIn");
  }
  if (
    navigator.userAgent.indexOf("FBAN") !== -1 ||
    navigator.userAgent.indexOf("FBAV") !== -1
  ) {
    trafficData.social_media_profiles.push("Facebook");
  }

  // Form interaction
  document.querySelectorAll("form").forEach(function (form) {
    let formData: FormInteraction = {
      form_id: form.id,
      fields: [],
      time_spent: 0,
      submission_status: false,
    };

    let formStartTime: number | null = null;

    form.addEventListener(
      "focus",
      function () {
        formStartTime = Date.now();
      },
      true
    );

    form.addEventListener("blur", function (event: FocusEvent) {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        formData.fields.push(target.name);
      }
    });

    form.addEventListener("submit", function () {
      if (formStartTime !== null) {
        formData.time_spent = (Date.now() - formStartTime) / 1000;
      }
      formData.submission_status = true;
      trafficData.form_interactions.push(formData);
    });
  });

  // Clicks events
  document.addEventListener("click", function (event: MouseEvent) {
    // trafficData.click_events.push({
    //   element: (event.target as HTMLElement).tagName,
    //   id: (event.target as HTMLElement).id,
    //   class: (event.target as HTMLElement).className,
    //   time: new Date().toISOString(),
    // });

    trafficData.click_events.forEach((clickEvent) => {
      const clickData = {
        session_id: sessionId,
        coord: `${clickEvent.x},${clickEvent.y}`,
        timestamp: clickEvent.time,
      };
      sendData("http://localhost:8000/api/tracker/clicks-and-heatmap", clickData);
    });
  });

  // Scroll depth
  window.addEventListener("scroll", function () {
    let scrollHeight =
      document.documentElement.scrollHeight - this.window.innerHeight;
    let scrollPosition =
      window.scrollY || this.document.documentElement.scrollTop;
    trafficData.scroll_depth = Math.max(
      trafficData.scroll_depth,
      (scrollPosition / scrollHeight) * 100
    );
  });

  // Javascript Errors
  window.addEventListener("error", function (event: ErrorEvent) {
    trafficData.js_errors.push({
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      time: new Date().toISOString(),
    });
  });

  // Heatmap Data
  document.addEventListener("click", function (event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;
    const key = `${x},${y}`;
    if (!trafficData.heatmap_data[key]) {
      trafficData.heatmap_data[key] = 0;
    }

    trafficData.heatmap_data[key]++;
  });

  // Total sessions, unique visitors, returning visitors, new visitors
  function manageSessionData() {
    const sessionKey = "user_Session";
    const session = sessionStorage.getItem(sessionKey);
    const uniqueKey = "unique_visitors";
    const returningKey = "returning_visitors";

    if (!session) {
      sessionStorage.setItem(sessionKey, "active");
      trafficData.total_sessions++;
      const uniqueVisitors = localStorage.getItem(sessionKey);

      if (uniqueVisitors) {
        localStorage.setItem(
          uniqueKey,
          (parseInt(uniqueVisitors) + 1).toString()
        );
      } else {
        localStorage.setItem(uniqueKey, "1");
      }

      trafficData.unique_visitors++;
    } else {
      trafficData.returning_visitors++;
    }
  }

  manageSessionData();

  // Session Duration and TIme on Page
  function updateSessionTime() {
    const sessionStartKey = "session_Start";
    const sessionStart = sessionStorage.getItem(sessionStartKey);

    if (!sessionStart) {
      sessionStorage.setItem(sessionStartKey, Date.now().toString());
    } else {
      const duration = (Date.now() - parseInt(sessionStart)) / 1000;
      trafficData.session_duration = duration;
      trafficData.time_on_page = duration;
    }
  }

  // Session Duration (every 5-10 secs)
  // should update both page view and the session
  setInterval(updateSessionTime, 5000);

  // Page Views
  // session id and the page url and the reffer (create a table for it)
  // log the page view
  trafficData.page_views++;

  // Form Analyses
  document.querySelectorAll("form").forEach(function (form) {
    const formAnalysis: FormAnalysis = {
      form_id: form.id,
      completion_rate: 0,
      abandonment_rate: 0,
    };

    form.addEventListener("submit", function () {
      formAnalysis.completion_rate++;
      trafficData.form_analyses.push(formAnalysis);
    });

    form.addEventListener("reset", function () {
      formAnalysis.abandonment_rate++;
      trafficData.form_analyses.push(formAnalysis);
    });
  });

  // Conversion Tracking: Funnel Analysis
  const funnelStages = ["Cart", "Billing", "Payment"];
  const stageCounts: Record<string, number> = {};
  let prevStage: string | null = null;

  funnelStages.forEach((stage, index) => {
    const completion_rate =
      index === 0
        ? 1
        : stageCounts[stage] / stageCounts[funnelStages[index - 1]];
    trafficData.funnel_analyses.push({
      stage: stage,
      completion_rate: completion_rate,
    });

    prevStage = stage;
  });

  // Conversion Tracking: Ecommerce tracking
  trafficData.ecommerce_metrics = {
    product_views: 0,
    cart_additions: 0,
    purchase_completions: 0,
  };

  document.querySelectorAll(".product-view").forEach(function (product) {
    product.addEventListener("click", function () {
      trafficData.ecommerce_metrics.product_views++;
    });
  });

  document.querySelectorAll(".add-to-cart").forEach(function (button) {
    button.addEventListener("click", function () {
      trafficData.ecommerce_metrics.cart_additions++;
    });
  });

  document.querySelectorAll(".complete-purchase").forEach(function (button) {
    button.addEventListener("click", function () {
      trafficData.ecommerce_metrics.purchase_completions++;
    });
  });

  // Extended features ends here
  /****************************************/

  // Function to get the country name from the coordinates
  function getCountryName(lat: number, lon: number): void {
    const apiKey = "xekhai";
    const url = `http://api.geonames.org/countryCodeJSON?lat=${lat}&lng=${lon}&username=${apiKey}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Add the country name to the traffic data
        trafficData.geographic_location = data.countryName;
        // Send data to your server-side endpoint
        sendData(
          "https://growthapp-backend-c991.onrender.com/api/data/track-traffic",
          trafficData
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function getPageURL() {
    // Add the page URL to the traffic data
    trafficData.page_url = window.location.href;
  }
  getPageURL();

  // send session data
  const sessionData = {
    id: sessionId,
    site_id: siteId,
    device_id: getDeviceId(),
    session_id: sessionId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    device_info: trafficData.device_info,
  };
  sendData("http://localhost:8000/api/tracker/sessions", sessionData);

  // Send page view data
  const pageViewData = {
    session_id: sessionId,
    url: trafficData.page_url,
    referrer: document.referrer,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  sendData("http://localhost:8000/api/tracker/page-views", pageViewData);

  // Send session event data
  trafficData.form_interactions.forEach((formInteraction) => {
    const sessionEventData = {
      session_id: sessionId,
      event_type: "input",
      target: formInteraction.fields.join(","),
      timestamp: new Date().toISOString(),
      value: formInteraction.value || null,
      x: null,
      y: null,
    };
    sendData(
      "http://localhost:8000/api/tracker//session-events",
      sessionEventData
    );
  });

  // Function to send data to your server-side endpoint
  // function sendData() {
  //   let userId: string | null = null;
  //   fetch(
  //     "https://growthapp-backend-c991.onrender.com/api/data/track-traffic",
  //     // "http://localhost:3000/api/data/track-traffic",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         userId: userId,
  //         trackingData: {
  //           trafficData,
  //         },
  //       }),
  //     }
  //   )
  //     .then((response) => response.json())
  //     .then((data) => console.log("Success:", data))
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // }

  function sendData(url: string, data: any): void {
    let userId: string | null = null;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        trackingData: {
          trafficData: data,
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Check if Geolocation is supported
  // if (navigator.geolocation) {
  //   // If supported, run the getCurrentPosition() method
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       // If successful, get the latitude and longitude of the user's device
  //       const lat = position.coords.latitude;
  //       const lon = position.coords.longitude;
  //       // Call the getCountryName() function with the coordinates
  //       getCountryName(lat, lon);
  //     },
  //     (error) => {
  //       // If not successful, display an error message
  //       console.error("Error:", error.message);
  //       // Send data without the geographic location
  //       sendData();
  //     }
  //   );
  // } else {
  //   // If not supported, display a message to the user
  //   console.log("Geolocation is not supported by this browser.");
  //   // Send data without the geographic location
  //   sendData();
  // }
});
