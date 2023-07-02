// JavaScript code to access the camera and scan QR codes

// Select DOM elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const textArea = document.getElementById('textArea');
const copyBtn = document.querySelector('.copy');
const closeBtn = document.querySelector('.close');
const switchBtn = document.querySelector('.switch');
const wrapper = document.querySelector('.wrapper');

let currentCamera = 'environment'; // Default to back camera

// Check if the device supports mediaDevices.getUserMedia
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  // Request access to the cameras
  navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      const cameras = devices.filter(device => device.kind === 'videoinput');
      if (cameras.length === 0) {
        console.error('No cameras found');
      } else {
        // Use the first camera (usually the back camera)
        const cameraId = cameras[0].deviceId;
        startCamera(cameraId);
      }
    })
    .catch(function (error) {
      console.error('Error accessing cameras: ', error);
    });
} else {
  console.error('getUserMedia is not supported by this browser');
}

// Function to start the camera stream
function startCamera(cameraId) {
  const constraints = { video: { deviceId: cameraId } };
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
      // Set the video source and start streaming
      video.srcObject = stream;
      video.play();
    })
    .catch(function (error) {
      console.error('Unable to access the camera: ', error);
    });
}

// Function to switch the camera
function switchCamera() {
  stopCamera();
  
  const facingMode = currentCamera === 'environment' ? 'user' : 'environment';
  const constraints = { video: { facingMode } };
  
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
      // Set the video source and start streaming
      video.srcObject = stream;
      video.play();
      currentCamera = facingMode === 'user' ? 'user' : 'environment';
    })
    .catch(function (error) {
      console.error('Unable to switch camera: ', error);
    });
}

// Function to scan the QR code from the camera feed
function scanQRCode() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert',
  });

  if (code) {
    textArea.innerText = code.data;
    wrapper.classList.add('active');
  }

  requestAnimationFrame(scanQRCode);
}

// Function to stop the camera stream
function stopCamera() {
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());
}

// Start scanning the QR code
video.addEventListener('loadedmetadata', function () {
  scanQRCode();
});

// Copy text to clipboard
copyBtn.addEventListener('click', () => {
  const text = textArea.textContent;
  navigator.clipboard.writeText(text);
  createNotification('Copied to clipboard');
});

// Close the QR code details
closeBtn.addEventListener('click', () => {
  stopCamera();
  wrapper.classList.remove('active');
  setTimeout(() => {
    window.location.reload();
  }, 550);
});

// Event listener for switching the camera
switchBtn.addEventListener('click', switchCamera);

// Function to create notification
function createNotification(message) {
  const toastContainer = document.getElementById('toasts');
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
