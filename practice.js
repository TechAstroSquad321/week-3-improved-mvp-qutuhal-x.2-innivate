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
    let running = false;
    let animationFrame = null;


    // ==========================================
    // CAMERA SUPPORT
    // ==========================================

    function checkCameraSupport() {

        if (!window.isSecureContext) {

            statusText.innerHTML =
                "🔒 Camera requires HTTPS.";

            statusText.className =
                "error";

            return false;
        }


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            statusText.textContent =
                "❌ Camera is not supported by this browser.";

            statusText.className =
                "error";

            return false;
        }


        return true;
    }


    // ==========================================
    // MEDIAPIPE
    // ==========================================

    const hands = new Hands({

        locateFile: (file) => {

            return (
                "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" +
                file
            );

        }

    });


    hands.setOptions({

        maxNumHands: 1,

        modelComplexity: 1,

        minDetectionConfidence: 0.6,

        minTrackingConfidence: 0.6

    });


    // ==========================================
    // HAND RESULTS
    // ==========================================

    hands.onResults((results) => {

        if (!running) {
            return;
        }


        if (!video.videoWidth) {
            return;
        }


        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;


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
                "Put your hand clearly in front of the camera.";

            return;
        }


        const landmarks =
            results.multiHandLandmarks[0];


        // Draw skeleton

        drawConnectors(
            ctx,
            landmarks,
            HAND_CONNECTIONS,
            {
                color: "#00ff88",
                lineWidth: 4
            }
        );


        drawLandmarks(
            ctx,
            landmarks,
            {
                color: "#ffffff",
                lineWidth: 2,
                radius: 5
            }
        );


        // Recognize

        const result =
            recognizeGesture(landmarks);


        signName.textContent =
            result.name;

        confidence.textContent =
            "Confidence: " +
            result.confidence +
            "%";
    });


    // ==========================================
    // DISTANCE
    // ==========================================

    function distance(a, b) {

        return Math.sqrt(

            Math.pow(a.x - b.x, 2) +
            Math.pow(a.y - b.y, 2)

        );
    }


    // ==========================================
    // BASIC HAND RECOGNITION
    // ==========================================

    function recognizeGesture(points) {

        /*
            MediaPipe landmarks:

            Index tip   = 8
            Index joint = 6

            Middle tip   = 12
            Middle joint = 10

            Ring tip   = 16
            Ring joint = 14

            Pinky tip   = 20
            Pinky joint = 18
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

        if (openCount === 4) {

            return {
                name: "✋ Open Hand",
                confidence: 95
            };
        }


        // ======================================
        // PEACE
        // ======================================

        if (
            indexOpen &&
            middleOpen &&
            !ringOpen &&
            !pinkyOpen
        ) {

            return {
                name: "✌️ Peace",
                confidence: 93
            };
        }


        // ======================================
        // ONE
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
        // FIST
        // ======================================

        if (openCount === 0) {

            return {
                name: "✊ Fist",
                confidence: 91
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

        if (!running) {
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
                "START CAMERA CLICKED"
            );


            if (!checkCameraSupport()) {
                return;
            }


            startButton.disabled =
                true;


            statusText.textContent =
                "📷 Asking for camera permission...";

            statusText.className = "";


            try {

                /*
                 * THIS MUST HAPPEN AFTER THE
                 * USER CLICKS THE BUTTON.
                 */

                stream =
                    await navigator.mediaDevices
                        .getUserMedia({

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
                    "Camera stream:",
                    stream
                );


                video.srcObject =
                    stream;


                await video.play();


                // Hide message

                placeholder.classList.add(
                    "hidden"
                );


                // Buttons

                startButton.disabled =
                    true;

                stopButton.disabled =
                    false;


                // Start recognition

                running = true;


                signName.textContent =
                    "🧠 Loading recognition...";

                confidence.textContent =
                    "Please wait.";


                statusText.textContent =
                    "🧠 Camera started. Recognition loading...";


                recognitionLoop();


                statusText.textContent =
                    "✅ Camera + recognition working!";

                statusText.className =
                    "success";


                signName.textContent =
                    "Show your hand ✋";

                confidence.textContent =
                    "Recognition is ready.";


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


                startButton.disabled =
                    false;


                stopButton.disabled =
                    true;


                if (
                    error.name ===
                    "NotAllowedError"
                ) {

                    statusText.innerHTML =
                        "🚫 Camera permission blocked.<br>" +
                        "Click the 🔒 icon beside the website address → Camera → Allow, then reload.";

                    signName.textContent =
                        "Permission required";

                    confidence.textContent =
                        "The browser must allow this website to use your camera.";

                }


                else if (
                    error.name ===
                    "NotFoundError"
                ) {

                    statusText.textContent =
                        "❌ No camera found.";

                    signName.textContent =
                        "Camera not found";

                    confidence.textContent =
                        "Check your computer's camera.";

                }


                else if (
                    error.name ===
                    "NotReadableError"
                ) {

                    statusText.textContent =
                        "❌ Camera is already being used.";

                    signName.textContent =
                        "Camera busy";

                    confidence.textContent =
                        "Close other apps using your camera.";

                }


                else if (
                    error.name ===
                    "SecurityError"
                ) {

                    statusText.textContent =
                        "🔒 Browser security blocked the camera.";

                    signName.textContent =
                        "Security error";

                    confidence.textContent =
                        "Make sure you're using the HTTPS GitHub Pages URL.";

                }


                else {

                    statusText.textContent =
                        "❌ Camera error: " +
                        error.name;

                    signName.textContent =
                        "Camera unavailable";

                    confidence.textContent =
                        error.message ||
                        "Unknown error.";

                }


                statusText.className =
                    "error";
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

        running = false;


        if (animationFrame) {

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame = null;
        }


        if (stream) {

            stream
                .getTracks()
                .forEach(track => {
                    track.stop();
                });

            stream = null;
        }


        video.srcObject = null;


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        placeholder.classList.remove(
            "hidden"
        );


        placeholder.innerHTML =
            "Camera stopped. Click <b>&nbsp;Start Camera&nbsp;</b> to start again.";


        startButton.disabled =
            false;

        stopButton.disabled =
            true;


        statusText.textContent =
            "Camera is stopped.";

        statusText.className = "";


        signName.textContent =
            "Waiting...";

        confidence.textContent =
            "Press Start Camera to begin.";
    }


    // ==========================================
    // STOP WHEN LEAVING PAGE
    // ==========================================

    window.addEventListener(
        "beforeunload",
        () => {

            if (stream) {

                stream
                    .getTracks()
                    .forEach(track => {
                        track.stop();
                    });
            }

        }
    );


    // ==========================================
    // INITIAL STATE
    // ==========================================

    stopButton.disabled =
        true;


    console.log(
        "SignLearn camera initialized."
    );

    console.log(
        "Secure context:",
        window.isSecureContext
    );

});
