/* =========================================
   SIGNLEARN — CAMERA SYSTEM
   ========================================= */

const camera = document.getElementById("camera");

const startButton =
    document.getElementById("startCamera");

const stopButton =
    document.getElementById("stopCamera");

const statusMessage =
    document.getElementById("status");

const placeholder =
    document.getElementById("cameraPlaceholder");

const indicator =
    document.getElementById("cameraIndicator");

const cameraCard =
    document.querySelector(".camera-card");


let cameraStream = null;


/* =========================================
   STATUS FUNCTION
   ========================================= */

function setStatus(message) {
    if (statusMessage) {
        statusMessage.textContent = message;
    }
}


/* =========================================
   START CAMERA
   ========================================= */

async function startCamera() {

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        setStatus(
            "Your browser does not support camera access."
        );

        return;
    }


    setStatus(
        "Requesting camera permission..."
    );

    startButton.disabled = true;


    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: {
                        ideal: 1280
                    },
                    height: {
                        ideal: 720
                    }
                },

                audio: false
            });


        camera.srcObject = cameraStream;


        camera.style.display = "block";

        placeholder.style.display = "none";


        await camera.play();


        stopButton.disabled = false;


        cameraCard.classList.add(
            "camera-active"
        );


        indicator.innerHTML =
            "<span></span> Camera On";


        setStatus(
            "Camera is ready! Position your hand inside the frame."
        );

    }

    catch (error) {

        console.error(
            "Camera error:",
            error
        );


        startButton.disabled = false;


        cameraCard.classList.remove(
            "camera-active"
        );


        if (error.name === "NotAllowedError") {

            setStatus(
                "Camera permission was blocked. Click the camera icon 🔒 in your browser's address bar and allow camera access, then try again."
            );

        }

        else if (error.name === "NotFoundError") {

            setStatus(
                "No camera was found on this device."
            );

        }

        else if (error.name === "NotReadableError") {

            setStatus(
                "Your camera is being used by another application. Close other camera apps and try again."
            );

        }

        else if (error.name === "SecurityError") {

            setStatus(
                "The browser blocked camera access for security reasons."
            );

        }

        else {

            setStatus(
                "Could not start the camera. Please check your browser camera permissions."
            );
        }

    }

}


/* =========================================
   STOP CAMERA
   ========================================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => {
                track.stop();
            });

        cameraStream = null;
    }


    camera.srcObject = null;

    camera.style.display = "none";

    placeholder.style.display = "flex";


    startButton.disabled = false;

    stopButton.disabled = true;


    cameraCard.classList.remove(
        "camera-active"
    );


    indicator.innerHTML =
        "<span></span> Camera Off";


    setStatus(
        "Camera is currently off."
    );
}


/* =========================================
   BUTTON EVENTS
   ========================================= */

startButton.addEventListener(
    "click",
    startCamera
);

stopButton.addEventListener(
    "click",
    stopCamera
);


/* =========================================
   PAGE CLEANUP
   ========================================= */

window.addEventListener(
    "beforeunload",
    stopCamera
);
