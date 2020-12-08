// Given the x, y index, return what bin it should be in a 1d array
// function getbinIndex(i_lower, i_upper, j_lower, j_upper, j) {
//     let binxindexArray = Array.from(Array(i_upper - i_lower), (x, index) => index + i_lower + 1);
//     let binyindexArray = Array(j_upper - j_lower).fill(j);
//     return (binxindexArray + binyindexArray * 256)*4
// }

// var testind = getbinIndex(1,3,4,6,4)

var i_lower = 1;
var i_upper = 3;
var j_lower = 4;
var j_upper = 6;
var j = 4;
let binxIndex = Array.from(Array(i_upper - i_lower), (num, index) => index + i_lower);
let binyIndex = Array(j_upper - j_lower).fill(j);
binyIndex = binyIndex.map(function(x) { return x * 256 * 4; });
let binxyIndex = binxIndex.map(function (num, idx) { return 4*num + binyIndex[idx]; });

console.log(binxyIndex)