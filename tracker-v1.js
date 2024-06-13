const referralSource = document.referrer;
function getParameterByName(e, t) {
  t || (t = window.location.href), (e = e.replace(/[\[\]]/g, "\\$&"));
  let r = RegExp("[?&]" + e + "(=([^&#]*)|&|#|$)"),
    a = r.exec(t);
  return a ? (a[2] ? decodeURIComponent(a[2].replace(/\+/g, " ")) : "") : null;
}
const searchQuery = getParameterByName("q", referralSource),
  urlParams = new URLSearchParams(referralSource),
  searchEngine = urlParams.get("utm_source");
let paidKeywords;
"google" === searchEngine && (paidKeywords = urlParams.get("utm_term"));
const isDirectTraffic =
    "" === referralSource || referralSource.startsWith(window.location.origin),
  referrer = referralSource.toLowerCase();
function getURLParameters(e) {
  let t = e.split("?");
  if (t?.length === 1) return {};
  let r = t[1],
    a = {},
    n = r.split("&");
  return (
    n.forEach((e) => {
      let [t, r] = e.split("=");
      a[t] = decodeURIComponent(r);
    }),
    a
  );
}
referrer.includes("facebook.com") ||
  referrer.includes("x.com") ||
  referrer.includes("instagram.com");
const currentURL = window.location.href,
  campaignParameters = getURLParameters(currentURL),
  utmSource = campaignParameters.utm_source,
  utmMedium = campaignParameters.utm_medium,
  utmCampaign = campaignParameters.utm_campaign,
  utmTerm = campaignParameters.utm_term,
  utmContent = campaignParameters.utm_content;
let timeSpentSeconds = 0;
function getCurrentTime() {
  return new Date().getTime();
}
var startTime = getCurrentTime();
function calculateTimeSpent() {
  return (timeSpentSeconds = Math.floor((getCurrentTime() - startTime) / 1e3));
}
function logTimeSpent() {
  timeSpentSeconds = calculateTimeSpent();
}
let deadClickCount = 0,
  deadClicksArray = [];
function trackDeadClicks(e) {
  let t = "a" === e.target.tagName.toLowerCase(),
    r = e.target.closest("[data-action]");
  if (!t && !r) {
    deadClickCount++;
    let a = {
      tagName: e.target.tagName,
      classes: e.target.className,
      id: e.target.id,
      innerHTML: e.target.innerHTML.slice(0, 200),
    };
    deadClicksArray.push(a);
  }
}
document.body.addEventListener("click", trackDeadClicks);
let scrollDepthPercentage = 0,
  lastScrollTop = 0;
const throttleTime = 100,
  dynamicThresholdPercentage = 0.1;
let excessiveScrollArray = [];
function throttle(e, t) {
  let r = null;
  return function () {
    r ||
      (r = setTimeout(() => {
        (r = null), e.call(this, ...arguments);
      }, t));
  };
}
function handleScrollEvents() {
  let e = window.pageYOffset || document.documentElement.scrollTop,
    t = window.innerHeight,
    r = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    ),
    a = +((e / (r - t)) * 100).toFixed(2);
  scrollDepthPercentage = Math.max(scrollDepthPercentage, a);
  let n = e > lastScrollTop ? "down" : "up",
    i = Math.abs(e - lastScrollTop);
  i > 0.1 * r &&
    excessiveScrollArray.push({ scrollDistance: i, scrollDirection: n }),
    (lastScrollTop = e);
}
window.addEventListener("scroll", throttle(handleScrollEvents, 100));
const rageClickThreshold = 5;
let clickCount = 0,
  lastClickTime = 0,
  rageClicks = [];
document.addEventListener("click", function (e) {
  let t = new Date().getTime(),
    r = t - lastClickTime;
  if (
    (r <= 1e3 ? clickCount++ : (clickCount = 1),
    (lastClickTime = t),
    clickCount >= 5)
  ) {
    let a = e.target;
    rageClicks.push({
      tagName: a.tagName.toLowerCase(),
      classes: a.className,
      id: a.id,
      innerHTML: a.innerHTML.slice(0, 200),
    });
  }
});
let errors = [];
function handleError(e) {
  errors.push({
    message: e.message ? e.message : "Unknown error",
    filename: e.filename ? e.filename : "Unknown filename",
    lineno: e.lineno ? e.lineno : "Unknown line number",
    colno: e.colno ? e.colno : "Unknown column number",
    error: e.error ? e.error.toString() : "Error object not available",
  }),
    console.log(errors);
}
window.addEventListener("error", handleError);
let sessionCount = localStorage.getItem("sessionCount");
(sessionCount = sessionCount ? parseInt(sessionCount) + 1 : 1),
  localStorage.setItem("sessionCount", sessionCount);
const clickEvents = [];
function trackClickOrTap(e) {
  let t = e.target,
    r = {
      tagName: t.tagName.toLowerCase(),
      classes: t.className,
      id: t.id,
      innerHTML: t.innerHTML.slice(0, 200),
    };
  clickEvents.push(r);
}
function logClickEvents() {}
document.addEventListener("click", trackClickOrTap),
  document.addEventListener("touchstart", trackClickOrTap),
  logClickEvents();
