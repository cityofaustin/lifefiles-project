(function (mypass) {
  'use strict';

  //USED FOR ALL FORMS OF VALIDATION

  mypass.formhelper = {
    showElement: showElement,
    hideElement: hideElement,
    bindTableRows: bindTableRows
  };

  function showElement(elementName) {
    $(elementName).removeClass('hidden');
  }

  function hideElement(elementName) {
    $(elementName).addClass('hidden');
  }

  function bindTableRows(tableClassName, dataRows) {
    var str = new mypass.utils.StringBuilder();
    var tbrow = $(tableClassName + ' tbody tr:first');

    if (tbrow && tbrow.length > 0) {
      var rowTemplate = tbrow[0].outerHTML;
      var rowTemplateHlder = document.createComment(rowTemplate);

      $(tableClassName + ' tbody').empty();
      $(tableClassName + ' tbody').append(rowTemplateHlder);

      for (var index = 0; index < dataRows.length; index++) {
        var temp = $(rowTemplate).clone();
        const element = dataRows[index];
        var chrd = temp.children();
        for (var index2 = 0; index2 < chrd.length; index2++) {
          var child = chrd[index2];
          var prop = child.getAttribute('data-bind');
          child.innerText = element[prop];
        }
        $(tableClassName + ' tbody').append(temp);
      }
    }

  }


})(mypass);