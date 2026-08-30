```javascript
document.addEventListener("DOMContentLoaded", function () {


    // =========================================
    // ELEMENTS
    // =========================================

    const video =
        document.getElementById("camera");

    const canvas =
        document.getElementById("output");

    const ctx =
        canvas.getContext("2d");


    const startButton =
        document.getElementById("startCamera");

    const stopButton =
        document.getElementById("stopCamera");


    const statusText =
        document.getElementById("status");

    const signName =
        document.getElementById("signName");

    const confidenceText =
        document.getElementById("confidence");


    const confidenceFill =
        document.getElementById("confidenceFill");

    const confidenceNumber =
        document.getElementById("confidenceNumber");


    const letterDisplay =
        document.getElementById("letterDisplay");


    const handStatus =
        document.getElementById("handStatus");


    const cameraStatus =
        document.getElementById("cameraStatus");


    const placeholder =
        document.getElementById("cameraPlaceholder");


    let stream = null;

    let cameraRunning = false;


    // =========================================
    // START CAMERA
    // =========================================

    startButton.addEventListener(
        "click",
        async function () {

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                statusText.textContent =
                    "Camera is not supported by this browser.";

                return;

            }


            try {

                statusText.textContent =
                    "Requesting camera permission...";


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


                video.srcObject = stream;


                await video.play();


                cameraRunning = true;


                placeholder.style.display =
                    "none";


                startButton.disabled =
                    true;

                stopButton.disabled =
                    false;


                cameraStatus.classList.remove(
                    "offline"
                );

                cameraStatus.classList.add(
                    "online"
                );


                cameraStatus.innerHTML =
                    '<span class="status-dot"></span> Online';


                statusText.textContent =
                    "✅ Camera is running. Show your hand.";


                signName.textContent =
                    "Looking for a sign...";


                confidenceText.textContent =
                    "Place your hand inside the guide.";


                handStatus.textContent =
                    "Searching...";


                letterDisplay.textContent =
                    "?";


                setConfidence(0);


                resizeCanvas();

            }

            catch (error) {

                console.error(error);


                statusText.textContent =
                    "❌ Camera permission was not granted.";


                signName.textContent =
                    "Camera unavailable";


                confidenceText.textContent =
                    "Allow camera access and try again.";


                handStatus.textContent =
                    "Unavailable";

            }

        }
    );



    // =========================================
    // STOP CAMERA
    // =========================================

    stopButton.addEventListener(
        "click",
        function () {

            cameraRunning = false;


            if (stream) {

                stream
                    .getTracks()
                    .forEach(function (track) {

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


            placeholder.style.display =
                "flex";


            startButton.disabled =
                false;

            stopButton.disabled =
                true;


            cameraStatus.classList.remove(
                "online"
            );

            cameraStatus.classList.add(
                "offline"
            );


            cameraStatus.innerHTML =
                '<span class="status-dot"></span> Offline';


            statusText.textContent =
                "Camera is stopped.";


            signName.textContent =
                "Waiting...";


            confidenceText.textContent =
                "Press Start Camera to practice.";


            handStatus.textContent =
                "Not detected";


            letterDisplay.textContent =
                "?";


            setConfidence(0);

        }
    );



    // =========================================
    // RESIZE CANVAS
    // =========================================

    function resizeCanvas() {

        if (
            video.videoWidth > 0 &&
            video.videoHeight > 0
        ) {

            canvas.width =
                video.videoWidth;

            canvas.height =
                video.videoHeight;

        }

    }



    // =========================================
    // MEDIAPIPE HANDS
    // =========================================

    const hands =
        new Hands({

            locateFile: function (file) {

                return (
                    "https://cdn.jsdelivr.net/npm/@mediapipe/hands/"
                    + file
                );

            }

        });


    hands.setOptions({

        maxNumHands: 1,

        modelComplexity: 1,

        minDetectionConfidence: 0.65,

        minTrackingConfidence: 0.65

    });



    // =========================================
    // HAND DETECTION RESULTS
    // =========================================

    hands.onResults(function (results) {

        if (!cameraRunning) {
            return;
        }


        resizeCanvas();


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        if (results.image) {

            ctx.drawImage(
                results.image,
                0,
                0,
                canvas.width,
                canvas.height
            );

        }



        // --------------------------------------
        // NO HAND
        // --------------------------------------

        if (
            !results.multiHandLandmarks ||
            results.multiHandLandmarks.length === 0
        ) {

            handStatus.textContent =
                "Not detected";


            signName.textContent =
                "No hand detected";


            confidenceText.textContent =
                "Move your hand clearly into the camera.";


            letterDisplay.textContent =
                "?";


            setConfidence(0);


            return;

        }



        // --------------------------------------
        // HAND FOUND
        // --------------------------------------

        const landmarks =
            results.multiHandLandmarks[0];


        handStatus.textContent =
            "Detected ✓";



        // --------------------------------------
        // DRAW LANDMARKS
        // --------------------------------------

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
                radius: 4

            }

        );



        // --------------------------------------
        // RECOGNIZE
        // --------------------------------------

        const result =
            recognizeSign(landmarks);


        letterDisplay.textContent =
            result.letter;


        signName.textContent =
            result.title;


        confidenceText.textContent =
            result.message;


        setConfidence(
            result.confidence
        );

    });



    // =========================================
    // SEND CAMERA TO MEDIAPIPE
    // =========================================

    async function processCamera() {

        if (
            cameraRunning &&
            video.readyState >= 2
        ) {

            try {

                await hands.send({
                    image: video
                });

            }

            catch (error) {

                console.error(
                    "Hand processing error:",
                    error
                );

            }

        }


        requestAnimationFrame(
            processCamera
        );

    }


    processCamera();



    // =========================================
    // CONFIDENCE BAR
    // =========================================

    function setConfidence(value) {

        value =
            Math.max(
                0,
                Math.min(
                    100,
                    Math.round(value)
                )
            );


        confidenceFill.style.width =
            value + "%";


        confidenceNumber.textContent =
            value + "%";

    }



    // =========================================
    // FINGER STATES
    // =========================================

    function getFingerStates(points) {


        return {

            index:
                fingerExtended(
                    points,
                    8,
                    6
                ),


            middle:
                fingerExtended(
                    points,
                    12,
                    10
                ),


            ring:
                fingerExtended(
                    points,
                    16,
                    14
                ),


            pinky:
                fingerExtended(
                    points,
                    20,
                    18
                ),


            thumb:
                thumbExtended(points)

        };

    }



    // =========================================
    // FINGER EXTENSION
    // =========================================

    function fingerExtended(
        points,
        tip,
        joint
    ) {

        return (
            distance(
                points[tip],
                points[0]
            ) >
            distance(
                points[joint],
                points[0]
            ) * 1.12
        );

    }



    // =========================================
    // THUMB
    // =========================================

    function thumbExtended(points) {

        return (
            distance(
                points[4],
                points[5]
            ) >
            distance(
                points[3],
                points[5]
            ) * 1.15
        );

    }



    // =========================================
    // DISTANCE
    // =========================================

    function distance(a, b) {

        const dx =
            a.x - b.x;

        const dy =
            a.y - b.y;

        const dz =
            a.z - b.z;


        return Math.sqrt(
            dx * dx +
            dy * dy +
            dz * dz
        );

    }



    // =========================================
    // HAND SHAPE RECOGNITION
    // =========================================

    function recognizeSign(points) {


        const fingers =
            getFingerStates(points);


        const extendedCount =
            [
                fingers.index,
                fingers.middle,
                fingers.ring,
                fingers.pinky
            ]
            .filter(Boolean)
            .length;



        // --------------------------------------
        // A
        // --------------------------------------

        if (
            !fingers.index &&
            !fingers.middle &&
            !fingers.ring &&
            !fingers.pinky &&
            fingers.thumb
        ) {

            return result(
                "A",
                82,
                "Possible A hand shape detected."
            );

        }



        // --------------------------------------
        // B
        // --------------------------------------

        if (
            fingers.index &&
            fingers.middle &&
            fingers.ring &&
            fingers.pinky &&
            !fingers.thumb
        ) {

            return result(
                "B",
                86,
                "Possible B hand shape detected."
            );

        }



        // --------------------------------------
        // D
        // --------------------------------------

        if (
            fingers.index &&
            !fingers.middle &&
            !fingers.ring &&
            !fingers.pinky
        ) {

            return result(
                "D",
                80,
                "Possible D hand shape detected."
            );

        }



        // --------------------------------------
        // L
        // --------------------------------------

        if (
            fingers.thumb &&
            fingers.index &&
            !fingers.middle &&
            !fingers.ring &&
            !fingers.pinky
        ) {

            return result(
                "L",
                90,
                "Possible L hand shape detected."
            );

        }



        // --------------------------------------
        // V
        // --------------------------------------

        if (
            fingers.index &&
            fingers.middle &&
            !fingers.ring &&
            !fingers.pinky
        ) {

            return result(
                "V",
                88,
                "Possible V hand shape detected."
            );

        }



        // --------------------------------------
        // W
        // --------------------------------------

        if (
            fingers.index &&
            fingers.middle &&
            fingers.ring &&
            !fingers.pinky
        ) {

            return result(
                "W",
                87,
                "Possible W hand shape detected."
            );

        }



        // --------------------------------------
        // Y
        // --------------------------------------

        if (
            fingers.thumb &&
            fingers.pinky &&
            !fingers.index &&
            !fingers.middle &&
            !fingers.ring
        ) {

            return result(
                "Y",
                90,
                "Possible Y hand shape detected."
            );

        }



        // --------------------------------------
        // I
        // --------------------------------------

        if (
            fingers.pinky &&
            !fingers.index &&
            !fingers.middle &&
            !fingers.ring
        ) {

            return result(
                "I",
                82,
                "Possible I hand shape detected."
            );

        }



        // --------------------------------------
        // F
        // --------------------------------------

        if (
            fingers.index &&
            fingers.middle &&
            !fingers.ring &&
            !fingers.pinky
        ) {

            const thumbIndex =
                distance(
                    points[4],
                    points[8]
                );


            if (thumbIndex < 0.12) {

                return result(
                    "F",
                    84,
                    "Possible F hand shape detected."
                );

            }

        }



        // --------------------------------------
        // O
        // --------------------------------------

        const thumbIndexDistance =
            distance(
                points[4],
                points[8]
            );


        if (
            thumbIndexDistance < 0.13 &&
            extendedCount >= 2
        ) {

            return result(
                "O",
                84,
                "Possible O hand shape detected."
            );

        }



        // --------------------------------------
        // OPEN HAND
        // --------------------------------------

        if (
            fingers.index &&
            fingers.middle &&
            fingers.ring &&
            fingers.pinky
        ) {

            return result(
                "B",
                72,
                "Open hand detected. Check the B position in the guide."
            );

        }



        // --------------------------------------
        // CLOSED HAND
        // --------------------------------------

        if (
            !fingers.index &&
            !fingers.middle &&
            !fingers.ring &&
            !fingers.pinky
        ) {

            return result(
                "A",
                65,
                "Closed hand detected. Compare with A, S and other closed-hand signs."
            );

        }



        // --------------------------------------
        // UNKNOWN
        // --------------------------------------

        return result(
            "?",
            35,
            "Hand detected. Match your fingers with the A–Z guide."
        );

    }



    // =========================================
    // RESULT
    // =========================================

    function result(
        letter,
        confidence,
        message
    ) {

        return {

            letter: letter,

            title:
                "Possible " +
                letter +
                " sign",

            confidence:
                confidence,

            message:
                message

        };

    }

});
```
