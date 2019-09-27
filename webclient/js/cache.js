//a browser cache service for storing app data
(function (mypass) {
  'use strict';

  mypass.isAuth = false;
  mypass.cache = {
    get: get,
    set: set,
    remove: remove,
    removeAll: removeAll
  };

  function init() {
  }

  function get(key) {
    var o = window.localStorage.getItem(key);
    return o ? JSON.parse(o) : null;
  }

  function set(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key) {
    window.localStorage.removeItem(key);
  }

  function removeAll(key) {
    window.localStorage.clear();
  }


  init();

})(mypass);