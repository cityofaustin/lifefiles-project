//the last file to load simply throws event so the main app knows to begin runtime assembly of modules
(function (mypass) {
  'use strict';
  
  function init() {
    var event = new CustomEvent(mypass.Events.APP_STATUS.booted);
    window.dispatchEvent(event);
  }
  init();

})(mypass);