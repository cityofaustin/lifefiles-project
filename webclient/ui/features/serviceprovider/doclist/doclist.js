
(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent: 'sp_dashboard',
    name: 'doclist',
    url: '/ui/features/serviceprovider/doclist/index.html',
    methods: {
      load: loadScreen,
      uploadFile: uploadFile,
      getfile: getfile,
      closeViewer:closeViewer
    }
  });

  var ajaxFiles;
  var fileCtr = 0;
  var uploadError, uploadErrorMsg;
  var theDocs,theOwner;


  function init() { }

  function loadScreen(parentElement,data) {
    $('.btn-logout').removeClass('hidden');
    $(parentElement).empty();
    $(parentElement).append(mypass.sp_dashboard.doclist.template);
    SetUpFilePicker();
    theDocs = data.Docs;
    theOwner=data.Owner;
    mypass.formhelper.bindTableRows('.doc-list', data.Docs);
  }

  function getDocs() {
    mypass.datacontext.owner.getdocs({ownerid:theOwner.primarykey}).then(OnGetDocs);
  }
  
  function OnGetDocs(res) {
    if (res.success) {
      theDocs = res.data;
      mypass.formhelper.bindTableRows('.doc-list', res.data);
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
      var file = ajaxFiles[fileCtr];

      if (file.size > 10485760) {
        //limit file size to 10 mb ...1048576 = 1mb
        fileCtr = 0;
        SetUpFilePicker();
        return;
      }

      var data = new FormData();
      data.append('thefile', file);
      data.append('FileName', file.name);
      data.append('MIMEType', file.type);
      data.append('ownerkey', theOwner.primarykey);
      // data.append('FileType', mypass.utils.FileTypes.OWNER.TYPE_1);

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
            SetUpFilePicker();
          }
          else if (data && data.success) {
            // data.addedRows = tempInsertRes.addedRows;
            // data.filename = tempInsertRes.filename;
            // data.originalname = tempInsertRes.originalname;
            SendFiles();
          }
        }
      });
    }
    else {
      fileCtr = 0;
      getDocs();
      SetUpFilePicker();
    }

  }

  function getfile(ctrl) {
    var req = {
      primarykey: ctrl.getAttribute('data-key')
    };

    var file = _.filter(theDocs, { primarykey: req.primarykey * 1 });
    if (file.length > 0) {
      file = file.pop();
    }
    req.thefile = file.thefile;
    mypass.datacontext.owner.getfile(req).then(onGetFile);
  }

  function onGetFile(res) {
    if (res.success) {
      var file = res.data;
        //if want to download file...do this...
        // var link = document.createElement('a');
        // link.download = file.originalname;
        // link.href = URL.createObjectURL(new Blob([new Uint8Array(file.file.data)]));
        // $('.attachment-dl').append(link);
        // link.click();

        //show image in a pop up
        $('#theimg').attr('src',URL.createObjectURL(new Blob([new Uint8Array(file.file.data)])));
        $('.img-viewer').removeClass('hidden');
    }

  }

  function closeViewer() {
    $('.img-viewer').addClass('hidden');
    $('#theimg').attr('src','');
  }


  init();

})(mypass);
