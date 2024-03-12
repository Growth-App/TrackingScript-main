document.addEventListener("DOMContentLoaded", function () {
  // Function to parse the query string
  function getQueryStringParams(query) {
    return query
      ? (/^[?#]/.test(query) ? query.slice(1) : query)
        .split("&")
        .reduce((params, param) => {
          let [key, value] = param.split("=");
          params[key] = value
            ? decodeURIComponent(value.replace(/\+/g, " "))
            : "";
          return params;
        }, {})
      : {};
  }

  function detectDeviceType() {
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
      /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
    ) || [];
  let browserType;
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
  const trafficData = {
    source: source,
    utm_source: utmSource,
    utm_campaign: utmCampaign,
    utm_medium: utmMedium,
    device_type: deviceType,
    browser_type: browserType,
    operating_system: os,
    // geographic_location will be determined server-side based on IP address
  };

  // Function to get the country name from the coordinates
  function getCountryName(lat, lon) {
    // You can use any geocoding service that suits your needs
    // Here we use the GeoNames API as an example
    // You need to register for a free account and get an API key
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
  //         trafficData.geographic_location = `${city}, ${country}`;

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
      },
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
      },
    );
  } else {
    // If not supported, display a message to the user
    console.log("Geolocation is not supported by this browser.");
    // Send data without the geographic location
    sendData();
  }
});


// To get the referral source
// also sometimes because of privacy reasons i think, the referrer may not be available, in situations like when the user is coming from an HTTPS site to an HTTP site or a setting on their browser
const referralSource = document.referrer;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// To get Organic search keywords

// Function to parse URL parameters
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Extract search query from the referrer URL
const searchQuery = getParameterByName('q', referralSource);

// the way i did this, it might only work for google, because google uses the 'q' parameter to store the search query, it might not work the same way for other search engines


// console.log("Organic Search Keyword:", searchQuery);

////////////////////////////////////////////////////////////////////////////////////////////////////////
// To get Paid search keywords

const urlParams = new URLSearchParams(referralSource);

// Identify search engine, which is most likely to be Google. 
const searchEngine = urlParams.get('utm_source');

