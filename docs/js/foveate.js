/* DOM setup */

// Get file input element
const fileinput = document.getElementById('fileinput')

// Get interpolation switch element
const interpswitch = document.getElementById('interpswitch')

// Used to show the effects of the image edit
const canvas = document.getElementById('canvas')

// Get the 2d (as opposed to "3d") drawing context on the canvas, returns CanvasRenderingContext2D
const ctx = canvas.getContext('2d')

/* Variables setup */

// Similar to document.createElement('img') except we don't need it on the document
const srcImage = new Image()

let imgData = null
let originalPixels = null
let currentPixels = null
let integralImage = null
let foveatedradius = 0.02
var useInterp = Boolean(false)

// The image is stored as a 1d array with red first, then green, and blue (with alpha values after)
const R_OFFSET = 0
const G_OFFSET = 1
const B_OFFSET = 2

// Pixel gap between images and text
let imagegap = 10
let textgap = 50

/* DOM functions */

// When user selects a new image
fileinput.onchange = function (e) {

  // If it is valid
  if (e.target.files && e.target.files.item(0)) {

    // Set the src of the new Image() we created in javascript
    srcImage.src = URL.createObjectURL(e.target.files[0])
  }
}

// When user changes the interpolation
interpswitch.onchange = function () {
  // Check the state of the interpolation switch
  if (this.checked) {
    useInterp = Boolean(true)
  } else {
    useInterp = Boolean(false)
  }
}

