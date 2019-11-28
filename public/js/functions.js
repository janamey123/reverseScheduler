$(document).ready(function () {

    // change from login page to sign up page
    $("#signUpBtn").on("click", function () {
        location.href = "/signUp";
    });//signUpBtn

    // user signs up
    $("#signingUpBtn").on("click", function () {
        let username = $("#s_username").val();
        let firstName = $("#s_firstName").val();
        let lastName = $("#s_lastName").val();
        let password = $("#s_password").val();

        $.ajax({
            method: "GET",
            url: "/signingUpRequest",
            dataType: "json",
            data: {
                "username": username,
                "firstName": firstName,
                "lastName": lastName,
                "s_password": password
            },
            success: function (result, status) {
                if (result == false) {
                    $("#signUpError").html("Username already taken. Please try again.");
                } else {
                    $("#signUpError").html("Registration was successful.");
                }
            }

        });//ajax
    });//signUpBtn

    $("#loginBtn").on("click", function () {
        let username = $("#username").val();
        let password = $("#password").val();
        $.ajax({
            method: "GET",
            url: "/loginRequest",
            dataType: "json",
            data: {
                "username": username,
                "password": password
            },
            success: function (result, status) {
                alert(result);
                if (result == false) {
                    $("#loginError").html("Username or password wrong! Try again.");
                } else {
                    location.href = "/dashboard";
                }
            }
        });//ajax
    });//signUpBtn


});//ready

// Source: look at Sources -> Sticky
mybutton = document.getElementById("myBtn");
window.onscroll = function () {
    scrollFunction()
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}