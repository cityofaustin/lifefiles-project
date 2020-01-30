/* 
- helps for dynamic building of DOM elements
- place all reuseable methods here and call in feature modules for UI manipulation
- can also be used for all form validation
*/

(function (mypass) {
  'use strict';


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
    var tbrow;
    var tbrowComm = $(tableClassName + ' table tbody');
    if (tbrowComm[0].childNodes[0].nodeType == 8) {
      tbrow = tbrowComm[0].childNodes[0].data;
      tbrow=$(tbrow);
    }
    else {
      tbrow = $(tableClassName + ' tbody tr:first');
    }

    if (tbrow && tbrow.length > 0) {
      var rowTemplate = tbrow[0].outerHTML;
      var rowTemplateHlder = document.createComment(rowTemplate);


      $(tableClassName + ' tbody').empty();
      $(tableClassName + ' tbody').append(rowTemplateHlder);

      for (var index = 0; index < dataRows.length; index++) {
        var temp = $(rowTemplate).clone();
        var element = dataRows[index];
        // var chrd = temp.children();
        var chrd = $(temp).find('[data-bind]');
        for (var index2 = 0; index2 < chrd.length; index2++) {
          var child = chrd[index2];
          if (child.hasAttribute('data-bind')) {
            var prop = child.getAttribute('data-bind');
            child.innerText = element[prop];
          }
        }

        var chrdKey = $(temp).find('[data-key]');
        for (var index2 = 0; index2 < chrdKey.length; index2++) {
          var child = chrdKey[index2];
          if (child.hasAttribute('data-key')) {
            var prop = child.getAttribute('data-key');
            child.setAttribute('data-key', element[prop]);
          }
        }

        $(tableClassName + ' tbody').append(temp);
      }
    }

  }


})(mypass);