/**
 * Tracks the travel time to my work using BING Maps API and Phillips Hue Bulb
 * Green - Traffic is good 
 * Red - Traffic is bad
 * Yellow - Traffic is average
 * Blue - Couldn't retreive Data
 * July 14th 2017 Ryan Theriot
 */
const localIP = `192.168.86.32`;
const userID = `OUKcxjFxKwiEtMriHrVDfpv3SFOBk72LS9kH-xon`;
const trafficURL = `http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=4911a+mokapea+pl+ewa+beach&wp.1=University%20of%20Hawaii%20at%20Manoa&avoid=minimizeTolls&key=AnczajqYYh4VoTuTW-aqhiIJ8bise3nOOHyNoRCfd2SQvJcnIcJm0GIvJMfUMrwV`;
let currentTravelTime = 0;
const minTravelTime = 45 * 60; //45Mins Traffic
const maxTravelTime = 90 * 60; //90 Mins Traffic

//Green on CIE Chart
const minColorVal = {
  x: 0.3,
  y: 0.6
};

//Red on CIE Chart
const maxColorVal = {
  x: 0.6,
  y: 0.3
};

//Depending on travel time set lamp to red, yellow or green
function setColorWithData() {
  const percent = (currentTravelTime - minTravelTime) / (maxTravelTime - minTravelTime);
  const color = calcColorPt(minColorVal.x, minColorVal.y, maxColorVal.x, maxColorVal.y, percent);
  const url = `http://${localIP}/api/${userID}/lights/3/state`
  const http = new XMLHttpRequest();
  http.open('PUT', url, true);
  const message = `{"xy":[${color[0]}, ${color[1]}]}`;
  http.send(message);
}

//With no data set the color of lamp to blue
function setColorNoData() {
  const url = `http://${localIP}/api/${userID}/lights/3/state`
  const http = new XMLHttpRequest();
  http.open('PUT', url, true);
  const message = `{"xy":[0.2, 0.15]}`; //Set to blue
  http.send(message);
}

//Calculate the color point on the CIE Color chart
function calcColorPt(pt1X, pt1Y, pt2X, pt2Y, per) {
  return [pt1X + (pt2X - pt1X) * per, pt1Y + (pt2Y - pt1Y) * per];
}

//Get the traffic to work from
function getTrafficToWork(request) {
  $.ajax({
    url: request,
    dataType: "jsonp",
    jsonp: "jsonp",
    success: function (r) {
      setTravelTime(r);
      setColorWithData();
      //setColorNoData();
    },
    error: function (e) {
      setColorNoData();
    }
  });
}

//Set the current travel time
function setTravelTime(result) {
  currentTravelTime = result.resourceSets["0"].resources["0"].travelDurationTraffic;
  var text = currentTravelTime / 60;
  document.getElementById("travelTime").innerHTML = text.toFixed(0);
}

//Get the data and set an interval of 20 seconds
getTrafficToWork(trafficURL);
setInterval(getTrafficToWork, 20000);
