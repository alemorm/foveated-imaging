/* DOM setup */

const fileinput = document.getElementById('fileinput')

// Used to show the effects of the image edit
// const canvas = document.getElementById('canvas')

//canvas.addEventListener('click', function(event) {
//  pick(event, selectedColor);
//});

// Get the 2d (as opposed to "3d") drawing context on the canvas, returns CanvasRenderingContext2D
// const ctx = canvas.getContext('2d')

// Editors for the image
// const blur = document.getElementById('blur')

// Set the listener for whenever one of the effect changes
// blur_x.onchange = runPipeline
// blur_y.onchange = runPipeline

/* Variables setup */

// Similar to document.createElement('img') except we don't need it on the document
// const srcImage = new Image()

var imgArray = new Array();
var ctxArray = new Array();
var canvasArray = new Array();
var pixelArray = new Array();

imgArray[0] = new Image()
canvasArray[0] = document.getElementById('canvas')
ctxArray[0] = canvasArray[0].getContext('2d')
// imgArray[0].src = '5.jpg';


for (let i = 1; i < 19; i++) {
  imgArray[i] = new Image();
  imgArray[i].src = 'preblur/5_' + i + '.jpg';
   
  // imgArray[i].src = 'preblur/5_1.jpg';
  imgArray[i].width = 256;
  imgArray[i].height = 256;
  canvasArray[i] = document.createElement('canvas');
  // canvasArray[i] = new OffscreenCanvas(256,256);
  // canvasArray[i].width = imgArray[i].width;
  // canvasArray[i].height = imgArray[i].height;
  ctxArray[i] = canvasArray[i].getContext('2d')
  // ctxArray[i].drawImage(imgArray[i], 0, 0, imgArray[i].width, imgArray[i].height);
  // pixelArray[i] = ctxArray[i].getImageData(0, 0, imgArray[i].width, imgArray[i].height)
  // pixelArray[i] = pixelArray[i].data.slice();
}

let imgData = null
let originalPixels = null
let currentPixels = null

// Initialize the old pixel position values
let old_bin_x = 0;
let old_bin_y = 0;
let bin_num = 4;
let fovea_radius = 0.05;


/* DOM functions */

// When user selects a new image
fileinput.onchange = function (e) {

  // If it is valid
  if (e.target.files && e.target.files.item(0)) {
    // Set the src of the new Image() we created in javascript
    // srcImage.src = URL.createObjectURL(e.target.files[0])
    imgArray[0].src = URL.createObjectURL(e.target.files[0])
  }
}

// srcImage.onload = function () {
for (let i = 0; i < 19; i++) {
  imgArray[i].onload = function () {
    // Copy the image's dimensions to the canvas, which will show the preview of the edits
    // canvas.width = srcImage.width
    // canvas.height = srcImage.height
    canvasArray[i].width = imgArray[i].width
    canvasArray[i].height = imgArray[i].height

    // draw the image at with no offset (0,0) and with the same dimensions as the image
    // ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)
    ctxArray[i].drawImage(imgArray[i], 0, 0, imgArray[i].width, imgArray[i].height)

    // Get an ImageData object representing the underlying pixel data for the area of the canvas
    // imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)
    pixelArray[i] = ctxArray[i].getImageData(0, 0, imgArray[i].width, imgArray[i].height)

    // .data gets the array of integers with 0-255 range, .slice returns a copy of the array 
    originalPixels = pixelArray[0].data.slice()


    canvas.addEventListener('mousemove', function(event) {
      runPipeline(event)
    });
  }
}



/* Filter functions */

// Transfers the changes we made to be displayed on the canvas
function commitChanges() {
  
  // Copy over the current pixel changes to the image
  // for (let i = 0; i < imgData.data.length; i++) {
    // imgData.data[i] = currentPixels[i]
  for (let i = 0; i < pixelArray[0].data.length; i++) {
    pixelArray[0].data[i] = currentPixels[i]
  }

  // Update the 2d rendering canvas with the image we just updated so the user can see
  // ctx.putImageData(imgData, 0, 0, 0, 0, srcImage.width, srcImage.height)
  ctxArray[0].putImageData(pixelArray[0], 0, 0, 0, 0, imgArray[0].width, imgArray[0].height)
}

// Updates the canvas with the all of the filter changes
function runPipeline(event) {

  // Create a copy of the array of integers with 0-255 range 
  currentPixels = originalPixels.slice()

  // These represent the intensity of the filter, i.e. user wants it to be very red then it is a larger number

  // const center_x = Math.floor(srcImage.width / 2)
  // const center_y = Math.floor(srcImage.height / 2)

  //const picked_x = Number(blur_x.value)
  //const picked_y = Number(blur_y.value)
  // var rect = canvas.getBoundingClientRect();
  var rect = canvasArray[0].getBoundingClientRect();
  const picked_x = event.clientX - rect.left;
  const picked_y = event.clientY - rect.top;
  
  console.log(picked_x, picked_y)
  var dist
  var radius
  var current_bin_x = Math.floor(picked_x/bin_num);
  var current_bin_y = Math.floor(picked_y/bin_num);

  if (current_bin_x != old_bin_x && current_bin_y != old_bin_y) {
    // Update the current bin
    old_bin_x = current_bin_x;
    old_bin_y = current_bin_y;

    // For every pixel of the src image
    for (let i = 0; i < imgArray[0].height; i++) {
      for (let j = 0; j < imgArray[0].width; j++) {
        
        // Do the effects
        dist = Math.hypot(picked_x - j, picked_y - i)
        radius = Math.floor(fovea_radius * dist)

        // if (i == 30 && j == 30) {
        //   console.log(i, j, dist, radius);
        // }

        addBlur(j, i, radius)
      }
    }

    commitChanges()
  }
}