let pageViewsData = [];
function trackPageViews() {
  let e = window.location.pathname,
    t = localStorage.getItem(e);
  t
    ? ((t = parseInt(t) + 1), localStorage.setItem(e, t.toString()))
    : localStorage.setItem(e, "1"),
    pageViewsData.push({ page: e, views: localStorage.getItem(e) });
}
trackPageViews();
let navigationPaths = [];
function trackNavigationPaths() {
  navigationPaths.push(window.location.href),
    console.log("Navigation path:", navigationPaths.join(" > "));
}
trackNavigationPaths();
let timeToFirstByte = null;
function trackTTFB() {
  if (window.performance && "getEntriesByType" in performance) {
    let e = performance.getEntriesByType("navigation");
    if (e.length > 0) {
      let t = e[0];
      timeToFirstByte = t.responseStart - t.startTime;
    }
  }
}
window.addEventListener("load", trackTTFB);
let trafficData = {};
function trackUserTraffic() {
  let e = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  return (
    (trafficData.device_type = e ? "Mobile" : "Desktop"),
    -1 !== navigator.userAgent.indexOf("Firefox")
      ? (trafficData.browser_type = "Firefox")
      : -1 !== navigator.userAgent.indexOf("SamsungBrowser")
      ? (trafficData.browser_type = "Samsung Internet")
      : -1 !== navigator.userAgent.indexOf("Opera") ||
        -1 !== navigator.userAgent.indexOf("OPR")
      ? (trafficData.browser_type = "Opera")
      : -1 !== navigator.userAgent.indexOf("Trident")
      ? (trafficData.browser_type = "Internet Explorer")
      : -1 !== navigator.userAgent.indexOf("Edge")
      ? (trafficData.browser_type = "Edge")
      : -1 !== navigator.userAgent.indexOf("Chrome")
      ? (trafficData.browser_type = "Chrome")
      : -1 !== navigator.userAgent.indexOf("Safari")
      ? (trafficData.browser_type = "Safari")
      : (trafficData.browser_type = "Unknown"),
    -1 !== navigator.userAgent.indexOf("Win")
      ? (trafficData.operating_system = "Windows")
      : -1 !== navigator.userAgent.indexOf("Mac")
      ? (trafficData.operating_system = "MacOS")
      : -1 !== navigator.userAgent.indexOf("X11")
      ? (trafficData.operating_system = "UNIX")
      : -1 !== navigator.userAgent.indexOf("Linux")
      ? (trafficData.operating_system = "Linux")
      : (trafficData.operating_system = "Unknown"),
    {
      "device type": `${trafficData?.device_type}`,
      "browser type": `${trafficData?.browser_type}`,
      "operating system": `${trafficData?.operating_system}`,
    }
  );
}
function generateUniqueID() {
  return `uid-${new Date().getTime()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}
function getUserBrowserID() {
  let e = localStorage.getItem("browserID");
  return (
    e || ((e = generateUniqueID()), localStorage.setItem("browserID", e)), e
  );
}
trackUserTraffic();
const browserID = getUserBrowserID();
function isEqual(e, t) {
  let r = Object.keys(e),
    a = Object.keys(t);
  if (r.length !== a.length) return !1;
  for (let n of r) {
    let i = e[n],
      s = t[n],
      o = isObject(i) && isObject(s);
    if ((o && !isEqual(i, s)) || (!o && i !== s)) return !1;
  }
  return !0;
}
function isObject(e) {
  return null != e && "object" == typeof e;
}
function removeTimeSpent(e) {
  let t = JSON.parse(JSON.stringify(e));
  return (
    t.metrics.data.forEach((e) => {
      "User Behavior" === e.category &&
        delete e.params["time spent on the website"];
    }),
    t
  );
}
isRunning = !1;
const runScriptonLoad = async () => {
  logTimeSpent();
  let e = {
    project_id: GrowthApp_ProjectId,
    apikey: GrowthAPP_ApiKey,
    userSessionId: browserID,
    metrics: {
      data: [
        {
          category: "Traffic Sources",
          params: {
            "referral sources": `${referralSource}`,
            "organic search keywords": `${searchQuery}`,
            "paid search keywords": `${paidKeywords}`,
            "direct traffic": `${isDirectTraffic}`,
            "social media source": `${referrer}`,
            "campaign tracking parameters": `${utmSource}, ${utmMedium}, ${utmCampaign}, ${utmTerm}, ${utmContent}`,
          },
        },
        {
          category: "User Demographics",
          params: {
            "device type": `${trafficData?.device_type}`,
            "browser type": `${trafficData?.browser_type}`,
            "operating system": `${trafficData?.operating_system}`,
            "geographic location": `${trafficData?.geographic_location}`,
          },
        },
        {
          category: "User Behavior",
          params: {
            "time spent on the website": timeSpentSeconds,
            "navigation path": navigationPaths,
            "scroll depth": scrollDepthPercentage,
            "dead clicks": deadClicksArray,
            "excessive scroll": excessiveScrollArray,
            "rage click": rageClicks,
            errors: errors,
            "clicks and taps": clickEvents,
            "page views": pageViewsData,
            "time to first byte": timeToFirstByte,
          },
        },
      ],
    },
  };
  localStorage.getItem("previousState") ||
    localStorage.setItem(
      "previousState",
      JSON.stringify({
        project_id: "",
        apikey: "",
        userSessionId: "",
        metrics: { data: [] },
      })
    );
  let t = JSON.parse(localStorage.getItem("previousState") || "{}"),
    r = removeTimeSpent(e),
    a = removeTimeSpent(t);
  if (!isRunning && !isEqual(a, r)) {
    isRunning = !0;
    try {
      let n = await fetch(
        "https://growthapp-backend-c991.onrender.com/api/data/track-traffic",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(e),
        }
      );
      await n.json(), localStorage.setItem("previousState", JSON.stringify(e));
    } catch (i) {
      console.error(i);
    } finally {
      isRunning = !1;
    }
  }
};
setInterval(runScriptonLoad, 3e3),
  window.addEventListener("load", function () {
    runScriptonLoad();
  });
