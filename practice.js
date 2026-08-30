document.addEventListener("DOMContentLoaded", function () {

    const video = document.getElementById("camera");
    const startButton = document.getElementById("startCamera");
    const stopButton = document.getElementById("stopCamera");

    const statusText = document.getElementById("status");
    const signName = document.getElementById("signName");
    const confidence = document.getElementById("confidence");

    let stream = null;


    // START CAMERA
    startButton.addEventListener("click", async function () {

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {

            statusText.textContent =
                "Camera is not supported in this browser.";

            return;
        }

        try {

            statusText.textContent =
                "Requesting camera permission...";

            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            video.srcObject = stream;

            await video.play();

            statusText.textContent =
                "✅ Camera is working!";

            signName.textContent =
                "Hand detection ready ✋";

            confidence.textContent =
                "Show your hand clearly to the camera.";

        } catch (error) {

            console.log(error);

            statusText.textContent =
                "❌ Camera permission was not granted.";

            signName.textContent =
                "Camera unavailable";

            confidence.textContent =
                "Check your browser's camera permission.";
        }

    });


    // STOP CAMERA
    stopButton.addEventListener("click", function () {

        if (stream) {

            stream.getTracks().forEach(function (track) {
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
