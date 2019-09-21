(function (mypass) {
  'use strict';

  //USED FOR ALL FORMS OF VALIDATION

  mypass.validation = {
    showErrorLabel: showErrorLabel,
    hideErrorLabel: hideErrorLabel
  };

  function showErrorLabel(elementName) {
    //pass the DOM element's name attribute value
    var element = document.getElementsByName(elementName);
    if (!element) {
      throw 'Could not find element by name: ' + elementName;
    }
    element[0].classList.remove('hidden');
  }

  function hideErrorLabel(elementName) {
    //pass the DOM element's name attribute value
    var element = document.getElementsByName(elementName);
    if (!element) {
      throw 'Could not find element by name: ' + elementName;
    }
    element[0].classList.add('hidden');
  }


})(mypass);