srcImage.onload = function () {

  // Copy the image's dimensions to the canvas, which will show the preview of the edits
  canvas.width = 2*srcImage.width + imagegap
  canvas.height = srcImage.height + textgap
  
  // Aling text to center of image
  ctx.textAlign = "center";
  ctx.textBaseline = "top"

  // Set the canvas font
  ctx.font = textgap*0.5 + "px montserrat"

  // Label the original image
  ctx.fillText("Foveated Image", srcImage.width/2, textgap*0.2)
  
  // Label the original image
  ctx.fillText("Log-Polar Image", 3*srcImage.width/2 + imagegap, textgap*0.2)

  // draw the image at with no offset (0,0) and with the same dimensions as the image
  ctx.drawImage(srcImage, 0, textgap, srcImage.width, srcImage.height + textgap)

  // Get an ImageData object representing the underlying pixel data for the area of the canvas
  imgData = ctx.getImageData(0, textgap, srcImage.width, srcImage.height)
  
  // .data gets the array of integers with 0-255 range, .slice returns a copy of the array 
  originalPixels = imgData.data.slice()

  getIntegral()

  showlogPolar()

  canvas.addEventListener('mousemove', function(event) {
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

function showlogPolar() {

  // Create a copy of the array of integers with 0-255 range 
  currentlogPixels = imgData.data.slice()

  // Create transparent (alpha=0) black image data object with same dimensions
  logImage = new ImageData(srcImage.width, srcImage.height)

  // Define log-polar range of distance values
  // logpolarExp = Math.log(srcImage.width/2)/(srcImage.width/2)
  // logpolarRange = Array.from(Array(srcImage.width/2), (num, index) => 2**index);

  const center_x = Math.floor(srcImage.width/2)
  const center_y = Math.floor(srcImage.height/2)

  console.log(srcImage.width, srcImage.height)
  console.log(center_x, center_y)

  // Reset the alpha values to fully opaque for the pixels
  for (let i = 0; i < logImage.data.length; i+=4) {
    logImage.data[i + 3] = 255
  }

  for (let i = 0; i < srcImage.width; i++) {
    for (let j = 0; j < srcImage.height; j++) {
      logpolar_ij = cartesian2logPolar(i, j, center_x, center_y)
      logpolarind = getIndex(logpolar_ij.i, logpolar_ij.j)
      ind = getIndex(i,j)
      // if ((i <= (center_x + 1) && j <= (center_y + 1)) && (i >= (center_x - 1) && j >= (center_y - 1))) {
      if ((i == center_x) && (j == center_y)) {
        centerind = getIndex(0, srcImage.height-1)
        logImage.data[centerind + R_OFFSET] = currentlogPixels[ind + R_OFFSET]
        logImage.data[centerind + G_OFFSET] = currentlogPixels[ind + G_OFFSET]
        logImage.data[centerind + B_OFFSET] = currentlogPixels[ind + B_OFFSET]
      } else {
        logImage.data[logpolarind + R_OFFSET] = currentlogPixels[ind + R_OFFSET]
        logImage.data[logpolarind + G_OFFSET] = currentlogPixels[ind + G_OFFSET]
        logImage.data[logpolarind + B_OFFSET] = currentlogPixels[ind + B_OFFSET]
      }
    }
  }

  // draw the image at canvas with offset (srcImage.width + imagegap, srcImage.height)
  ctx.putImageData(logImage, logImage.width + imagegap, textgap, 0, 0, logImage.width, logImage.height)
}
/* Filter functions */

// Transfers the changes we made to be displayed on the canvas
function commitChanges() {
  
  // Copy over the current pixel changes to the image
  for (let i = 0; i < imgData.data.length; i++) {
    imgData.data[i] = currentPixels[i]
  }

  // Update the 2d rendering canvas with the image we just updated so the user can see
  ctx.putImageData(imgData, 0, textgap, 0, 0, srcImage.width, srcImage.height)
}

// Updates the canvas with the all of the filter changes
function runPipeline(event) {
  var rect = canvas.getBoundingClientRect();
  const picked_x = event.clientX - rect.left;
  const picked_y = event.clientY - (rect.top + textgap);

  // Make sure the foveating happens only on the image
  if (picked_x > srcImage.width || picked_y < 0) {
    return
  }

  // Create a copy of the array of integers with 0-255 range 
  currentPixels = originalPixels.slice()
  
  var dist, radius

  // For every pixel of the src image
  for (let i = 0; i < srcImage.width; i++) {
    for (let j = 0; j < srcImage.height; j++) {
      redIndex = getIndex(i, j) + R_OFFSET
      greenIndex = getIndex(i, j) + G_OFFSET
      blueIndex = getIndex(i, j) + B_OFFSET

      // Get cursor distance
      dist = Math.hypot(picked_x - i, picked_y - j)
      radius = Math.floor(foveatedradius * dist)

      if (useInterp) {
        addinterpBlur(i, j, radius, dist)
      } else {
        addBlur(i, j, radius)
      } 
    }
  }

  commitChanges()
}

/* Filter effects */

// Fast blurring
function addBlur(x, y, r) {
  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  var i_lower = clamp_edges(x - r, srcImage.width - 1)
  var i_upper = clamp_edges(x + r, srcImage.width - 1)
  var j_lower = clamp_edges(y - r, srcImage.height - 1)
  var j_upper = clamp_edges(y + r, srcImage.height - 1)
  var area = (j_upper - j_lower + 1)*(i_upper - i_lower + 1)
  
  sum = getArea(i_lower, i_upper, j_lower, j_upper)

  currentPixels[redIndex] = clamp(sum.red/area)
  currentPixels[greenIndex] = clamp(sum.green/area)
  currentPixels[blueIndex] = clamp(sum.blue/area)
}

// Interpolated blurring (slower)
function addinterpBlur(x, y, r, dist) {
  
  // Distance difference from fovea
  diff = foveatedradius*dist - r

  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  var i_lower_1 = clamp_edges(x - r, srcImage.width - 1)
  var i_upper_1 = clamp_edges(x + r, srcImage.width - 1)
  var j_lower_1 = clamp_edges(y - r, srcImage.height - 1)
  var j_upper_1 = clamp_edges(y + r, srcImage.height - 1)
  var area_1 = (j_upper_1 - j_lower_1 + 1)*(i_upper_1 - i_lower_1 + 1)
  
  var i_lower_2 = clamp_edges(x - (r + 1), srcImage.width - 1)
  var i_upper_2 = clamp_edges(x + (r + 1), srcImage.width - 1)
  var j_lower_2 = clamp_edges(y - (r + 1), srcImage.height - 1)
  var j_upper_2 = clamp_edges(y + (r + 1), srcImage.height - 1)
  var area_2 = (j_upper_2 - j_lower_2 + 1)*(i_upper_2 - i_lower_2 + 1)

  sum_1 = getArea(i_lower_1, i_upper_1, j_lower_1, j_upper_1)
  sum_2 = getArea(i_lower_2, i_upper_2, j_lower_2, j_upper_2)

  currentPixels[redIndex] = (1 - diff)*clamp(sum_1.red/area_1) + diff*clamp(sum_2.red/area_2)
  currentPixels[greenIndex] = (1 - diff)*clamp(sum_1.green/area_1) + diff*clamp(sum_2.green/area_2)
  currentPixels[blueIndex] = (1 - diff)*clamp(sum_1.blue/area_1) + diff*clamp(sum_2.blue/area_2)
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

function getArea(i_lower, i_upper, j_lower, j_upper){
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

// Log Polar Transform
function cartesian2logPolar(x, y, center_x, center_y) {
  x_pos = center_x - x
  y_pos = center_y - y

  // Logarithmic (base e) radial distance from image center
  r = Math.sqrt(x_pos**2 + y_pos**2)
  rmin = 1
  rmax = Math.sqrt((srcImage.width/2)**2 + (srcImage.height/2)**2)
  k = (srcImage.width - 1)/Math.log(rmax/rmin)
  i = Math.floor(k*Math.log(r/rmin))
  
  // Theta angle in radians
  theta = Math.atan2(y_pos, x_pos)
  if (theta < 0) {
    j = Math.floor(((theta + Math.PI)/Math.PI)*srcImage.height/2) + srcImage.height/2
  } else {
    j = Math.floor((theta/Math.PI)*srcImage.height/2)
  }
  logpolar_ij = { i:i, j:j }
  return logpolar_ij
}