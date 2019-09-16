
exports.StringBuilder=StringBuilder;

function StringBuilder(){

  this.theString=null;

  this.append=function(str){
    if(this.theString===null){
      this.theString=str;
    }
    else{
      this.theString=this.theString.concat(str);
    }
  };

  this.toString=function(){
    return this.theString;
  };

  this.clear=function(){
    this.theString=null;
  };

  return this;

}



