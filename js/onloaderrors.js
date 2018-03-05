var browser = window.navigator.userAgent
var errMsg = (
  !window.localStorage
  || !window.Set
  || !window.Object.assign
  || !window.Object.values)
    ? ("You are using "
        + browser
        + ", which is not supported."
        + "Please update your browser."
        + " or use the latest version of Chrome, Firefox, Safari or Edge for best results.")
    : "";
document.getElementById('error-msg').innerText = errMsg
