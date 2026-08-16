const video = document.getElementById("camera");
const canvas = document.getElementById("output");

const startButton = document.getElementById("startCamera");
const stopButton = document.getElementById("stopCamera");

const statusText = document.getElementById("status");
const signName = document.getElementById("signName");
const confidence = document.getElementById("confidence");

let camera = null;


// -----------------------------
// START CAMERA
// -----------------------------

startButton.addEventListener("click", async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });

        video.srcObject = stream;

        statusText.textContent = "Camera started. Show your hand!";

        startHandTracking();

    } catch (error) {

        console.error(error);

        statusText.textContent =
            "Camera access was denied or is unavailable.";

    }

});


// -----------------------------
// STOP CAMERA
// -----------------------------

stopButton.addEventListener("click", () => {

    if (video.srcObject) {

        const tracks = video.srcObject.getTracks();

        tracks.forEach(track => track.stop());

        video.srcObject = null;

    }

    statusText.textContent = "Camera stopped.";

    signName.textContent = "Waiting...";

    confidence.textContent =
        "Start the camera to practice.";

});


// -----------------------------
// HAND TRACKING
// -----------------------------

function startHandTracking() {

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


    hands.onResults((results) => {

        if (
            !results.multiHandLandmarks ||
            results.multiHandLandmarks.length === 0
        ) {

            signName.textContent = "No hand detected";

            confidence.textContent =
                "Place your hand in front of the camera.";

            return;

        }


        const landmarks =
            results.multiHandLandmarks[0];


        const pattern =
            detectHandPattern(landmarks);


        signName.textContent = pattern.name;

        confidence.textContent =
            pattern.message;

    });


    camera = new Camera(video, {

        onFrame: async () => {

            await hands.send({
                image: video
            });

        },

        width: 640,

        height: 480

    });


    camera.start();

}


// -----------------------------
// BASIC HAND PATTERN DETECTION
// -----------------------------

function detectHandPattern(landmarks) {

    /*
        MediaPipe gives us 21 points
        on the hand.

        We check whether the fingers
        are extended or folded.
    */


    const fingers = [

        // Index finger
        landmarks[8].y < landmarks[6].y,

        // Middle finger
        landmarks[12].y < landmarks[10].y,

        // Ring finger
        landmarks[16].y < landmarks[14].y,

        // Pinky
        landmarks[20].y < landmarks[18].y

    ];


    const extended =
        fingers.filter(Boolean).length;


    // OPEN PALM

    if (extended >= 4) {

        return {

            name: "Open Palm ✋",

            message:
                "Hand detected • Open-hand pattern"

        };

    }


    // FIST

    if (extended === 0) {

        return {

            name: "Fist ✊",

            message:
                "Hand detected • Closed-hand pattern"

        };

    }


    // OTHER PATTERN

    return {

        name: "Hand Pattern Detected 🤚",

        message:
            `${extended} finger(s) appear extended`

    };

}