/* Filter effects */

// The image is stored as a 1d array with red first, then green, and blue 
const R_OFFSET = 0
const G_OFFSET = 1
const B_OFFSET = 2

function addBlur(x, y, r) {
  let average = (array) => array.reduce((a, b) => a + b) / array.length;
  
  const xyposition = getIndex(x, y)
  const redIndex =  xyposition + R_OFFSET
  const greenIndex = xyposition + G_OFFSET
  const blueIndex = xyposition + B_OFFSET

  var redCollect = []
  var greenCollect = []
  var blueCollect = []

  var i_lower = Math.max(0, x-r)
  var i_upper = Math.min(imgArray[0].width, x + r + 1)
  var j_lower = Math.max(0, y-r)
  var j_upper = Math.min(imgArray[0].height, y + r + 1)

  // for(var i=i_lower; i<i_upper; i++)
  //   for(var j=j_lower; j<j_upper; j++){
  //     ind = getIndex(i, j)
  //     redCollect.push(currentPixels[ind + R_OFFSET])
  //     greenCollect.push(currentPixels[ind + G_OFFSET])
  //     blueCollect.push(currentPixels[ind + B_OFFSET])
  //   }
  
  //   redCollect.push(...currentPixels[binInds.map(function (num, idx) { return num + R_OFFSET; })])
  //   greenCollect.push(...currentPixels[binInds.map(function (num, idx) { return num + G_OFFSET; })])
  //   blueCollect.push(...currentPixels[binInds.map(function (num, idx) { return num + B_OFFSET; })])

  for(var i=i_lower; i<i_upper; i++){
    for(var j=j_lower; j<j_upper; j++){      
      redCollect.push(currentPixels[(i + j*256)*4 + R_OFFSET])
      greenCollect.push(currentPixels[(i + j*256)*4 + G_OFFSET])
      blueCollect.push(currentPixels[(i + j*256)*4 + B_OFFSET])
    }
  }
  
  currentPixels[redIndex] = clamp(average(redCollect))
  currentPixels[greenIndex] = clamp(average(greenCollect))
  currentPixels[blueIndex] = clamp(average(blueCollect))
    
}

// function maxPool(x, y, r) {
//   let average = (array) => array.reduce((a, b) => a + b) / array.length;
  
//   const xyposition = getIndex(x, y)
//   const redIndex =  xyposition + R_OFFSET
//   const greenIndex = xyposition + G_OFFSET
//   const blueIndex = xyposition + B_OFFSET

//   var redCollect = []
//   var greenCollect = []
//   var blueCollect = []
//   var ind

//   var i_lower = Math.max(0, x-r)
//   var i_upper = Math.min(srcImage.width, x + r + 1)
//   var j_lower = Math.max(0, y-r)
//   var j_upper = Math.min(srcImage.height, y + r + 1)

//   for(var i=i_lower; i<i_upper; i++)
//     for(var j=j_lower; j<j_upper; j++){
//       ind = getIndex(i, j)
//       redCollect.push(currentPixels[ind + R_OFFSET])
//       greenCollect.push(currentPixels[ind + G_OFFSET])
//       blueCollect.push(currentPixels[ind + B_OFFSET])
//     }

//   currentPixels[redIndex] = clamp(average(redCollect))
//   currentPixels[greenIndex] = clamp(average(greenCollect))
//   currentPixels[blueIndex] = clamp(average(blueCollect))
    
// }

/* Filter effects - helpers */

// Given the x, y index, return what position it should be in a 1d array
function getIndex(x, y) {
  // return (x + y * srcImage.width) * 4
  return (x + y * imgArray[0].width) * 4
}

// Given the x, y index, return what bin it should be in a 1d array
// function getbinIndex(i_lower, i_upper, j_lower, j_upper, j) {
//   let binxIndex = Array.from(Array(i_upper - i_lower), (num, index) => index + i_lower);
//   let binyIndex = Array(i_upper - i_lower).fill(j);
//   binyIndex = binyIndex.map(function(x) { return x * 256 * 4; });
//   let binxyIndex = binxIndex.map(function (num, idx) { return 4*num + binyIndex[idx]; });
//   return binxyIndex
// }

// Given the x, y index, return what bin it should be in a 1d array
function getbinIndex(i_lower, i_upper, j_lower, j_upper, j) {
  let binxIndex = Array.from(Array(i_upper - i_lower), (num, index) => index + i_lower);
  let binyIndex = Array(i_upper - i_lower).fill(j);
  binyIndex = binyIndex.map(function(x) { return x * 256 * 4; });
  let binxyIndex = binxIndex.map(function (num, idx) { return 4*num + binyIndex[idx]; });
  return binxyIndex
}

// Ensure value remain in RGB, 0 - 255
function clamp(value) {
  return Math.max(0, Math.min(Math.floor(value), 255))
}