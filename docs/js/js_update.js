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

  var dist, radius, diff
  var redIndex, greenIndex, blueIndex

  // For every pixel of the src image
  for (let i = 0; i < srcImage.widtt; i++) {
    for (let j = 0; j < srcImage.height; j++) {
      redIndex = getIndex(i, j) + R_OFFSET
      greenIndex = getIndex(i, j) + G_OFFSET
      blueIndex = getIndex(i, j) + B_OFFSET
      
      // Get distance from cursor
      dist = Math.hypot(picked_x - i, picked_y - j)
      radius = Math.floor(0.05 * dist)
      diff = 0.05 * dist - radius

      sum_1 = addBlur(i, j, radius)
      sum_2 = addBlur(i, j, radius + 1)

      currentPixels[redIndex] = (1 - diff) * clamp(sum_1.red) + diff * clamp(sum_2.red)
      currentPixels[greenIndex] = (1 - diff) * clamp(sum_1.green) + diff * clamp(sum_2.green)
      currentPixels[blueIndex] = (1 - diff) * clamp(sum_1.blue) + diff * clamp(sum_2.blue)
    }
  }


  commitChanges()
}


function addBlur(x, y, r) {
  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  var i_lower = clamp_edges(x - r, srcImage.width - 1)
  var i_upper = clamp_edges(x + r, srcImage.width - 1)
  var j_lower = clamp_edges(y - r, srcImage.height - 1)
  var j_upper = clamp_edges(y + r, srcImage.height - 1)
  var area = (j_upper - j_lower + 1) * (i_upper - i_lower + 1)

  sum = getArea(i_lower, i_upper, j_lower, j_upper)

  sum.red = sum.red / area
  sum.green = sum.green / area
  sum.blue = sum.blue / area
  return sum
}
