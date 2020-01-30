/*
general utility functions
*/

(function (mypass) {
  'use strict';


  var fileTypes={
    OWNER:{
      TYPE_1:'1'
    }
  };

  
  mypass.utils = {
    StringBuilder: StringBuilder,
    FileTypes:fileTypes,
    startWaiting:startWaiting,
    stopWaiting:stopWaiting
  };

  
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
  
  function startWaiting() {
    var event = new CustomEvent(mypass.Events.APP_STATUS.startwaiting);
    window.dispatchEvent(event);
  }
  function stopWaiting() {
    var event = new CustomEvent(mypass.Events.APP_STATUS.stopwaiting);
    window.dispatchEvent(event);
  }

})(mypass);