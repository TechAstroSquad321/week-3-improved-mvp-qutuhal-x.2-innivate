```javascript
document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("camera");
    const startButton = document.getElementById("startCamera");
    const stopButton = document.getElementById("stopCamera");

    const statusText = document.getElementById("status");
    const signName = document.getElementById("signName");
    const confidence = document.getElementById("confidence");

    const placeholder =
        document.getElementById("cameraPlaceholder");

    let stream = null;


    // ==========================================
    // CAMERA SUPPORT CHECK
    // ==========================================

    function checkCameraSupport() {

        if (!window.isSecureContext) {

            statusText.innerHTML =
                "🔒 Camera requires HTTPS.<br>" +
                "Open the GitHub Pages HTTPS version of your website.";

            signName.textContent =
                "Secure connection required";

            confidence.textContent =
                "Your browser will not allow camera access on an insecure page.";

            return false;
        }


        if (!navigator.mediaDevices) {

            statusText.innerHTML =
                "❌ Camera API unavailable.";

            signName.textContent =
                "Camera not supported";

            confidence.textContent =
                "Try opening the website in the latest Chrome or Edge.";

            return false;
        }


        if (!navigator.mediaDevices.getUserMedia) {

            statusText.innerHTML =
                "❌ getUserMedia is unavailable.";

            signName.textContent =
                "Camera not supported";

            confidence.textContent =
                "Your browser does not support camera access.";

            return false;
        }


        return true;
    }



    // ==========================================
    // START CAMERA
    // ==========================================

    startButton.addEventListener("click", async () => {

        console.log("START CAMERA BUTTON CLICKED");

        startButton.disabled = true;

        statusText.textContent =
            "📷 Checking camera access...";


        // Check browser support
        if (!checkCameraSupport()) {

            startButton.disabled = false;

            return;
        }


        try {

            statusText.textContent =
                "📷 Asking for camera permission...";


            /*
             * IMPORTANT:
             * This request is made directly from
             * the button click.
             */

            stream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        },

                        facingMode: "user"
                    },

                    audio: false

                });


            console.log(
                "CAMERA STREAM:",
                stream
            );


            // Put stream into video
            video.srcObject = stream;


            // Make video visible
            video.style.display = "block";


            await video.play();


            // Hide placeholder
            if (placeholder) {

                placeholder.style.display =
                    "none";

            }


            // Buttons
            startButton.disabled = true;

            stopButton.disabled = false;


            // Status
            statusText.textContent =
                "✅ Camera is working!";


            signName.textContent =
                "Hand detection ready ✋";


            confidence.textContent =
                "Show your hand clearly to the camera.";


            console.log(
                "CAMERA STARTED SUCCESSFULLY"
            );

        }


        catch (error) {

            console.error(
                "CAMERA ERROR:",
                error.name,
                error.message
            );


            startButton.disabled = false;


            // ==================================
            // DIFFERENT CAMERA ERRORS
            // ==================================

            if (
                error.name === "NotAllowedError"
            ) {

                statusText.innerHTML =
                    "🚫 Camera permission is blocked.<br>" +
                    "Click the 🔒 icon beside the website address and set Camera to Allow.";

                signName.textContent =
                    "Camera permission blocked";

                confidence.textContent =
                    "Then refresh this page and press Start Camera again.";

            }


            else if (
                error.name === "NotFoundError"
            ) {

                statusText.textContent =
                    "❌ No camera was found.";

                signName.textContent =
                    "Camera not found";

                confidence.textContent =
                    "Check that your computer has a working camera.";

            }


            else if (
                error.name === "NotReadableError"
            ) {

                statusText.textContent =
                    "❌ Camera is being used by another application.";

                signName.textContent =
                    "Camera busy";

                confidence.textContent =
                    "Close apps that may currently be using your camera.";

            }


            else if (
                error.name === "SecurityError"
            ) {

                statusText.textContent =
                    "🔒 Browser security blocked the camera.";

                signName.textContent =
                    "Security restriction";

                confidence.textContent =
                    "Make sure you are using the HTTPS GitHub Pages address.";

            }


            else if (
                error.name === "TypeError"
            ) {

                statusText.textContent =
                    "❌ Camera API unavailable.";

                signName.textContent =
                    "Invalid camera environment";

                confidence.textContent =
                    "Make sure the page is opened through HTTPS.";

            }


            else {

                statusText.textContent =
                    "❌ Camera error: " +
                    error.name;

                signName.textContent =
                    "Camera unavailable";

                confidence.textContent =
                    error.message ||
                    "Unknown camera error.";

            }

        }

    });



    // ==========================================
    // STOP CAMERA
    // ==========================================

    stopButton.addEventListener("click", () => {

        stopCamera();

    });



    function stopCamera() {

        if (stream) {

            stream
                .getTracks()
                .forEach(track => track.stop());

            stream = null;
        }


        video.srcObject = null;


        if (placeholder) {

            placeholder.style.display =
                "flex";

        }


        startButton.disabled = false;

        stopButton.disabled = true;


        statusText.textContent =
            "Camera is stopped.";


        signName.textContent =
            "Waiting...";


        confidence.textContent =
            "Press Start Camera to practice.";

    }



    // ==========================================
    // INITIAL STATE
    // ==========================================

    stopButton.disabled = true;

    video.style.display = "block";


    console.log(
        "Secure context:",
        window.isSecureContext
    );

    console.log(
        "MediaDevices:",
        navigator.mediaDevices
    );

});
```
