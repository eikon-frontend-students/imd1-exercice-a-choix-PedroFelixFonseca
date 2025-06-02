const body = document.querySelector("body");
const scanResult = document.querySelector("#scan-result");
const backButton = document.querySelector("#back-button");
const reader = new Html5Qrcode("reader");

backButton.addEventListener("click", resetScanner);

function resetScanner() {
  body.classList.remove(["scanned"]);
  scanResult.textContent = "";
  reader.resume();
}

function onScanSuccess(decodedText, decodedResult) {
  console.log(`Scan result: ${decodedText}`, decodedResult);
  scanResult.textContent = decodedText;
  body.classList.add("scanned");
  reader.pause();
}

function startCamera(cameraId) {
  if (cameraId === "") return;

  if (reader.getState() === Html5QrcodeScannerState.SCANNING) {
    reader.stop();
  }

  // Remember in localstorage to autostart next time
  localStorage.setItem("cameraId", cameraId);

  reader
    .start(
      cameraId,
      {
        facingMode: "environment",
      },
      onScanSuccess
    )
    .catch((err) => {
      // Start failed, handle it.
      console.error("Error starting camera: ", err);
    });
}

// This method will trigger user permissions
Html5Qrcode.getCameras()
  .then((devices) => {
    /**
     * devices would be an array of objects of type:
     * { id: "id", label: "label" }
     */
    if (devices && devices.length) {
      const cameraSelect = document.querySelector("#camera-select");
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Choisissez une caméra";
      cameraSelect.appendChild(defaultOption);

      devices.forEach((device) => {
        const option = document.createElement("option");
        option.value = device.id;
        option.textContent = device.label;
        cameraSelect.appendChild(option);
      });

      // Set the default camera if available
      const savedCameraId = localStorage.getItem("cameraId");
      if (savedCameraId) {
        cameraSelect.value = savedCameraId;
        startCamera(savedCameraId);
      }

      cameraSelect.addEventListener("change", (event) => {
        const selectedCameraId = event.target.value;

        startCamera(selectedCameraId);
      });
    } else {
      console.error("No cameras found.");
    }
  })
  .catch((err) => {
    // handle err
    console.error("Error getting cameras: ", err);
  });

// === Photobooth ===
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const photo = document.getElementById("photo");
const snap = document.getElementById("snap");
const download = document.getElementById("download");
const filter = document.getElementById("filter");

// Accès à la webcam
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((error) => {
    console.error("Erreur d'accès à la webcam :", error);
  });

// Changer filtre
filter.addEventListener("change", () => {
  // video.style.filter = filter.value;
  video.dataset.theme = filter.value;
});

// Capture
snap.addEventListener("click", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.filter = filter.value;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataURL = canvas.toDataURL("image/png");
  photo.src = dataURL;
  // download.href = dataURL;
  // download.disabled = false;

  photo.dataset.theme = filter.value;
  console.log("Photo capturée avec le filtre :", filter.value);
});
