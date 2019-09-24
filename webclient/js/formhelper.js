(function (mypass) {
  'use strict';

  //USED FOR ALL FORMS OF VALIDATION

  mypass.formhelper = {
    showElement: showElement,
    hideElement: hideElement
  };

  function showElement(elementName) {
    $(elementName).removeClass('hidden');
  }

  function hideElement(elementName) {
    $(elementName).addClass('hidden');
  }


})(mypass);