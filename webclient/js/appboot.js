(function (mypass) {
  'use strict';
  
  function init() {
    var event = new CustomEvent(mypass.Events.APP_STATUS.booted);
    window.dispatchEvent(event);
  }
  init();

})(mypass);