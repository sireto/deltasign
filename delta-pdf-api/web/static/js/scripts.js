// scripts.js
// Handles subscription in the landing page.
// Depends on Jquery

const subscriber = {'email':'', 'recaptchaResponse': ''}

$(document).ready(function () {

    $(".landing-email-request-btn").click(function (){
        subscriberInput = $(this).siblings(".subscriber-input").val();

        if(isEmailAddress(subscriberInput)){
            subscriber['email'] = subscriberInput;
            validateCaptchaAndSubmit();
        }
        else if(isPhoneNumber(subscriberInput)){
            subscriber['email'] = subscriberInput+"@subscriber.deltasign.io";
            validateCaptchaAndSubmit();
        }else {
            showFailureSubscriptionResult();
        }
    });

});

const isEmailAddress = function (input) {
    const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return EMAIL_REGEX.test(String(input).toLowerCase());
}

const isPhoneNumber = function (input) {
    const PHONE_REGEX = /^\d{10}$/;
    return PHONE_REGEX.test(String(input));
}

const validateCaptchaAndSubmit = function (){
    grecaptcha.execute();
}

const submitSubscription = function (){
    subscribeUser(subscriber['email']);
}

const subscribeUser = function (email) {
    const captchaResponse = grecaptcha.getResponse();
    const request = {
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
            showSuccessSubscriptionResult(false);
        },
        error: function(e){
            var errorMsg = e["responseJSON"]["error"]["error"];
            if (errorMsg.includes('already exists')){
                showSuccessSubscriptionResult(true);
            }else{
                showFailureSubscriptionResult();
            }
        },
        complete: function(){
            grecaptcha.reset();
        }
    });
}

const showSubscriptionResult = function (success, title, message) {
    $("#result-modal-title").html(title);
    $("#result-modal-body").html(message);
    $("#showSubscriptionResult").modal();
}

const showSuccessSubscriptionResult = function (already) {
    if(!already){
        const title = "&#9989; Congratulations!";
        const message = "You're successfully registered for the beta program. " +
            "We'll inform you as soon as we launch.";
        showSubscriptionResult(true, title, message);
    }else{
        const title = "&#9989; You're already registered!";
        const message = "You're already registered for the beta program. " +
            "No worries. We'll inform you as soon as we launch.";
        showSubscriptionResult(true, title, message);
    }
    clearSubscriberInput();
}

const showFailureSubscriptionResult = function () {
    const title = "&#9888; Invalid input! Try again!";
    const message = "Please check that the email address is correct (eg. hello@example.com) and try again.";
    showSubscriptionResult(false, title, message);
}

const clearSubscriberInput = function () {
    $(".subscriber-input").val("");
}