document.addEventListener('DOMContentLoaded', function() {
  // Function to parse the query string
  function getQueryStringParams(query) {
    return query
      ? (/^[?#]/.test(query) ? query.slice(1) : query)
          .split('&')
          .reduce((params, param) => {
            let [key, value] = param.split('=');
            params[key] = value
              ? decodeURIComponent(value.replace(/\+/g, ' '))
              : '';
            return params;
          }, {})
      : {};
  }

  function detectDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    } else if (/mobile|iphone|ipod|iemobile|blackberry|android/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  let source = 'Direct';
  let referrer = document.referrer;
  const urlParams = getQueryStringParams(window.location.search);
  const utmSource = urlParams.utm_source || 'not set';
  const utmCampaign = urlParams.utm_campaign || 'not set';
  const utmMedium = urlParams.utm_medium || 'not set';

  // Detect device type
  const deviceType = detectDeviceType();

  // Browser type and version
  const browserName = navigator.userAgent.match(
    /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
  ) || [];
  let browserType;
  if (/trident/i.test(browserName[1])) {
    browserType =
      'IE ' + (/\brv[ :]+(\d+)/g.exec(navigator.userAgent) || [])[1];
  } else if (browserName[1] === 'Chrome') {
    let temp = navigator.userAgent.match(/\b(OPR|Edge)\/(\d+)/);
    if (temp != null)
      browserType = temp.slice(1).join(' ').replace('OPR', 'Opera');
    else browserType = browserName.join(' ');
  } else browserType = browserName.join(' ');

  // Operating system
  const os = navigator.platform;

  if (referrer) {
    const a = document.createElement('a');
    a.href = referrer;
    const referrerHostname = a.hostname;
    if (referrerHostname.indexOf('google') > -1) source = 'Organic Search';
    else if (
      referrerHostname.indexOf('facebook') > -1 ||
      referrerHostname.indexOf('twitter') > -1
    )
      source = 'Social Media';
    else source = 'Referral (' + referrerHostname + ')';
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
    const apiKey = 'xekhai';
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
        console.error('Error:', error);
      });
  }

  // Function to send data to your server-side endpoint
// Function to send data to your server-side endpoint
function sendData() {
  // Add the user ID to the data object
  trafficData.userId = userId;
  // Change the URL to the one you want
  fetch('https://growthapp-backend-c991.onrender.com/api/data/track-traffic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trafficData),
  })
    .then((response) => response.json())
    .then((data) => console.log('Success:', data))
    .catch((error) => {
      console.error('Error:', error);
    });
}

  
// Get the user ID from the query parameter
var userId = new URLSearchParams(window.location.search).get('userId');

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
        console.error('Error:', error.message);
        // Send data without the geographic location
        sendData();
      }
    );
  } else {
    // If not supported, display a message to the user
    console.log('Geolocation is not supported by this browser.');
    // Send data without the geographic location
    sendData();
  }
});
