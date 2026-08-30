```javascript
document.addEventListener("DOMContentLoaded", function () {

    const video = document.getElementById("camera");
    const startButton = document.getElementById("startCamera");
    const stopButton = document.getElementById("stopCamera");

    const statusText = document.getElementById("status");
    const signName = document.getElementById("signName");
    const confidence = document.getElementById("confidence");

    const placeholder =
        document.getElementById("cameraPlaceholder");

    let stream = null;


    // ==============================
    // START CAMERA
    // ==============================

    startButton.addEventListener("click", async function () {

        try {

            statusText.textContent =
                "Requesting camera permission...";

            // Check browser support
            if (!navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia) {

                throw new Error(
                    "getUserMedia is not supported."
                );

            }


            // Ask for camera
            stream =
                await navigator.mediaDevices.getUserMedia({

                    video: true,

                    audio: false

                });


            // Put camera stream into video
            video.srcObject = stream;


            // Make sure video starts
            await video.play();


            // Hide placeholder
            if (placeholder) {
                placeholder.style.display = "none";
            }


            // Update UI
            statusText.textContent =
                "✅ Camera is working!";

            signName.textContent =
                "Hand detected camera ready ✋";

            confidence.textContent =
                "Camera is ready for AI recognition.";


            startButton.disabled = true;

            stopButton.disabled = false;


            console.log("Camera started successfully.");

        }

        catch (error) {

            console.error("CAMERA ERROR:", error);


            if (error.name === "NotAllowedError") {

                statusText.textContent =
                    "❌ Camera permission was denied.";

            }

            else if (error.name === "NotFoundError") {

                statusText.textContent =
                    "❌ No camera was found.";

            }

            else if (error.name === "NotReadableError") {

                statusText.textContent =
                    "❌ Camera is already being used by another app.";

            }

            else {

                statusText.textContent =
                    "❌ Camera error: " + error.message;

            }


            signName.textContent =
                "Camera unavailable";

            confidence.textContent =
                "Check your browser camera permissions.";

        }

    });



    // ==============================
    // STOP CAMERA
    // ==============================

    stopButton.addEventListener("click", function () {

        if (stream) {

            stream.getTracks().forEach(function (track) {

                track.stop();

            });

            stream = null;

        }


        video.srcObject = null;


        if (placeholder) {
            placeholder.style.display = "flex";
        }


        statusText.textContent =
            "Camera is stopped.";

        signName.textContent =
            "Waiting...";

        confidence.textContent =
            "Press Start Camera to practice.";


        startButton.disabled = false;

        stopButton.disabled = true;


        console.log("Camera stopped.");

    });

});
```
