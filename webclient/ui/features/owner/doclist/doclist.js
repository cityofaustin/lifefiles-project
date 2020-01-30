
(function (mypass) {
  'use strict';

  mypass.registerFeatureChild({
    parent: 'ownerdashboard',
    name: 'doclist',
    url: '/ui/features/owner/doclist/index.html',
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
  var theDocs;


  function init() { }

  function loadScreen(parentElement) {
    $('.btn-logout').removeClass('hidden');
    $(parentElement).empty();
    $(parentElement).append(mypass.ownerdashboard.doclist.template);
    mypass.utils.startWaiting();
    SetUpFilePicker();
    getDocs();
  }

  function getDocs() {
    mypass.datacontext.owner.getdocs().then(OnGetDocs);
  }


  function OnGetDocs(res) {
    if (res.success) {
      theDocs = res.data;
      mypass.formhelper.bindTableRows('.doc-list', res.data);
    }
    mypass.utils.stopWaiting();
  }


  function SetUpFilePicker() {
    uploadError = false;
    uploadErrorMsg = '';
    mypass.utils.stopWaiting();
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
      mypass.utils.startWaiting();
      
      var file = ajaxFiles[fileCtr];

      if (file.size > 10485760) {
        //limit file size to 10 mb ...1048576 = 1mb
        fileCtr = 0;
        SetUpFilePicker();
        mypass.utils.stopWaiting();
        return;
      }

      var data = new FormData();
      data.append('thefile', file);
      data.append('FileName', file.name);
      data.append('MIMEType', file.type);
      data.append('FileType', mypass.utils.FileTypes.OWNER.TYPE_1);

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
            SendFiles();
          }
        }
      });
    }
    else {
      fileCtr = 0;
      getDocs();
      SetUpFilePicker();
      mypass.utils.stopWaiting();
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
    mypass.utils.startWaiting();
    mypass.datacontext.owner.getfile(req).then(function(getres){
      onGetFile(getres,file);
    });
  }

  function onGetFile(res,fileInfo) {
    if (res.success) {
      var file = res.data;
        // var link = document.createElement('a');
        // link.download = file.originalname;
        // link.href = URL.createObjectURL(new Blob([new Uint8Array(file.file.data)]));
        // $('.attachment-dl').append(link);
        // link.click();

        //previous version for showing bytes
        // $('#theimg').attr('src',URL.createObjectURL(new Blob([new Uint8Array(file.file.data)])));

        //permanent version using their urls
        $('#theimg').attr('src',file.thumbURL200);

        $('.file-name').text(fileInfo.documentname);

        $('.img-viewer').removeClass('hidden');
        mypass.utils.stopWaiting();

    }

  }

  function closeViewer() {
    $('.img-viewer').addClass('hidden');
    $('#theimg').attr('src','');
  }


  init();

})(mypass);
