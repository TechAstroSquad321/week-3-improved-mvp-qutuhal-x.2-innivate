const video = document.getElementById("camera");
const startButton = document.getElementById("startCamera");
const stopButton = document.getElementById("stopCamera");
const status = document.getElementById("status");
const placeholder = document.getElementById("cameraPlaceholder");
const indicator = document.getElementById("cameraIndicator");

let stream = null;

function showStatus(message) {
    status.textContent = message;
}

async function startCamera() {
    console.log("Start Camera clicked");

    showStatus("Requesting camera permission...");

    startButton.disabled = true;

    try {
        if (!navigator.mediaDevices) {
            throw new Error("Camera API is not available.");
        }

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        console.log("Camera permission granted");
        console.log(stream);

        video.srcObject = stream;

        video.style.display = "block";
        placeholder.style.display = "none";

        await video.play();

        stopButton.disabled = false;

        indicator.innerHTML = "<span></span> Camera On";

        showStatus(
            "Camera is working! Put your hand in front of the camera."
        );

    } catch (error) {

        console.error("CAMERA ERROR:", error);

        startButton.disabled = false;

        if (error.name === "NotAllowedError") {

            showStatus(
                "Camera permission was denied. Allow camera access in your browser settings, then reload this page."
            );

        } else if (error.name === "NotFoundError") {

            showStatus(
                "No camera was found on this computer."
            );

        } else if (error.name === "NotReadableError") {

            showStatus(
                "The camera is already being used by another app."
            );

        } else if (error.name === "SecurityError") {

            showStatus(
                "The browser blocked camera access for security reasons."
            );

        } else {

            showStatus(
                "Camera error: " + error.message
            );
        }
    }
}


function stopCamera() {

    if (stream) {

        stream.getTracks().forEach(track => {
            track.stop();
        });

        stream = null;
    }

    video.srcObject = null;

    video.style.display = "none";
    placeholder.style.display = "flex";

    startButton.disabled = false;
    stopButton.disabled = true;

    indicator.innerHTML = "<span></span> Camera Off";

    showStatus("Camera is currently off.");
}


startButton.addEventListener(
    "click",
    startCamera
);

stopButton.addEventListener(
    "click",
    stopCamera
);
