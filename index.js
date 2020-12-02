/* DOM setup */

const fileinput = document.getElementById('fileinput')

// Used to show the effects of the image edit
const canvas = document.getElementById('canvas')

//canvas.addEventListener('click', function(event) {
//  pick(event, selectedColor);
//});

// Get the 2d (as opposed to "3d") drawing context on the canvas, returns CanvasRenderingContext2D
const ctx = canvas.getContext('2d')

// Editors for the image
const blur = document.getElementById('blur')

// Set the listener for whenever one of the effect changes
blur_x.onchange = runPipeline
blur_y.onchange = runPipeline

/* Variables setup */

// Similar to document.createElement('img') except we don't need it on the document
const srcImage = new Image()

let imgData = null
let originalPixels = null
let currentPixels = null



/* DOM functions */

// When user selects a new image
fileinput.onchange = function (e) {

  // If it is valid
  if (e.target.files && e.target.files.item(0)) {

    // Set the src of the new Image() we created in javascript
    srcImage.src = URL.createObjectURL(e.target.files[0])
  }
}

srcImage.onload = function () {

  // Copy the image's dimensions to the canvas, which will show the preview of the edits
  canvas.width = srcImage.width
  canvas.height = srcImage.height

  // draw the image at with no offset (0,0) and with the same dimensions as the image
  ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)

  // Get an ImageData object representing the underlying pixel data for the area of the canvas
  imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)

  // .data gets the array of integers with 0-255 range, .slice returns a copy of the array 
  originalPixels = imgData.data.slice()

  canvas.addEventListener('click', function(event) {
    runPipeline(event)
  });
}



/* Filter functions */

// Transfers the changes we made to be displayed on the canvas
function commitChanges() {
  
  // Copy over the current pixel changes to the image
  for (let i = 0; i < imgData.data.length; i++) {
    imgData.data[i] = currentPixels[i]
  }

  // Update the 2d rendering canvas with the image we just updated so the user can see
  ctx.putImageData(imgData, 0, 0, 0, 0, srcImage.width, srcImage.height)
}

// Updates the canvas with the all of the filter changes
function runPipeline(event) {

  // Create a copy of the array of integers with 0-255 range 
  currentPixels = originalPixels.slice()

  // These represent the intensity of the filter, i.e. user wants it to be very red then it is a larger number

  const center_x = Math.floor(srcImage.width / 2)
  const center_y = Math.floor(srcImage.height / 2)

  //const picked_x = Number(blur_x.value)
  //const picked_y = Number(blur_y.value)
  var rect = canvas.getBoundingClientRect();
  const picked_x = event.clientX - rect.left;
  const picked_y = event.clientY - rect.top;
  
  console.log(picked_x, picked_y)
  var dist
  var radius

  // For every pixel of the src image
  for (let i = 0; i < srcImage.height; i++) {
    for (let j = 0; j < srcImage.width; j++) {
      
      // Do the effects
      dist = Math.hypot(picked_x - j, picked_y - i)
      radius = Math.floor(0.05 * dist)

      addBlur(j, i, radius)
    }
  }

  commitChanges()
}


/* Filter effects */

// The image is stored as a 1d array with red first, then green, and blue 
const R_OFFSET = 0
const G_OFFSET = 1
const B_OFFSET = 2

function addRed(x, y, value) {
  const index = getIndex(x, y) + R_OFFSET
  const currentValue = currentPixels[index]
  currentPixels[index] = clamp(currentValue + value)
}

function addGreen(x, y, value) {
  const index = getIndex(x, y) + G_OFFSET
  const currentValue = currentPixels[index]
  currentPixels[index] = clamp(currentValue + value)
}

function addBlue(x, y, value) {
  const index = getIndex(x, y) + B_OFFSET
  const currentValue = currentPixels[index]
  currentPixels[index] = clamp(currentValue + value)
}

function addBrightness(x, y, value) {
  addRed(x, y, value)
  addGreen(x, y, value)
  addBlue(x, y, value)
}

function setGrayscale(x, y) {
  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  const redValue = currentPixels[redIndex]
  const greenValue = currentPixels[greenIndex]
  const blueValue = currentPixels[blueIndex]

  const mean = (redValue + greenValue + blueValue) / 3

  currentPixels[redIndex] = clamp(mean)
  currentPixels[greenIndex] = clamp(mean)
  currentPixels[blueIndex] = clamp(mean)
}

function addBlur(x, y, r) {
  let average = (array) => array.reduce((a, b) => a + b) / array.length;

  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  var redCollect = []
  var greenCollect = []
  var blueCollect = []
  var ind

  var i_lower = Math.max(0, x-r)
  var i_upper = Math.min(srcImage.width, x + r + 1)
  var j_lower = Math.max(0, y-r)
  var j_upper = Math.min(srcImage.width, y + r + 1)

  for(var i=i_lower; i<i_upper; i++)
    for(var j=j_lower; j<j_upper; j++){
      ind = getIndex(i, j)
      redCollect.push(currentPixels[ind + R_OFFSET])
      greenCollect.push(currentPixels[ind + G_OFFSET])
      blueCollect.push(currentPixels[ind + B_OFFSET])
    }

  currentPixels[redIndex] = clamp(average(redCollect))
  currentPixels[greenIndex] = clamp(average(greenCollect))
  currentPixels[blueIndex] = clamp(average(blueCollect))
    
}

function addContrast(x, y, value) {
  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  const redValue = currentPixels[redIndex]
  const greenValue = currentPixels[greenIndex]
  const blueValue = currentPixels[blueIndex]

  // Goes from 0 to 2, where 0 to 1 is less contrast and 1 to 2 is more contrast
  const alpha = (value + 255) / 255 

  const nextRed = alpha * (redValue - 128) + 128
  const nextGreen = alpha * (greenValue - 128) + 128
  const nextBlue = alpha * (blueValue - 128) + 128

  currentPixels[redIndex] = clamp(nextRed)
  currentPixels[greenIndex] = clamp(nextGreen)
  currentPixels[blueIndex] = clamp(nextBlue)
}

/* Filter effects - helpers */

// Given the x, y index, return what position it should be in a 1d array
function getIndex(x, y) {
  return (x + y * srcImage.width) * 4
}

// Ensure value remain in RGB, 0 - 255
function clamp(value) {
  return Math.max(0, Math.min(Math.floor(value), 255))
}