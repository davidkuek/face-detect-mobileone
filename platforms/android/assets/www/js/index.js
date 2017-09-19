



document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    document.getElementById('openCamera').addEventListener('click',openCamera,false);
    
    
      
}

var ctrack = new clm.tracker({searchWindow : 15, stopOnConvergence : true, scoreThreshold : 0.3});
var imagePath;
var faceImage;
ctrack.init();




/* Cordova Camera */
function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        cameraDirection : Camera.Direction.FRONT,
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true,
        targetHeight : 266,
        targetWidth : 200,
        savedToPhotoAlbum : false
        
          
    };
    return options;
}

function openCamera(selection) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    // var func = createNewFileEntry;
    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        faceDetecting(imageUri);

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}




/* Face Detect Function */
function faceDetectStart(imageUri) {
  ctrack.start(faceImage);
  window.imagePath = imageUri; //declaring a global var.
}


/* Display the photo taken */
function faceDetecting(imageUri) {
    
    var cc = createCanvas();
    var img = new Image();
        img.onload = function() {
          cc.drawImage(img,0,0,200,266);
        };
    img.src = imageUri;
    faceDetectStart(imageUri);
}



function createCanvas() {
    var canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 266;
    canvas.id = "canvas";
    canvas.style.display = "none";
    document.getElementById('deviceready').appendChild(canvas);
    window.faceImage = document.getElementById('canvas');
    return canvas.getContext("2d");
}



/* Delete saved image  */
function deleteFile(imagePath){

var fileName = imagePath.substr(imagePath.lastIndexOf("cache/") + 6); //getting file
var path = imagePath.slice(0,imagePath.lastIndexOf(fileName)); //getting path without filename

window.resolveLocalFileSystemURL(path, function(dir) {
  dir.getFile(fileName, {create:false}, function(fileEntry) {
              fileEntry.remove(function(){
                console.log('file deleted');
                  
              },function(error){
                console.log('error of' + error.code);    
                  
              },function(){
                console.log('no file exist');
                 
              });
  });
});
}


/* Move files after camera success */
function moveFile(imagePath) {
    window.resolveLocalFileSystemURL(
          imagePath,

          function(fileEntry){
                newFileUri  = cordova.file.dataDirectory;
                oldFileUri  = imagePath;
                newFileName = oldFileUri.substr(oldFileUri.lastIndexOf("cache/") + 6);
                
                window.resolveLocalFileSystemURL(newFileUri,
                        function(dirEntry) {
                            // move the file to a new directory and rename it
                            fileEntry.moveTo(dirEntry, newFileName, successCallback, errorCallback);
                        },
                        errorCallback);
          },
          errorCallback);

  function successCallback(entry) {
    console.log("New Path: " + entry.fullPath);
  }

  function errorCallback(error) {
    console.log("Error:" + error.code);
  }   

}



/* handling face detect event listener from clmtrackr.js */
document.addEventListener("clmtrackrConverged", function(event) {
  var position = ctrack.getCurrentPosition();
  
  ctrack.stop(faceImage);
  moveFile(imagePath);
  alert('Face detected');
  console.log(position);
  ctrack.reset(faceImage);
  document.getElementById('deviceready').removeChild(canvas);
}, false);

document.addEventListener("clmtrackrNotFound", function(event) {
    var position = ctrack.getCurrentPosition();
    
    ctrack.stop(faceImage);
    deleteFile(imagePath);
    alert("Please try again.");
    console.log(position);
    ctrack.reset(faceImage);
    document.getElementById('deviceready').removeChild(canvas);
  }, false);

document.addEventListener("clmtrackrLost", function(event) {
  var position = ctrack.getCurrentPosition();
  
  ctrack.stop(faceImage);
  deleteFile(imagePath);
  alert("Please try again.");
  console.log(position);
  ctrack.reset(faceImage);
  document.getElementById('deviceready').removeChild(canvas);

}, false);