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
let integralImage = null


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
  console.log(srcImage.width, srcImage.height)

  // draw the image at with no offset (0,0) and with the same dimensions as the image
  ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)

  // Get an ImageData object representing the underlying pixel data for the area of the canvas
  imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)

  // .data gets the array of integers with 0-255 range, .slice returns a copy of the array 
  originalPixels = imgData.data.slice()
  
  getIntegral()

  canvas.addEventListener('click', function(event) {
    runPipeline(event)
  });
}

function getIntegral() {

  // Create a copy of the array of integers with 0-255 range
  integralImage =  new Array(srcImage.height * srcImage.width);
  for(let i=0; i<srcImage.height * srcImage.width; i++){
    integralImage[i] = originalPixels[i]
  }

  for (let i = 1; i < srcImage.width; i++){
    ind = getIndex(i, 0)
    ind2 = getIndex(i-1, 0)
    integralImage[ind + R_OFFSET] = originalPixels[ind + R_OFFSET] + integralImage[ind2 + R_OFFSET]
    integralImage[ind + G_OFFSET] = originalPixels[ind + G_OFFSET] + integralImage[ind2 + G_OFFSET]
    integralImage[ind + B_OFFSET] = originalPixels[ind + B_OFFSET] + integralImage[ind2 + B_OFFSET]
  }
  for (let j = 1; j < srcImage.height; j++){
    ind = getIndex(0, j)
    ind2 = getIndex(0, j-1)
    integralImage[ind + R_OFFSET] = originalPixels[ind + R_OFFSET] + integralImage[ind2 + R_OFFSET]
    integralImage[ind + G_OFFSET] = originalPixels[ind + G_OFFSET] + integralImage[ind2 + G_OFFSET]
    integralImage[ind + B_OFFSET] = originalPixels[ind + B_OFFSET] + integralImage[ind2 + B_OFFSET]
  }

  for (let i = 1; i < srcImage.width; i++) {
    for (let j = 1; j < srcImage.height; j++) {
      ind = getIndex(i, j)
      ind2 = getIndex(i-1, j)
      ind3 = getIndex(i, j-1)
      ind4 = getIndex(i-1, j-1)
      integralImage[ind + R_OFFSET] = originalPixels[ind + R_OFFSET] + integralImage[ind2 + R_OFFSET] + integralImage[ind3 + R_OFFSET] - integralImage[ind4 + R_OFFSET]
      integralImage[ind + G_OFFSET] = originalPixels[ind + G_OFFSET] + integralImage[ind2 + G_OFFSET] + integralImage[ind3 + G_OFFSET] - integralImage[ind4 + G_OFFSET]
      integralImage[ind + B_OFFSET] = originalPixels[ind + B_OFFSET] + integralImage[ind2 + B_OFFSET] + integralImage[ind3 + B_OFFSET] - integralImage[ind4 + B_OFFSET]
    }
  }

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


function addBlur(x, y, r) {
  let average = (array) => array.reduce((a, b) => a + b) / array.length;

  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  var redCollect = []
  var greenCollect = []
  var blueCollect = []
  var ind

  var i_lower = clamp_edges(x - r, srcImage.width - 1)
  var i_upper = clamp_edges(x + r, srcImage.width - 1)
  var j_lower = clamp_edges(y - r, srcImage.height - 1)
  var j_upper = clamp_edges(y + r, srcImage.height - 1)
  var area = (j_upper - j_lower + 1) * (i_upper - i_lower + 1)

  sum = getArea(i_lower, i_upper, j_lower, j_upper, area)
  currentPixels[redIndex] = clamp(sum.red / area)
  currentPixels[greenIndex] = clamp(sum.green / area)
  currentPixels[blueIndex] = clamp(sum.blue / area)
  
    
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

function clamp_edges(value, edge) {
  return Math.max(1, Math.min(Math.floor(value), edge))
}

function getArea(i_lower, i_upper, j_lower, j_upper, area){
  var red
  var green
  var blue
  ind_1 = getIndex(i_lower - 1, j_lower - 1)
  ind_2 = getIndex(i_upper, j_upper)
  ind_3 = getIndex(i_lower - 1, j_upper)
  ind_4 = getIndex(i_upper, j_lower - 1)
  var sum = {
    red: integralImage[ind_1 + R_OFFSET] + integralImage[ind_2 + R_OFFSET] - integralImage[ind_4 + R_OFFSET] - integralImage[ind_3 + R_OFFSET],
    green: integralImage[ind_1 + G_OFFSET] + integralImage[ind_2 + G_OFFSET] - integralImage[ind_4 + G_OFFSET] - integralImage[ind_3 + G_OFFSET],
    blue: integralImage[ind_1 + B_OFFSET] + integralImage[ind_2 + B_OFFSET] - integralImage[ind_4 + B_OFFSET] - integralImage[ind_3 + B_OFFSET]
  }
  return sum
}
