/**
 * Tracks the travel time to my work using BING Maps API and Phillips Hue Bulb
 * Green - Traffic is good 
 * Red - Traffic is bad
 * Yellow - Traffic is average
 * Blue - Couldn't retreive Data
 * 
 * July 14th 2017 Ryan Theriot
 */
const localIP = `192.168.86.32`;
const userID = `OUKcxjFxKwiEtMriHrVDfpv3SFOBk72LS9kH-xon`;
const trafficURL = "http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=4911a+mokapea+pl+ewa+beach&wp.1=University%20of%20Hawaii%20at%20Manoa&avoid=minimizeTolls&key=AnczajqYYh4VoTuTW-aqhiIJ8bise3nOOHyNoRCfd2SQvJcnIcJm0GIvJMfUMrwV";
const lightNumber = 3;
const lightURL = `http://${localIP}/api/${userID}/lights/${lightNumber}/state`
let currentTravelTime = 0;
let minTravelTime = 45 * 60; //45Mins Traffic
let maxTravelTime = 90 * 60; //90 Mins Traffic
let brightness = 150;
let haveData = false;

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

//Get the data and set an interval of 20 seconds
getTrafficToWork();
setInterval(getTrafficToWork, 5000);
document.getElementById("minTime").innerHTML = minTravelTime / 60;
document.getElementById("maxTime").innerHTML = maxTravelTime / 60;
document.getElementById("brightness").innerHTML = brightness;

//Depending on travel time set lamp to red, yellow or green
function setColor() {
  const percent = (currentTravelTime - minTravelTime) / (maxTravelTime - minTravelTime);
  const color = calcColorPt(minColorVal.x, minColorVal.y, maxColorVal.x, maxColorVal.y, percent);
  const http = new XMLHttpRequest();
  http.open('PUT', lightURL, true);
  let message;
  if (haveData) message = `{"on":true,"bri":${brightness},"xy":[${color[0]}, ${color[1]}]}`;
  else message = `{"on":true,"bri":${brightness}, "xy":[0.2, 0.15]}`;
  http.send(message);
}

//Get the traffic to work from
function getTrafficToWork() {
  $.ajax({
    url: trafficURL,
    dataType: "jsonp",
    jsonp: "jsonp",
    success: function (r) {
      setTravelTime(r);
      haveData = true;
      setColor();
      setUpdateTime();
    },
    error: function (e) {
      haveData = false;
      setColor();
      setUpdateTime();
    }
  });
}

//Calculate the color point on the CIE Color chart
function calcColorPt(pt1X, pt1Y, pt2X, pt2Y, per) {
  return [pt1X + (pt2X - pt1X) * per, pt1Y + (pt2Y - pt1Y) * per];
}

//Set the current travel time
function setTravelTime(result) {
  currentTravelTime = result.resourceSets["0"].resources["0"].travelDurationTraffic;
  document.getElementById("travelTime").innerHTML = (currentTravelTime/60).toFixed(0);
}

function changeMin(value) {
  minTravelTime = value * 60;
  setColor();;
  document.getElementById("minTime").innerHTML = minTravelTime / 60;
}

function changeMax(value) {
  maxTravelTime = value * 60;
  setColor();
  document.getElementById("maxTime").innerHTML = maxTravelTime / 60;
}

function setBrightness(value) {
  brightness = value;
  setColor();
  document.getElementById("brightness").innerHTML = brightness;
}

function setUpdateTime() {
  var today = new Date();
  var time = pad(today.getHours()) + ":" + pad(today.getMinutes()) + ":" + pad(today.getSeconds());
  document.getElementById("updateTime").innerHTML = time + ' ' + date;
}
function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}
