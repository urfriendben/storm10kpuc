var started = false;
var totalCount = 0;
var trackCount = {};

$(document).ready(function(){
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAYYs9wxuZ9_x-ttq4GrskZHkWC9TIYziQ",
        authDomain: "kpuc-f8c22.firebaseapp.com",
        databaseURL: "https://kpuc-f8c22.firebaseio.com",
        storageBucket: "kpuc-f8c22.appspot.com",
        messagingSenderId: "653242245229"
    };
    firebase.initializeApp(config);
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        'login_hint': 'user@example.com'
    });
    firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            InitializeCounter();
            StartCountListener();
        }
        else{
            firebase.auth().signInWithRedirect(provider);
        }
        // The signed-in user info.
        var user = result.user;
        }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
});

function InitializeCounter(){
    $('#bib-input').focus(function(){
        $(this).val('');
    });
    $('#count-input').click(function(){
        $(this).val('');
    });

    $('#plus-holder').click(function(){
        if(!started){
            SetCountByBib($('#bib-input').val(), $('#count-input').val());
        }
        else{
            firebase.database().ref('count-log/' + $('#bib-input').val()).once('value').then(function(snapshot){
                if(snapshot.val() != null){
                    SetCountByBib($('#bib-input').val(), $('#count-input').val());
                }
                else{
                    SetCountByBib($('#bib-input').val(), $('#count-input').val());
                }
            });
        }
    });

    $('#minus-holder').click(function(){
        firebase.database().ref('count-log/' + $('#bib-input').val()).once('value').then(function(snapshot){
            if(snapshot.val() != null){
                SetCountByBib($('#bib-input').val(), parseInt($('#count-input').val()) * -1);
            }
        });
    });

    $('#info-holder').click(function(){
        firebase.database().ref('count-log/' + $('#bib-input').val()).once('value').then(function(snapshot){
            if(snapshot.val() != null){
                $('#personal-bib').html($('#bib-input').val());
                firebase.database().ref('count-log/' + $('#bib-input').val() + '/count').once('value').then(function(snapshot){
                    var total = 0;
                    $.each(snapshot.val(), function(key, value){
                        total += parseInt(value);
                    });
                    $('#personal-count').html(total);
                });
            }
        });
    });
}

function SetCountByBib(bib, addCount){
    firebase.database().ref('count-log/' + bib + '/count/' + $.now()).set(parseInt(addCount));
    $('#personal-bib').html(bib);
    firebase.database().ref('count-log/' + bib + '/count').once('value').then(function(snapshot){
        var total = 0;
        $.each(snapshot.val(), function(key, value){
            total += parseInt(value);
        });
        $('#personal-count').html(total);
    });
    if(!started){
        started = true;
        firebase.database().ref('started').set(true);
    }
}

function StartCountListener(){
    firebase.database().ref('started').on('value', function(snapshot){
        if(snapshot.val() == false){
            $('#total-count').html('Waiting');
        }
        else{
            firebase.database().ref('count-log').on('child_added', function(snapshot){
                trackCount[snapshot.key] = 0;
                $('#count-table').append('<tr><th scope="row">' + snapshot.key + '</th><td id="' + snapshot.key + '-count"></td></tr>');
                for(var i = 0; i < Object.keys(snapshot.val()['count']).length; i++){
                    trackCount[snapshot.key] += parseInt(snapshot.val()['count'][Object.keys(snapshot.val()['count'])[i]]);
                    totalCount += parseInt(snapshot.val()['count'][Object.keys(snapshot.val()['count'])[i]]);
                }
                $('#' + snapshot.key + '-count').html(trackCount[snapshot.key]);
                $('#total-count').html(totalCount);
                UpdateRanking();
            });

            firebase.database().ref('count-log').on('child_changed', function(snapshot){
                trackCount[snapshot.key] += parseInt(snapshot.val()['count'][Object.keys(snapshot.val()['count'])[Object.keys(snapshot.val()['count']).length - 1]]);
                totalCount += parseInt(snapshot.val()['count'][Object.keys(snapshot.val()['count'])[Object.keys(snapshot.val()['count']).length - 1]]);
                $('#' + snapshot.key + '-count').html(trackCount[snapshot.key]);
                $('#total-count').html(totalCount);
                UpdateRanking();
            });
        }
    });
}

function UpdateRanking(){
    var highestBib = 0;
    var highestCount = 0;
    for(var i = 0; i < Object.keys(trackCount).length; i++){
        if(trackCount[Object.keys(trackCount)[i]] > highestCount){
            highestBib = Object.keys(trackCount)[i];
            highestCount = trackCount[Object.keys(trackCount)[i]];
        }
    }
    $('#rank_first').html(highestBib);
    $('#rank_first_count').html(highestCount);
    if(Object.keys(trackCount).length > 1){
        var highest2Bib = 0;
        var highest2Count = 0;
        for(var i = 0; i < Object.keys(trackCount).length; i++){
            if(trackCount[Object.keys(trackCount)[i]] > highest2Count){
                if(Object.keys(trackCount)[i] != highestBib){
                    highest2Bib = Object.keys(trackCount)[i];
                    highest2Count = trackCount[Object.keys(trackCount)[i]];
                }
            }
        }
        $('#rank_second').html(highest2Bib);
        $('#rank_second_count').html(highest2Count);
    }
    if(Object.keys(trackCount).length > 2){
        var highest3Bib = 0;
        var highest3Count = 0;
        for(var i = 0; i < Object.keys(trackCount).length; i++){
            if(trackCount[Object.keys(trackCount)[i]] > highest3Count){
                if(Object.keys(trackCount)[i] != highestBib && Object.keys(trackCount)[i] != highest2Bib){
                    highest3Bib = Object.keys(trackCount)[i];
                    highest3Count = trackCount[Object.keys(trackCount)[i]];
                }
            }
        }
        $('#rank_third').html(highest3Bib);
        $('#rank_third_count').html(highest3Count);
    }
}