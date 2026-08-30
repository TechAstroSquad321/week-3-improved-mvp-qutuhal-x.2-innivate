```javascript
document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("camera");

    const startButton =
        document.getElementById("startCamera");

    const stopButton =
        document.getElementById("stopCamera");

    const statusText =
        document.getElementById("status");

    const signName =
        document.getElementById("signName");

    const confidence =
        document.getElementById("confidence");

    const placeholder =
        document.getElementById("cameraPlaceholder");

    const canvas =
        document.getElementById("handCanvas");

    const ctx =
        canvas.getContext("2d");


    let stream = null;
    let recognitionRunning = false;
    let animationFrame = null;


    // ==========================================
    // CAMERA SUPPORT
    // ==========================================

    function checkCameraSupport() {

        if (!window.isSecureContext) {

            statusText.innerHTML =
                "🔒 Camera requires HTTPS.<br>" +
                "Open the GitHub Pages HTTPS version.";

            signName.textContent =
                "Secure connection required";

            confidence.textContent =
                "Camera access is blocked on insecure pages.";

            statusText.className = "status error";

            return false;
        }


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            statusText.textContent =
                "❌ Camera API is unavailable.";

            signName.textContent =
                "Camera not supported";

            confidence.textContent =
                "Try the latest Chrome or Edge.";

            statusText.className = "status error";

            return false;
        }


        return true;
    }


    // ==========================================
    // MEDIAPIPE HAND MODEL
    // ==========================================

    const hands = new Hands({
        locateFile: (file) => {

            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

        }
    });


    hands.setOptions({

        maxNumHands: 1,

        modelComplexity: 1,

        minDetectionConfidence: 0.6,

        minTrackingConfidence: 0.6

    });


    // ==========================================
    // HAND RECOGNITION
    // ==========================================

    hands.onResults((results) => {

        if (!recognitionRunning) {
            return;
        }


        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // No hand
        if (
            !results.multiHandLandmarks ||
            results.multiHandLandmarks.length === 0
        ) {

            signName.textContent =
                "No hand detected";

            confidence.textContent =
                "Show your hand clearly to the camera.";

            return;
        }


        const landmarks =
            results.multiHandLandmarks[0];


        // Draw hand landmarks
        drawConnectors(
            ctx,
            landmarks,
            HAND_CONNECTIONS,
            {
                color: "#00ff88",
                lineWidth: 3
            }
        );


        drawLandmarks(
            ctx,
            landmarks,
            {
                color: "#ffffff",
                lineWidth: 1,
                radius: 4
            }
        );


        // Recognize gesture
        const result =
            recognizeGesture(landmarks);


        signName.textContent =
            result.name;

        confidence.textContent =
            `Confidence: ${result.confidence}%`;
    });


    // ==========================================
    // BASIC GESTURE RECOGNITION
    // ==========================================

    function distance(a, b) {

        return Math.sqrt(
            Math.pow(a.x - b.x, 2) +
            Math.pow(a.y - b.y, 2)
        );
    }


    function recognizeGesture(points) {

        /*
         * MediaPipe landmarks:
         *
         * Thumb:
         * 4 = tip
         *
         * Index:
         * 8 = tip
         * 6 = middle
         *
         * Middle:
         * 12 = tip
         * 10 = middle
         *
         * Ring:
         * 16 = tip
         * 14 = middle
         *
         * Pinky:
         * 20 = tip
         * 18 = middle
         */


        const indexOpen =
            points[8].y < points[6].y;

        const middleOpen =
            points[12].y < points[10].y;

        const ringOpen =
            points[16].y < points[14].y;

        const pinkyOpen =
            points[20].y < points[18].y;


        const openCount = [
            indexOpen,
            middleOpen,
            ringOpen,
            pinkyOpen
        ].filter(Boolean).length;


        // ======================================
        // OPEN HAND
        // ======================================

        if (openCount >= 4) {

            return {
                name: "✋ Open Hand",
                confidence: 96
            };
        }


        // ======================================
        // PEACE SIGN
        // ======================================

        if (
            indexOpen &&
            middleOpen &&
            !ringOpen &&
            !pinkyOpen
        ) {

            return {
                name: "✌️ Peace",
                confidence: 94
            };
        }


        // ======================================
        // FIST
        // ======================================

        if (openCount === 0) {

            return {
                name: "✊ Fist",
                confidence: 92
            };
        }


        // ======================================
        // ONE FINGER
        // ======================================

        if (
            indexOpen &&
            !middleOpen &&
            !ringOpen &&
            !pinkyOpen
        ) {

            return {
                name: "☝️ One",
                confidence: 90
            };
        }


        // ======================================
        // UNKNOWN
        // ======================================

        return {
            name: "🤔 Gesture not recognized",
            confidence: 60
        };
    }


    // ==========================================
    // RECOGNITION LOOP
    // ==========================================

    async function recognitionLoop() {

        if (!recognitionRunning) {
            return;
        }


        if (video.readyState >= 2) {

            try {

                await hands.send({
                    image: video
                });

            }

            catch (error) {

                console.error(
                    "Recognition error:",
                    error
                );
            }
        }


        animationFrame =
            requestAnimationFrame(
                recognitionLoop
            );
    }


    // ==========================================
    // START CAMERA
    // ==========================================

    startButton.addEventListener(
        "click",
        async () => {

            console.log(
                "START CAMERA BUTTON CLICKED"
            );


            startButton.disabled = true;


            statusText.textContent =
                "📷 Checking camera access...";

            statusText.className =
                "status";


            if (!checkCameraSupport()) {

                startButton.disabled = false;

                return;
            }


            try {

                statusText.textContent =
                    "📷 Asking for camera permission...";


                /*
                 * IMPORTANT:
                 *
                 * getUserMedia is called directly
                 * because the user clicked the button.
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


                // Put camera stream into video

                video.srcObject =
                    stream;


                video.style.display =
                    "block";


                await video.play();


                // Hide placeholder

                if (placeholder) {

                    placeholder.classList.add(
                        "hidden"
                    );
                }


                // Buttons

                startButton.disabled =
                    true;

                stopButton.disabled =
                    false;


                // Start recognition

                recognitionRunning =
                    true;


                signName.textContent =
                    "Loading hand recognition...";


                confidence.textContent =
                    "Please wait...";


                statusText.textContent =
                    "🧠 Camera started. Loading recognition...";


                await new Promise(
                    resolve =>
                        setTimeout(resolve, 500)
                );


                recognitionLoop();


                statusText.textContent =
                    "✅ Camera + recognition working!";

                statusText.className =
                    "status success";


                signName.textContent =
                    "Show your hand ✋";

                confidence.textContent =
                    "Recognition is ready.";


                console.log(
                    "CAMERA AND RECOGNITION STARTED"
                );

            }


            catch (error) {

                console.error(
                    "CAMERA ERROR:",
                    error.name,
                    error.message
                );


                startButton.disabled =
                    false;

                stopButton.disabled =
                    true;


                if (
                    error.name ===
                    "NotAllowedError"
                ) {

                    statusText.innerHTML =
                        "🚫 Camera permission is blocked.<br>" +
                        "Click the 🔒 icon beside the website address and set Camera to Allow.";

                    signName.textContent =
                        "Camera permission blocked";

                    confidence.textContent =
                        "Then refresh the page and press Start Camera again.";

                }


                else if (
                    error.name ===
                    "NotFoundError"
                ) {

                    statusText.textContent =
                        "❌ No camera was found.";

                    signName.textContent =
                        "Camera not found";

                    confidence.textContent =
                        "Check that your computer has a working camera.";

                }


                else if (
                    error.name ===
                    "NotReadableError"
                ) {

                    statusText.textContent =
                        "❌ Camera is being used by another application.";

                    signName.textContent =
                        "Camera busy";

                    confidence.textContent =
                        "Close other apps using the camera.";

                }


                else if (
                    error.name ===
                    "SecurityError"
                ) {

                    statusText.textContent =
                        "🔒 Browser security blocked the camera.";

                    signName.textContent =
                        "Security restriction";

                    confidence.textContent =
                        "Make sure you are using your HTTPS GitHub Pages URL.";

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


                statusText.className =
                    "status error";
            }

        }
    );


    // ==========================================
    // STOP CAMERA
    // ==========================================

    stopButton.addEventListener(
        "click",
        stopCamera
    );


    function stopCamera() {

        console.log(
            "STOP CAMERA"
        );


        recognitionRunning =
            false;


        if (animationFrame) {

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame =
                null;
        }


        if (stream) {

            stream
                .getTracks()
                .forEach(track => {
                    track.stop();
                });

            stream = null;
        }


        video.srcObject =
            null;


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        if (placeholder) {

            placeholder.classList.remove(
                "hidden"
            );

            placeholder.innerHTML =
                "Camera stopped. Click <b>&nbsp;Start Camera&nbsp;</b> to start again.";
        }


        startButton.disabled =
            false;

        stopButton.disabled =
            true;


        statusText.textContent =
            "Camera is stopped.";

        statusText.className =
            "status";


        signName.textContent =
            "Waiting...";

        confidence.textContent =
            "Press Start Camera to practice.";
    }


    // ==========================================
    // INITIAL STATE
    // ==========================================

    stopButton.disabled =
        true;

    video.style.display =
        "block";


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
