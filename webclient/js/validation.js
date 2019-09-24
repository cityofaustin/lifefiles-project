(function (mypass) {
  'use strict';

  //USED FOR ALL FORMS OF VALIDATION

  mypass.validation = {
    showErrorLabel: showErrorLabel,
    hideErrorLabel: hideErrorLabel
  };

  function showErrorLabel(elementName) {

    var elements;
    if (!Array.isArray(elementName)) {
      elements = [elementName];
    }
    else{
      elements=elementName;
    }

    for (var index = 0; index < elements.length; index++) {
      var lbl = elements[index];
      var element = document.getElementsByName(lbl);
      if (element.length == 0) {
        throw 'Could not find element by name: ' + lbl;
      }
      element[0].classList.remove('hidden');
    }
  }

  function hideErrorLabel(elementName) {
    var elements;
    if (!Array.isArray(elementName)) {
      elements = [elementName];
    }
    else{
      elements=elementName;
    }

    for (var index = 0; index < elements.length; index++) {
      var lbl = elements[index];
      var element = document.getElementsByName(lbl);
      if (element.length == 0) {
        throw 'Could not find element by name: ' + lbl;
      }
      element[0].classList.add('hidden');
    }
  }


})(mypass);