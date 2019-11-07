

function response(response) {

  this.success;
  this.error;
  this.message = '';
  this.httpcode;
  this.data={};

  if (response) {
    this.success = response.success;
    this.error = response.error;
    this.httpcode=response.httpcode;
  }
}

module.exports=response;
