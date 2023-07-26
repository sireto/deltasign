function include(file) {
  var script  = document.createElement('script');
  script.src  = file;
  script.type = 'text/javascript';
  script.defer = true;
  document.getElementsByTagName('head').item(0).appendChild(script);
}

include('/static/js/handle-subscription.js');

// init dialogue overlay
$(window).ready(function(){
   var dialogue = document.querySelector('#call-to-action-dialogue');
   dialogue.style.display="none";
   /// remove error input feedback
   removeErrorElement();
});

$('.body-wrapper').load(function(){
    var dialogue = document.querySelector('#call-to-action-dialogue');
    dialogue.style.display="none";
});

$( "#call-to-action-dialogue" )
    .dialog({
         autoOpen: false,
         effect: "explode",  closeOnEscape: false, duration: 1000 });

/// click  listener to button to
/// open dialogue overlay
$( "#open-call-to-action" ).click(function() {
    var dialogue = document.querySelector('#call-to-action-dialogue');
    dialogue.style.display="block";
    $( "#call-to-action-dialogue" ).dialog( "open" );
});

/// click listener to button to
/// open dialogue on clicking
/// subscribe btn after filling email/phone
$( ".landing-email-request-btn" ).click(function() {
    var emailOrPhoneWithIndex = getEmailPhoneVal('');
    var emailOrPhone = emailOrPhoneWithIndex.emailOrPhone;
    var emailOrPhoneIndex = emailOrPhoneWithIndex.inputElementIndex;
    var feedback = getEmailPhoneValFeedback(emailOrPhone);
    if(feedback.length === 0){
        var dialogue = document.querySelector('#call-to-action-dialogue');
        var loading = document.querySelector('#call-to-action-loading-overlay');
        var thankYou = document.querySelector('.call-action-dialogue-content-info');
        var error = document.querySelector('.call-action-dialogue-content-error');
        dialogue.style.display="block";
        loading.style.display="block";
        thankYou.style.display="none";
        error.style.display="none";
        $( "#call-to-action-dialogue" ).dialog( "open" );
        grecaptcha.execute();
    }else{
        /// show feedback after validation
        var feedbackElement = document.querySelectorAll('.landing-email-request-feedback')[emailOrPhoneIndex];
            if(feedbackElement != null){
                feedbackElement.style.display="block";
                feedbackElement.innerText = feedback;
                return;
            }
    }

});

/// close opened dialogue overlay
function closeCallActionDialogue(){
    var dialogue = document.querySelector('#call-to-action-dialogue');
    var loading = document.querySelector('#call-to-action-loading-overlay');
    var thankYou = document.querySelector('.call-action-dialogue-content-info');
    var error = document.querySelector('.call-action-dialogue-content-error');
    dialogue.style.display="none";
    loading.style.display="none";
    thankYou.style.display="none";
    error.style.display="none";
    $( "#call-to-action-dialogue" ).dialog("close");
}

/// remove loading element from tree
/// showing thank you text div

function removeLoadingAndShowErrorMsg(errorMsg, isError){
    var loading = document.querySelector('#call-to-action-loading-overlay');
    var thankYou = document.querySelector('.call-action-dialogue-content-info');
    var errorDiv = document.querySelector('.call-action-dialogue-content-error');
    var errorTextElement = document.querySelector('.landing-email-subscribe-success-subtitle');
    var errorTitleElement = document.querySelector('.landing-email-subscribe-error-title');

    // first item is success icon
    // second item is error icon
    // used same class for styling
    var errorImg = document.querySelectorAll('.call-to-action-success-icon')[1];
    loading.style.display="none";
    thankYou.style.display="none";
    errorDiv.style.display="block";
    errorTextElement.innerHTML=errorMsg;
    errorImg.src=isError?"/images/svg/error.svg": "/images/svg/success.svg";
    if(!isError){
        errorTitleElement.innerHTML="You've have already registered for Beta release.";
    }
}

function removeLoadingAndShowThankYouInOverlayDialogue(){
    var loading = document.querySelector('#call-to-action-loading-overlay');
    var thankYou = document.querySelector('.call-action-dialogue-content-info');
    var error = document.querySelector('.call-action-dialogue-content-error');
    loading.style.display="none";
    thankYou.style.display="block";
    error.style.display="none";
}