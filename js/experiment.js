// normalise window.URL
window.URL || (window.URL = window.webkitURL || window.msURL || window.oURL);

// normalise navigator.getUserMedia
navigator.getUserMedia || (navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

var smoothingFactor = 0.7;

var perspectiveX = 50,
    perspectiveY = 50;

var options = {
    video: true
};

var video = document.createElement('video');
video.setAttribute('autoplay', true);


navigator.mediaDevices.getUserMedia(options)
    .then(function(mediaStream) {
        video.srcObject = mediaStream;
        video.play();
        drawFrame();
    })
    .catch(function(err) {
        console.log(err.name + ": " + err.message);
    }); // always check for errors at the end.


function drawFrame() {
    requestAnimationFrame(drawFrame);
    var camDisplay = document.querySelector('#camDisplay'),
        context = camDisplay.getContext('2d');
    context.fillStyle = "rgba(0, 0, 200, 0.5)";
    context.drawImage(video, 0, 0, camDisplay.width, camDisplay.height);

    faces = ccv.detect_objects({
        canvas: (ccv.pre(camDisplay)),
        cascade: cascade,
        interval: 2,
        min_neighbors: 1
    });

    highlightFaces(faces)
}

function highlightFaces(faces) {
    var camDisplay = document.querySelector('#camDisplay'),
        box = document.getElementsByClassName("box-container"),
        context = camDisplay.getContext('2d'),
        d = document.getElementById("debug");
        // rcontainer = document.getElementsByClassName('rcontainer');
        // d2 = document.getElementById("debug-2");
        // d3 = document.getElementById("debug-3");

    if (!faces) {
        return false;
    }

    for (var i = 0; i < faces.length; i++) {
        var face = faces[i];
        var newPerspectiveX = 50 + (camDisplay.width/2 - (face.x + (face.width/2)) ) * (100/camDisplay.width);
        var newPerspectiveY = -70 + (camDisplay.height/2 + (face.y + (face.height/2)) ) * (100/camDisplay.height) ;
        perspectiveX = smooth(perspectiveX, newPerspectiveX);
        perspectiveY = smooth(perspectiveY, newPerspectiveY);

        d.innerHTML = (face.x+face.width/2).toString() + ", " + (face.y+face.height/2).toString();

        // var newEyeX = face.x + face.width * 0.5;
        // var newEyeY = face.y + face.height * 0.33;
        // var perspectiveValue = ((1 - newEyeX / camDisplay.width) * 100).toFixed(1) + '% ' + (newEyeY / camDisplay.height * 100).toFixed(1) + '%';

        // d3.innerHTML = "Face Width: " + face.width.toString() + ", " + face.height.toString();
        // d2.innerHTML = "Face: " + face.x.toString() + ", " + face.y.toString();
        d.innerHTML = "Perspective: " + perspectiveX.toString() + ", " + perspectiveY.toString();
        for (var i = 0; i < box.length; i++) {
            box[i].style.perspectiveOrigin = perspectiveX.toString() + "% " + perspectiveY.toString() + "%";
        }
        // rcontainer[0].style.perspectiveOrigin = perspectiveX.toString() + "% " + perspectiveY.toString() + "%";
        context.fillRect(face.x, face.y, face.width, face.height);
    }
}

function smooth(newPerspective, oldPerspective) {
    return newPerspective * smoothingFactor + oldPerspective * (1 - smoothingFactor);
}
