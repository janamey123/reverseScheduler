$(document).ready(function () {

    // change from login page to sign up page
    $("#signUpBtn").on("click", function () {
        location.href = "/signUp";
    });//signUpBtn

    // user signs up
    $("#signingUpBtn").on("click", function () {
        let userName = $("#s_username").val();
        let firstName = $("#s_firstName").val();
        let lastName = $("#s_lastName").val();
        let password = $("#s_password").val();

        $.ajax({
            method: "GET",
            url: "/signingUpRequest",
            dataType: "json",
            data: {
                "userName": userName,
                "firstName": firstName,
                "lastName": lastName,
                "s_password": password
            },
            success: function (result, status) {
                try{
                    if (result[0].userName == userName){
                        $("#signUpError").html("Username already taken. Please try again.");
                    }
                } catch (e) {
                    $("#signUpError").html("Registration was successful.");
                }

            }

        });//ajax
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
