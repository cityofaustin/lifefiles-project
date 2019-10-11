
(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent:'ownerdashboard',
    name: 'doclist',
    url: '/ui/features/owner/doclist/index.html',
    methods: {
      load: loadScreen,
      uploadFile:uploadFile
    }
  });

  var ajaxFiles;
  var fileCtr = 0;
  var uploadError,uploadErrorMsg;


  function init() {  }

  function loadScreen(parentElement) {
    $('.btn-logout').removeClass('hidden');
    $(parentElement).empty();
    $(parentElement).append(mypass.ownerdashboard.doclist.template);
    SetUpFilePicker();
  }

  function getDocs() {
    // mypass.datacontext.serviceprovider.getAll().then(OnGetDocs);
  }


  function OnGetDocs(res) {
    if (res.success) {
      __hasData=true;
      // mypass.formhelper.showElement('.service-providers .navbar');
      mypass.formhelper.bindTableRows('.doc-list', res.Rows);
    }
  }

  
  function SetUpFilePicker() {
    uploadError = false;
    uploadErrorMsg = '';
    
    $(".filepicker-wrapper").empty();
    $('.filepicker-wrapper').append('<input id="ajaxpicker" type="file" class="hidden" accept="*.*" multiple/>');
    $('#ajaxpicker').change(function (changeEvent) {
      ajaxFiles = changeEvent.target.files;
      UploadFiles();
    });
  }

  function uploadFile() {
    $('#ajaxpicker').trigger('click');
  }

  function UploadFiles() {
    if (!ajaxFiles) {
      return;
    }
    fileCtr = 0;
    SendFiles();
  }

  function SendFiles() {
    if (!ajaxFiles) {
      return;
    }

    if (fileCtr <= ajaxFiles.length - 1) {
      // $rootScope.$emit(common.APP_EVENTS.BeginProcess);
      var file = ajaxFiles[fileCtr];

      if (file.size > 10485760) {
        //limit file size to 10 mb ...1048576 = 1mb
        fileCtr = 0;
        SetUpFilePicker();
        // $rootScope.$emit(common.APP_EVENTS.EndProcess);
        return;
      }

      var data = new FormData();
      data.append('thefile', file);
      data.append('FileName', file.name);
      data.append('FileType', file.type);
      fileCtr++;

      $.ajax({
        url: '/upload',
        type: 'POST',
        data: data,
        cache: false,
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        error: function (jqXHR, textStatus, errorThrown) {
          console.log('ERRORS: ' + textStatus);
        },
        success: function (data, sts, xhr) {
          if (data && !data.success) {
            uploadError = true;
            uploadErrorMsg = 'There was an error uploading your file. Please check the file and try again.';
          }
          else {
            SendFiles();
          }
        }
      });
    }
    else {
      fileCtr = 0;
      getDocs();
      SetUpFilePicker();
      // $rootScope.$emit(common.APP_EVENTS.EndProcess);
    }

  }


  init();

})(mypass);
