(function (mypass) {
  'use strict';

  //USED FOR ALL FORMS OF VALIDATION

  mypass.validation = {
    showErrorLabel: showErrorLabel,
    hideErrorLabel: hideErrorLabel
  };

  function showErrorLabel(elementName) {
    var element = document.getElementsByName(elementName);
    if (element.length==0) {
      throw 'Could not find element by name: ' + elementName;
    }
    element[0].classList.remove('hidden');
  }

  function hideErrorLabel(elementName) {
    var element = document.getElementsByName(elementName);
    if (element.length==0) {
      throw 'Could not find element by name: ' + elementName;
    }
    element[0].classList.add('hidden');
  }


})(mypass);