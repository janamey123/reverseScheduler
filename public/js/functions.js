$(document).ready(function () {
    displayQ4Choices();
    displayQ6Choices();

    //functions
    function displayQ4Choices() {
        let q4ChoicesArray = ["Maine", "Rhode Island", "Maryland", "Delaware"];
        q4ChoicesArray = _.shuffle(q4ChoicesArray);
        for (let i = 0; i < q4ChoicesArray.length; i++) {
            $("#q4Choices").append(`<input type="radio" name="q4" id="${q4ChoicesArray[i]}" value="${q4ChoicesArray[i]}"> <label for="${q4ChoicesArray[i]}">${q4ChoicesArray[i]}</label>`);
        }
    }//displayQ4Choices

    function displayQ6Choices() {
        let q6ChoicesArray = ["Deep South", "Northeast", "Southwest", "Pacific Northwest"];
        q6ChoicesArray = _.shuffle(q6ChoicesArray);
        for (let i = 0; i < q6ChoicesArray.length; i++) {
            $("#q6Choices").append(`<input type="radio" name="q6" id="${q6ChoicesArray[i]}" value="${q6ChoicesArray[i]}"> <label for="${q6ChoicesArray[i]}">${q6ChoicesArray[i]}</label>`);
        }
    }// displayQ6Choices

    //Event Listeners
    $(".q5choice").on("click", function () {
        $(".q5choice").css("background-color", ""); //resets background color
        $(this).css("background-color", "rgb(255, 255, 0)");
    })

    $("#submitBtn").on("click", function () {
        let q1Response = $("#q1").val();
        let q2Response = $("#q2").val();
        let q3aResponse = $("#Franklin").is(":checked");
        let q3bResponse = $("#Jackson").is(":checked");
        let q3cResponse = $("#Jefferson").is(":checked");
        let q3dResponse = $("#Roosevelt").is(":checked")
        let q4Response = $("input[name=q4]:checked").val();
        let q5Response = "";
        if ($("#seal1").css("background-color") == "rgb(255, 255, 0)") {
            q5Response = "seal1";
        } else if ($("#seal2").css("background-color") == "rgb(255, 255, 0)") {
            q5Response = "seal2";
        } else {
            q5Response = "seal3";
        }

        let q6Response = $("input[name=q6]:checked").val();
        let q7Response = $("#q7").val();
        let q8aResponse = $("#Yosemite").is(":checked");
        let q8bResponse = $("#DeathValley").is(":checked");
        let q8cResponse = $("#JoshuaTree").is(":checked");
        let q8dResponse = $("#MonumentValley").is(":checked");
        let q8eResponse = $("#Zion").is(":checked");

        $.ajax({
            method: "GET",
            url: "/gradeQuiz",
            dataType: "json",
            data: {
                "q1": q1Response,
                "q2": q2Response,
                "q3a": q3aResponse,
                "q3b": q3bResponse,
                "q3c": q3cResponse,
                "q3d": q3dResponse,
                "q4": q4Response,
                "q5": q5Response,
                "q6": q6Response,
                "q7": q7Response,
                "q8a": q8aResponse,
                "q8b": q8bResponse,
                "q8c": q8cResponse,
                "q8d": q8dResponse,
                "q8e": q8eResponse
            },
            success: function (result, status) {
                // alert(result);
                $("#q1Feedback").html(result.feedback1);
                $("#q2Feedback").html(result.feedback2);
                $("#q3Feedback").html(result.feedback3);
                $("#q4Feedback").html(result.feedback4);
                $("#q5Feedback").html(result.feedback5);
                $("#q6Feedback").html(result.feedback6);
                $("#q7Feedback").html(result.feedback7);
                $("#q8Feedback").html(result.feedback8);

                if (result.feedback1 == "Correct!") {
                    $("#q1Feedback").attr("class", "bg-success text-white");
                    $("#markImg1").html("<img src='img/checkmark.png' alt='checkmark'>");
                } else {
                    $("#q1Feedback").attr("class", "bg-warning text-white");
                    $("#markImg1").html("<img src='img/xmark.png' alt='xmark'>");
                }

                if (result.feedback2 == "Correct!") {
                    $("#q2Feedback").attr("class", "bg-success text-white");
                    $("#markImg2").html("<img src='img/checkmark.png' alt='checkmark'>");
                } else {
                    $("#q2Feedback").attr("class", "bg-warning text-white");
                    $("#markImg2").html("<img src='img/xmark.png' alt='xmark'>");
                }

                if (result.feedback3 == "Correct!") {
                    $("#q3Feedback").attr("class", "bg-success text-white");
                    $("#markImg3").html("<img src='img/checkmark.png' alt='checkmark'>");
                } else {
                    $("#q3Feedback").attr("class", "bg-warning text-white");
                    $("#markImg3").html("<img src='img/xmark.png' alt='xmark'>");
                }

                if (result.feedback4 == "Correct!") {
                    $("#q4Feedback").attr("class", "bg-success text-white");
                    $("#markImg4").html("<img src='img/checkmark.png' alt='checkmark'>");
                } else {
                    $("#q4Feedback").attr("class", "bg-warning text-white");
                    $("#markImg4").html("<img src='img/xmark.png' alt='xmark'>");
                }

                if (result.feedback5 == "Correct!") {
                    $("#q5Feedback").attr("class", "bg-success text-white");
                    $("#markImg5").html("<img src='img/checkmark.png' alt='checkmark'>");
                } else {
                    $("#q5Feedback").attr("class", "bg-warning text-white");
                    $("#markImg5").html("<img src='img/xmark.png' alt='xmark'>");
                }

                if (result.feedback6 == "Correct!") {
                    $("#q6Feedback").attr("class", "bg-success text-white");
                    $("#markImg6").html("<img src='img/checkmark.png' alt='checkmark'>");
                } else {
                    $("#q6Feedback").attr("class", "bg-warning text-white");
                    $("#markImg6").html("<img src='img/xmark.png' alt='xmark'>");
                }

                if (result.feedback7 == "Correct!") {
                    $("#q7Feedback").attr("class", "bg-success text-white");
                    $("#markImg7").html("<img src='img/checkmark.png' alt='checkmark'>");
                } else {
                    $("#q7Feedback").attr("class", "bg-warning text-white");
                    $("#markImg7").html("<img src='img/xmark.png' alt='xmark'>");
                }

                if (result.feedback8 == "Correct!") {
                    $("#q8Feedback").attr("class", "bg-success text-white");
                    $("#markImg8").html("<img src='img/checkmark.png' alt='checkmark'>");
                } else {
                    $("#q8Feedback").attr("class", "bg-warning text-white");
                    $("#markImg8").html("<img src='img/xmark.png' alt='xmark'>");
                }

                if (result.score < 80) {
                    $("#totalScore").attr("class", "text-danger");
                } else {
                    $("#totalScore").attr("class", "text-success");
                }

                if (result.score < 80) {
                    $("#totalScore").html("Total Score: " + result.score);
                } else {
                    $("#totalScore").html("Congratulations! You reached a total score of " + result.score + " points!");
                }
            }
        });//ajax
    });//submitBtn
});//ready
