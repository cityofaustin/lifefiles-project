(function (mypass) {
  'use strict';

  var features = {};
  var __currentPage;
  mypass.navigation={
    addFeature:addFeature
  };

  mypass.goto={};

  function addFeature(feat) {
    features[feat.name] = feat;
    mypass.goto[feat.name]=function(){
      __currentPage=feat.name;
      window.location.hash = __currentPage;
      loadPage(features[feat.name]);
    };
  }

  function loadPage(frag) {
    getModule(frag).then(function (res) {
      $('.main-wrapper').empty();
      $('.main-wrapper').append(res.template);
      frag.load();
    });
  }

  function getModule(mod) {
    return new Promise((resolve) => {
      if (features[mod.name] && features[mod.name].template) {
        resolve(features[mod.name]);
        // mod.load();
      }
      else if (!features[mod.name] || !features[mod.name].template) {
        $.ajax({
          url: mod.url,
          dataType: "html"
        }).then(function (res) {
          mod.template = res;
          // mod.load();
          resolve(mod);
        });
      }
    });
  }

  function init() {
    // window.addEventListener('onLoginLoad', onLoginLoad);
  }

  init();

})(mypass);