if (searchEngine === 'google') {
  const paidKeywords = urlParams.get('utm_term');
  console.log('Paid Search Keywords:', paidKeywords);
} else {
  console.log('Not a paid search referral.');
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// To get direct traffic

// Checkng if the referrer URL is empty or matches the current domain
const isDirectTraffic = referralSource === '' || referralSource.startsWith(window.location.origin);

if (isDirectTraffic) {
  console.log('Direct Traffic');
} else {
  console.log('Not Direct Traffic');
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// To get the social media source
const referrer = referralSource.toLowerCase();

if (referrer.includes('facebook.com')) {
  console.log('from facebook');
} else if (referrer.includes('x.com' || 'twitter.com')) {
  console.log('from Twitter');
} else if (referrer.includes('instagram.com')) {
  console.log('from Ig');
} else {
  console.log('Not from social media source that is detectable');
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// To get campaign tracking parameters
function getURLParameters(url) {
  // Spliting the URL into parts
  const parts = url.split('?');

  if (parts?.length === 1) {
    return {}; // No query parameters
  }

  // Get the query string part of the URL
  const queryString = parts[1];

  // Split the query string into key-value pairs
  const params = {};
  const paramPairs = queryString.split('&');

  // Parse each key-value pair and add it to the params object
  paramPairs.forEach(pair => {
    const [key, value] = pair.split('=');
    params[key] = decodeURIComponent(value);
  });

  return params;
}

// Get the current page URL
const currentURL = window.location.href;

// Extract campaign tracking parameters from the current URL
const campaignParameters = getURLParameters(currentURL);

// Access individual campaign tracking parameters
const utmSource = campaignParameters['utm_source'];
const utmMedium = campaignParameters['utm_medium'];
const utmCampaign = campaignParameters['utm_campaign'];
const utmTerm = campaignParameters['utm_term'];
const utmContent = campaignParameters['utm_content'];

// Log the extracted campaign tracking parameters
console.log('UTM Source:', utmSource);
console.log('UTM Medium:', utmMedium);
console.log('UTM Campaign:', utmCampaign);
console.log('UTM Term:', utmTerm);
console.log('UTM Content:', utmContent);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// To get Time spent on the website

// Function to get the current time in milliseconds
function getCurrentTime() {
  return new Date().getTime();
}

// Initialize start time when the user first accesses the website
var startTime = getCurrentTime();

// Function to calculate time spent on the website
function calculateTimeSpent() {
  var currentTime = getCurrentTime();
  var timeSpentSeconds = Math.floor((currentTime - startTime) / 1000);
  return timeSpentSeconds;
}

// Function to log time spent on the website
function logTimeSpent() {
  var timeSpentSeconds = calculateTimeSpent();

  console.log(timeSpentSeconds + ' seconds spent on the website');
}

// Call logTimeSpent function when the user leaves the page or closes the browser
window.addEventListener('beforeunload', function () {
  logTimeSpent();
});


// //////////////////////////////////////////////////////////////////////////////////////////////////

// To get bounce rate

// Variable to track whether the user has interacted with the page
let hasInteracted = false;

// Function to track user interaction
function trackInteraction() {
  hasInteracted = true;
}

// Function to track user leaving the page
function trackExit() {
  // Check if the user has interacted with the page
  if (!hasInteracted) {
    // User hasn't interacted, consider it a bounce
    console.log('a User bounced!');
  }
}

// Event listeners to track user interaction and page exit
document.addEventListener('DOMContentLoaded', () => {
  // Add event listener for user interaction (e.g., click, scroll, etc.)
  document.addEventListener('click', trackInteraction);

  // Add event listener for user leaving the page
  window.addEventListener('beforeunload', trackExit);
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// To get exit rate

/////////////////////////////////////////////////////////////////////////////////////////////////////

// To track user navigation path

// Initialize an array to store visited URLs
let navigationPaths = [];

// Function to track user navigation paths
function trackNavigationPaths() {
    // Add the current URL to the array of visited URLs
    navigationPaths.push(window.location.href);

    // Output the current navigation path
    console.log('Navigation path:', navigationPaths.join(' > '));
}

// Call the function to track navigation paths whenever a page is loaded
trackNavigationPaths();


// /////////////////////////////////////////////////////////////////////////////////////////////////



///to track scroll depth
// Function to track scroll depth
function trackScrollDepth() {
  // Calculate the total height of the page
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

  // Calculate the current scroll position
  const currentScrollDepth = window.scrollY;

  // Calculate the scroll depth as a percentage
  const scrollDepthPercentage = (currentScrollDepth / totalHeight) * 100;

  // Output the scroll depth
  console.log('Scroll depth:', scrollDepthPercentage.toFixed(2) + '%');
}

// Call the function to track scroll depth whenever a scroll event occurs
window.addEventListener('scroll', trackScrollDepth);

/////////////////////////////////////////////////////////////////////////////////////////////////

// To track dead clicks

// Function to track dead clicks
function trackDeadClicks(event) {
  // Check if the clicked element has any associated action
  const hasAction = event.target.closest('[data-action]');

  // If the clicked element has no associated action, track it as a dead click
  if (!hasAction) {
      console.log('Dead click detected:', event.target);
      // You can further customize this to track dead clicks, such as sending data to a server for analysis
  }
}

// Attach a click event listener to the document body to track all clicks
document.body.addEventListener('click', trackDeadClicks);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// To track excessive scroll

// Track scroll behavior
let lastScrollTop = 0;
let scrollDirection = '';

window.addEventListener('scroll', function() {
    let scrollTop = window.window.scrollY || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        scrollDirection = 'down';
    } else {
        scrollDirection = 'up';
    }

    let scrollDistance = Math.abs(scrollTop - lastScrollTop);
    
    // Adjust threshold as needed
    const excessiveScrollThreshold = 500; // Define the threshold for excessive scroll

    if (scrollDistance > excessiveScrollThreshold) {
        console.log('Excessive scroll detected:', scrollDistance, 'pixels', 'in', scrollDirection, 'direction');
        // You can further customize this to track excessive scroll behavior, such as sending data to a server for analysis
    }

    lastScrollTop = scrollTop;
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//To track rage click

const rageClickThreshold = 5; // Define the threshold for rage clicks (e.g., 5 clicks within 1 second)
let clickCount = 0;
let lastClickTime = 0;

document.addEventListener('click', function(event) {
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - lastClickTime;

    if (timeSinceLastClick <= 1000) { // 1000 milliseconds = 1 second
        clickCount++;
    } else {
        clickCount = 1; // Reset click count if time since last click exceeds threshold
    }

    lastClickTime = currentTime;

    if (clickCount >= rageClickThreshold) {
        // Perform actions for rage click detection
        console.log('Rage click detected on element:', event.target);
        // You can further customize this to track specific elements or send data to a server for analysis
    }
});


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////

// To track quickback clicks

let lastPageUnloadTime = 0;

window.addEventListener('beforeunload', function(event) {
    // Record the time when the page is about to be unloaded
    lastPageUnloadTime = new Date().getTime();
});

window.addEventListener('DOMContentLoaded', function(event) {
    window.addEventListener('pageshow', function(event) {
        const currentTime = new Date().getTime();
        const timeSinceLastUnload = currentTime - lastPageUnloadTime;

        if (timeSinceLastUnload <= 1000) { // 1000 milliseconds = 1 second
            // Quickback click detected
            console.log('Quickback click detected');
            // You can further customize this to track quickback clicks or perform other actions
        }
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////To track script error on a page

// Function to handle script errors
function handleScriptError(event) {
  const error = {
      message: event.message, // Error message
      filename: event.filename, // URL of the script file
      lineno: event.lineno, // Line number where the error occurred
      colno: event.colno, // Column number where the error occurred
      errorObject: event.error // Error object
  };

  // Log the error
  console.error('Script error:', error);
}

// Added event listeners to capture different types of errors
window.addEventListener('error', handleScriptError); // Capture runtime errors
window.addEventListener('unhandledrejection', handleScriptError); // Capture unhandled promise rejections
window.addEventListener('DOMContentLoaded', function() {
  window.addEventListener('load', function() {
      setTimeout(function() {
          if (performance.getEntriesByType('resource').filter(function(entry) {
              return entry.initiatorType === 'script' && entry.name.includes('the_script_url');
          }).length === 0) {
              // if Script failed to load
              handleScriptError({
                  message: 'Script failed to load',
                  filename: 'N/A',
                  lineno: 'N/A',
                  colno: 'N/A',
                  error: 'N/A'
              });
          }
      }, 3000); 
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//To trackk error clicks 

let errorClickCount = 0;

window.addEventListener('click', function(event) {
  window.addEventListener('error', function(event) {
    errorClickCount++;
    console.error('Error occurred on button click');
  });
});
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////

// for total session count
// I'm thinnking of sending the count from each session to the server, for it to be collated on the backend, I'm assumning it would calculated for a specific period of time, like a day, a week, a month, etc
// Check if the session count exists in local storage
let sessionCount = localStorage.getItem('sessionCount');

// If session count does not exist, initialize it to 1
if (!sessionCount) {
    sessionCount = 1;
} else {
    // If session count exists, increment it by 1
    sessionCount = parseInt(sessionCount) + 1;
}

// Store the updated session count in local storage
localStorage.setItem('sessionCount', sessionCount);

// Output the total session count
console.log('Total Session Count:', sessionCount);

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//conversion funnel metrics
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// tracking completed transactions

function trackTransaction(transactionId, revenue) {
  const payload = {
    v: '1', // API version
    tid: 'YOUR_TRACKING_ID', // the website's Google Analytics tracking ID
    cid: 'CLIENT_ID', // Client ID (can be any unique identifier)
    t: 'transaction', 
    ti: transactionId, // Transaction ID
    tr: revenue // Transaction revenue
  };

  // Sending the payload to Google Analytics
  const request = new XMLHttpRequest();
  request.open('POST', 'https://www.google-analytics.com/collect');
  request.send(new URLSearchParams(payload).toString());
}

// Example usage:
trackTransaction('12345', 100);

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////

// tracking form submissions

document.addEventListener('submit', function (event) {
  const form = event.target;

  // Check if the submitted element is a form
  if (form && form.tagName === 'FORM') {
    // Optionally capture form data using FormData
    const formData = new FormData(form);

    // Track form submission
    trackFormSubmission(formData);
    // I'm assuming this will be a function that sends the form data to the server
  }
});
//////////////////////////////////////////////////////////////////

//tracking video views

function trackVideoEvent(videoId, eventType, timestamp) {
  // Send event data to your analytics service or endpoint
  console.log(`Video ID: ${videoId}, Event: ${eventType}, Timestamp: ${timestamp}`);
}

// Function to attach event listeners to video elements
function attachVideoEventListeners() {
  // Find all video elements on the page
  const videos = document.querySelectorAll('video');

  // Attach event listeners to each video element
  videos.forEach(video => {
    video.addEventListener('play', () => {
      trackVideoEvent(video.id, 'play', Date.now());
    });

    video.addEventListener('pause', () => {
      trackVideoEvent(video.id, 'pause', Date.now());
    });

    video.addEventListener('ended', () => {
      trackVideoEvent(video.id, 'ended', Date.now());
    });

    video.addEventListener('timeupdate', () => {
      // You can track time-based events here if needed
    });
  });
}

// Attach event listeners when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  attachVideoEventListeners();
});
// //////////////////////////////////////////////////////////////////////

//tracking downloads

// Function to track download events
function trackDownloadEvent(fileName) {
  // Send event data to your analytics service or endpoint
  console.log(`File Downloaded: ${fileName}`);
}

// Attach event listeners to download links/buttons
document.addEventListener('DOMContentLoaded', () => {
  const downloadLinks = document.querySelectorAll('a[data-download]');
  
  downloadLinks.forEach(link => {
    link.addEventListener('click', event => {
      const fileName = link.getAttribute('data-download');
      trackDownloadEvent(fileName);
    });
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//tracking mouse movement
function trackMouseMovement(event) {
  const mouseX = event.pageX;
  const mouseY = event.pageY;

  console.log(`Mouse moved to: (${mouseX}, ${mouseY})`);
}

document.addEventListener('mousemove', trackMouseMovement);

////////////////////////////////////////////////////////////////////////////////////////////////////
//tracking clicks and taps

function trackClickOrTap(event) {
  const clickData = {
    targetElement: event.target.tagName, 
    coordinates: {
      x: event.pageX, 
      y: event.pageY 
       }
  };

  console.log('Click or tap tracked:', clickData);
}

document.addEventListener('click', trackClickOrTap);
document.addEventListener('touchstart', trackClickOrTap);

////////////////////////////////////////////////////////////////////////////////////
//tracting time between interactions(clicks)

let lastInteractionTime = null;

function trackInteractions(event) {
  const currentTime = Date.now(); 

  if (lastInteractionTime) {
    const timeSinceLastInteraction = currentTime - lastInteractionTime;
    console.log(`Time since last interaction: ${timeSinceLastInteraction} ms`);
  }

  lastInteractionTime = currentTime;
}


document.addEventListener('click', trackInteractions);
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
//tracking clicks on different elements
function trackClick(event) {
  const clickedElement = event.target;

  const elementType = clickedElement.tagName.toLowerCase();
  const elementText = clickedElement.innerText || clickedElement.alt || clickedElement.src;

  console.log(`Clicked ${elementType}: ${elementText}`);
}

document.addEventListener('click', trackClick);
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//tracking mouse hover

function trackMouseHover(event) {
  const hoveredElement = event.target.tagName;

  console.log('Hovered over:', hoveredElement);
}


document.addEventListener('mouseover', trackMouseHover);
