plugins {
  id("com.android.application")

  // Add the Google services Gradle plugin
  id("com.google.gms.google-services")

  ...
}

dependencies {
  // Import the Firebase BoM
  implementation(platform("com.google.firebase:firebase-bom:34.0.0"))


  // TODO: Add the dependencies for Firebase products you want to use
  // When using the BoM, don't specify versions in Firebase dependencies
  implementation("com.google.firebase:firebase-analytics")


  // Add the dependencies for any other desired Firebase products
  // https://firebase.google.com/docs/android/setup#available-libraries
}



// index.js
const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

function initMap() {
  const center = { lat: -25.7479, lng: 28.2293 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: center,
  });
  new google.maps.Marker({
    position: center,
    map: map,
    title: "Pretoria",
  });
}

function loadGoogleMapsScript() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Make initMap globally accessible for Google Maps callback
window.initMap = initMap;

window.onload = loadGoogleMapsScript;


{
  "name": "google-maps-frontend",
  "version": "1.0.0",
  "description": "A simple frontend app displaying Google Maps with JavaScript",
  "main": "index.js",
  "scripts": {
    "start": "lite-server"
  },
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "lite-server": "^2.6.1"
  }
}
