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
}

interface FormInteraction {
  form_id: string;
  fields: string[];
  time_spent: number;
  submission_status: boolean;
}

interface ClickEvent {
  element: string;
  id: string;
  class: string;
  time: string;
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

document.addEventListener("DOMContentLoaded", function () {
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
    if (referrerHostname.indexOf("google") > -1) source = "Organic Search";
    else if (
      referrerHostname.indexOf("facebook") > -1 ||
      referrerHostname.indexOf("twitter") > -1
    )
      source = "Social Media";
    else source = "Referral (" + referrerHostname + ")";
  }

  // Prepare data to be sent
  const trafficData: TrafficData = {
    source,
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

  // Time Spent on the site
  let startTime = Date.now();
  window.addEventListener("beforeunload", function () {
    trafficData.time_spent = (Date.now() - startTime) / 1000;
    sendData();
  });

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
    trafficData.click_events.push({
      element: (event.target as HTMLElement).tagName,
      id: (event.target as HTMLElement).id,
      class: (event.target as HTMLElement).className,
      time: new Date().toISOString(),
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
    let x = event.clientX;
    let y = event.clientY;
    let key = `${x},${y}`;
    if (!trafficData.heatmap_data[key]) {
      trafficData.heatmap_data[key] = 0;
    }

    trafficData.heatmap_data[key]++;
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
        sendData();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  //     // Function to get the country and city from IP address using Geolocator
  //   function getCountryAndCity() {
  //     // Use geolocator.locateByIP to get location information
  //     geolocator.locateByIP()
  //       .then((location) => {
  //         // Extract country and city information from the location data
  //         const country = location.address.country || "Unknown";
  //         const city = location.address.city || "Unknown";
  //         // Add the country and city to the traffic data
  //         trafficData.geographic_location = ${city}, ${country};
  //         // Send data to your server-side endpoint
  //         sendData();
  //       })
  //       .catch((error) => {
  //         console.error("Error:", error);
  //         // Send data without the geographic location
  //         sendData();
  //       });
  //   }
  //   getCountryAndCity();
  // Function to get the page URL
  function getPageURL() {
    // Add the page URL to the traffic data
    trafficData.page_url = window.location.href;
  }
  getPageURL();

  // Function to send data to your server-side endpoint
  function sendData() {
    let userId: string | null = null;
    fetch(
      "https://growthapp-backend-c991.onrender.com/api/data/track-traffic",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          trackingData: {
            trafficData,
          },
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Check if Geolocation is supported
  if (navigator.geolocation) {
    // If supported, run the getCurrentPosition() method
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // If successful, get the latitude and longitude of the user's device
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // Call the getCountryName() function with the coordinates
        getCountryName(lat, lon);
      },
      (error) => {
        // If not successful, display an error message
        console.error("Error:", error.message);
        // Send data without the geographic location
        sendData();
      }
    );
  } else {
    // If not supported, display a message to the user
    console.log("Geolocation is not supported by this browser.");
    // Send data without the geographic location
    sendData();
  }
});
