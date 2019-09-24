(function (mypass) {
  'use strict';

  //USED FOR ALL FORMS OF VALIDATION

  mypass.formhelper = {
    showElement: showElement,
    hideElement: hideElement,
    bindTableRows:bindTableRows
  };

  function showElement(elementName) {
    $(elementName).removeClass('hidden');
  }

  function hideElement(elementName) {
    $(elementName).addClass('hidden');
  }

  function bindTableRows(tableClassName,dataRows) {
    var str = new mypass.utils.StringBuilder();
      var rowTemplate = $(tableClassName + ' tbody tr:first')[0].outerHTML;
      var rowTemplateHlder = document.createComment(rowTemplate);

      $(tableClassName + ' tbody').empty();
      $(tableClassName + ' tbody').append(rowTemplateHlder);
      var temp = $(rowTemplate).clone();
      for (var index = 0; index < dataRows.length; index++) {
        const element = dataRows[index];
        var chrd = temp.children();
        for (var index = 0; index < chrd.length; index++) {
          var child = chrd[index];
          var prop = child.getAttribute('data-bind');
          child.innerText = element[prop];
        }
        $(tableClassName +' tbody').append(temp);
      }
  }


})(mypass);