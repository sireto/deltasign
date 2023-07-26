/// validate phone number
// eg. +97779812345678: true
// eg. +97779812345: false
// eg. +977798123456789: false
//var phoneRegex = RegExp(/^[\+]?[(]?[0-9]{4}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);

var phoneRegex = RegExp(/^[\+]?[(]?[0-9]{4}[)]?[-\s\.]?[0-9]{9}$/im);
var emailRegex = RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

function isInputPhoneNo(input){
    if(input.length > 0){

    }
    return 'No email or phone number is provided.';
}

function validateEmail(email){
    var isValid = emailRegex.test(email);
    if(!isValid){
        return 'Invalid email address. Correct format is like abc@example.com';
    }
    return '';
}

function validatePhone(phoneWithCode){
   var hasCodePlus=phoneWithCode[0] === "+";
   var isNumber =  !isNaN(phoneWithCode.substr(1));
   var isPhoneNotEmailAlpha = hasCodePlus && isNumber;
   var isValid = phoneRegex.test(phoneWithCode);

    if(isNaN(phoneWithCode)){
        return validateEmail(phoneWithCode);
    }
    if(hasCodePlus && !isNumber){
        return 'Not sufficient phone number is provided.';
    }
    if(!isValid){
        return 'Invalid phone number. Correct format is like +977<your-number>';
    }
    return '';
}

function getEmailPhoneVal(previousEmail){
      var allInputElements = document.querySelectorAll(".landing-email-request-input");
       for(i=0; i<allInputElements.length;  i++){
           var newVal = allInputElements[i].value;
           if(newVal != null && newVal !== previousEmail && newVal.length > previousEmail.length){
               return {
                emailOrPhone: newVal,
                inputElementIndex: i
               }
           }
       }
       return {
           emailOrPhone: '',
           inputElementIndex: -1
      }
}

function getEmailPhoneValFeedback(emailOrPhone){
     if(emailOrPhone != null && emailOrPhone.length > 0){
            if(emailOrPhone.includes('@')){
                return validateEmail(emailOrPhone);
            }else{
               return validatePhone(emailOrPhone);
            }
    }
    return 'No email or phone number is provided.';
}

function removeErrorElement(){
    var errorInputFeedback = document.querySelectorAll('.landing-email-request-feedback');
    if(errorInputFeedback  != null ){
        for(i=0; i<errorInputFeedback.length; i++){
            errorInputFeedback[i].style.display="none";
        }
    }
}

 function clearOtherwiseInputs(inputIndex){
    var allInputElements = document.querySelectorAll(".landing-email-request-input");
     for(i=0; i<allInputElements.length;  i++){
        if(inputIndex != null && i !== parseInt(inputIndex)){
           allInputElements[i].value="";
        }
    }
    removeErrorElement();
}
 // clearing other input values if already present
 // for emails
 function submitSubscription() {
       var captchaResponse = grecaptcha.getResponse();
            var email =  getEmailPhoneVal('').emailOrPhone;
            if(email.length === 0){
                 Snackbar.show({
                    text: "No email or phone is provided.",
                    pos: 'top-left',
                    backgroundColor: 'orange',
                    actionTextColor: 'white',
                    duration: 100000 /// 100 seconds before fading avaway
                 });
                return;
            }

             //TODO Hacky solution to support phone number
            if (!email.includes("@")) {
                email = email + "@deltasign.io"
             }


            var request = {
                "email": email,
                "recaptchaResponse": captchaResponse,
            };
            $.ajax({
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(request),
                url: "/beta-program",
                success: function (data) {
                    removeLoadingAndShowThankYouInOverlayDialogue();
                },
                error: function(e){
                    console.log(" errors: " +  JSON.stringify(e));
                    var errorMsg = e["responseJSON"]["error"]["error"];
                    var isString= typeof errorMsg === "string";
                    var hasErrorStr = errorMsg != null && isString && errorMsg.length>0;
                    // dummy logic to verify already exists case
                    var alreadyRegistered = errorMsg.includes('already exists');
                    removeLoadingAndShowErrorMsg( hasErrorStr ? (alreadyRegistered ?
                        'We will notify you when we launch.': errorMsg )
                            : 'Check if you have provided correct email or phone number.', !alreadyRegistered);
                },
                complete: function(){
                    grecaptcha.reset();
                }
            });
}