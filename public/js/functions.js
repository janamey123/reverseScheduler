$(document).ready(function () {

    $("#signUpBtn").on("click", function () {

        location.href = "/signUp";
    });//signUpBtn

    $("#loginBtn").on("click", function () {

        $.ajax({
            method: "GET",
            url: "",
            dataType: "json",
            data: {
                "q1": q1Response
            },
            success: function (result, status) {
                // alert(result);
            }

        });//ajax
    });//signUpBtn


});//ready
