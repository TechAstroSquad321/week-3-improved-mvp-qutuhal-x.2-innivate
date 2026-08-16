const video = document.getElementById("camera");
const startButton = document.getElementById("startCamera");
const stopButton = document.getElementById("stopCamera");

const statusText = document.getElementById("status");
const signName = document.getElementById("signName");
const confidence = document.getElementById("confidence");

let stream = null;


// ============================
// START CAMERA
// ============================

startButton.addEventListener("click", async () => {

    try {

        statusText.textContent = "Requesting camera access...";

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });

        video.srcObject = stream;

        video.style.display = "block";

        statusText.textContent =
            "✅ Camera is working! Show your hand.";

        signName.textContent =
            "Hand detection ready ✋";

        confidence.textContent =
            "Position your hand clearly in front of the camera.";

    } catch (error) {

        console.error(error);

        statusText.textContent =
            "❌ Camera could not start.";

        signName.textContent =
            "Camera permission needed";

        confidence.textContent =
            "Please allow camera access in your browser.";

    }

});


// ============================
// STOP CAMERA
// ============================

stopButton.addEventListener("click", () => {

    if (stream) {

        stream.getTracks().forEach(track => {
            track.stop();
        });

        stream = null;

    }

    video.srcObject = null;

    statusText.textContent =
        "Camera is stopped.";

    signName.textContent =
        "Waiting...";

    confidence.textContent =
        "Press Start Camera to practice.";

});


// ============================
// CHECK CAMERA SUPPORT
// ============================

if (!navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia) {

    statusText.textContent =
        "This browser does not support camera access.";

}