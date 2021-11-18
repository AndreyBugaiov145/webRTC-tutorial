//alert('sdfds');

var connection = new WebSocket('ws://localhost:8080');
var name = "";
var peerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;

var loginInput = document.querySelector('#loginInput');
var loginBtn = document.querySelector('#loginBtn');
var otherUsernameInput = document.querySelector('#otherUsernameInput');
var connectToOtherUsernameBtn = document.querySelector('#connectToOtherUsernameBtn');
var connectedUser, myConnection,dataChannel;
var msgInput = document.querySelector('#msgInput');
var sendMsgBtn = document.querySelector('#sendMsgBtn');
//when a user clicks the login button
loginBtn.addEventListener("click", function(event){
    name = loginInput.value;

    if(name.length > 0){
        send({
            type: "login",
            name: name
        });
    }

});

//handle messages from the server
connection.onmessage = function (message) {
    console.log("Got message", message.data);
    var data;
    try {
        data = JSON.parse(message.data);
    } catch (e) {
        console.log("Invalid JSON");
        data =message.data;
    }
    myConnection? alert(myConnection.signalingState):false;
    console.log(data)
    switch(data.type) {
        case "test":
            console.log(data);
            break;
        case "login":
            onLogin(data.success);
            break;
        case "offer":
            onOffer(data.offer, data.name);
            break;
        case "answer":
            onAnswer(data.answer);
            break;
        case "candidate":
            onCandidate(data.candidate);
            break;
        default:
            break;
    }
};

//when a user logs in
function onLogin(success) {

    if (success === false) {
        alert("oops...try a different username");
    } else {
        //creating our RTCPeerConnection object

        var configuration = {
            "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
        };

        myConnection = new peerConnection (configuration,{
            optional: [{RtpDataChannels: true}]
        });
        console.log("RTCPeerConnection object was created");
        console.log(myConnection);

        //setup ice handling
        //when the browser finds an ice candidate we send it to another peer
        alert('PRE myConnection.onicecandidate')
        console.log(myConnection.onicecandidate)
        myConnection.onicecandidate = function (event) {
            alert('myConnection.onicecandidate')
            if (event.candidate) {
                alert('event.candidate')
                send({
                    type: "candidate",
                    candidate: event.candidate
                });
            }
        };
        openDataChannel();
    }
};

connection.onopen = function () {
    console.log("Connected");
};

connection.onerror = function (err) {
    console.log("Got error", err);
};

// Alias for sending messages in JSON format
function send(message) {

    if (connectedUser) {
        message.name = connectedUser;
    }

    connection.send(JSON.stringify(message));
};





//setup a peer connection with another user
connectToOtherUsernameBtn.addEventListener("click", function () {

    var otherUsername = otherUsernameInput.value;
    connectedUser = otherUsername;

    if (otherUsername.length > 0) {
        //make an offer
        myConnection.createOffer(function (offer) {
            console.log('offer',offer,'-----');
            console.log('Pre send offer');
            send({
                type: "offer",
                offer: offer
            });
            console.log('send offer');
            myConnection.setLocalDescription(offer);
        }, function (error) {
            alert("An error has occurred.");
        });
    }
});

//when somebody wants to call us
function onOffer(offer, name) {
    connectedUser = name;
    alert(connectedUser+'onOffer')
    myConnection.setRemoteDescription(new RTCSessionDescription(offer));

    myConnection.createAnswer(function (answer) {
        myConnection.setLocalDescription(answer);
        send({
            type: "answer",
            answer: answer
        });

    }, function (error) {
        alert("oops...error");
    });
}

//when another user answers to our offer
function onAnswer(answer) {
    myConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

//when we got ice candidate from another user
function onCandidate(candidate) {
    myConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

//creating data channel
function openDataChannel() {

    var dataChannelOptions = {
        reliable:true
    };

    dataChannel = myConnection.createDataChannel("myDataChannel", dataChannelOptions);

    dataChannel.onerror = function (error) {
        console.log("Error:", error);
    };

    dataChannel.onmessage = function (event) {
        console.log("Got message:", event.data);
    };
}

//when a user clicks the send message button
sendMsgBtn.addEventListener("click", function (event) {
    console.log("send message");
    var val = msgInput.value;
    dataChannel.send(val);
});