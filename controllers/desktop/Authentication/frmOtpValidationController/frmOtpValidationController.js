define([],function(){ 
  let securityKey = "", resendtime = 180;
  return {
    onPreShow: function() {
      var self = this;
      this.view.flxError.isVisible = false;
      this.view.txtotp1.text = "";
      this.view.txtotp2.text = "";
      this.view.txtotp3.text = "";
      this.view.txtotp4.text = "";
      this.view.txtotp5.text = "";
      this.view.txtotp6.text = "";
      this.view.btnReSend.setEnabled(false);
      this.view.btnContinue.onClick = function() {
        let otp1 = self.view.txtotp1.text;
        let otp2 = self.view.txtotp2.text;
        let otp3 = self.view.txtotp3.text;
        let otp4 = self.view.txtotp4.text;
        let otp5 = self.view.txtotp5.text;
        let otp6 = self.view.txtotp6.text;
        if(otp1 && otp2 && otp3 && otp4 && otp5 && otp6) {
          let otp = otp1+otp2+otp3+otp4+otp5+otp6;
          self.verifyMFA(otp);  
        } else{
          self.view.flxError.isVisible = true;
        }
      };
    },
    onPostShow: function() {
      this.requestMFA("request");
    },
    requestMFA: function(otpType) {
      let param = {
        "phoneno": "9876543210"
      };
      kony.application.showLoadingScreen("", "Loading", "", "", "", "");
      var authManager = applicationManager.getAuthManager();
      if(otpType == "request") {
        authManager.requestMFA(param,this.requestMFASucess,this.requestMFAError); 
      } else {
        authManager.requestMFA(param,this.resendMFASucess,this.requestMFAError); 
      }
    },
    requestMFASucess: function(response) {
      kony.application.dismissLoadingScreen();
      if(response.securityKey) {
        securityKey = response.securityKey;
        this.timer(resendtime);
      }
    },
    resendMFASucess: function(response) {
      kony.application.dismissLoadingScreen();
      if(response.securityKey) {
        securityKey = response.securityKey;
        this.view.txtotp1.text = "";
        this.view.txtotp2.text = "";
        this.view.txtotp3.text = "";
        this.view.txtotp4.text = "";
        this.view.txtotp5.text = "";
        this.view.txtotp6.text = "";
        this.view.btnReSend.setEnabled(false);
        this.timer(resendtime);
        this.view.flxError.isVisible = false;
      }
    },
    requestMFAError: function(error) {
      kony.application.dismissLoadingScreen();
      this.view.flxError.isVisible = true;
    },
    verifyMFA: function(otp) {
      let param = {
        "securityKey": securityKey,
        "Otp": otp
      };
      kony.application.showLoadingScreen("", "Loading", "", "", "", "");
      var authManager = applicationManager.getAuthManager();
      authManager.verifyMFA(param,this.verifyMFASucess,this.verifyMFAError);
    },
    verifyMFASucess: function(response) {
      kony.application.dismissLoadingScreen();      
      var x = new kony.mvc.Navigation("frmDashBoard");
      x.navigate();
    },
    verifyMFAError: function(error) {
      kony.application.dismissLoadingScreen();
      this.view.flxError.isVisible = true;
    },
    timer: function (remaining) {
      var timerself = this;
      var m = Math.floor(remaining / 60);
      var s = remaining % 60;
      m = m < 10 ? '0' + m : m;
      s = s < 10 ? '0' + s : s;
      this.view.lblotpresend.text = m + ':' + s;
      remaining -= 1;
      if(remaining >= 0) {
        setTimeout(function() {
          timerself.timer(remaining);
        }, 1000);
        return;
      }
      this.view.btnReSend.setEnabled(true);
    }
  };
});