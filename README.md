# [Website][foveatedsite]

## Background

The human visual system uses variable resolution sampling centered at the fovea to discard the vast majority of available visual information (1). This sampling scheme takes advantage of the high density of photoreceptors at the fovea to acquire high resolution information where the gaze is directed, while keeping more eccentric, or peripheral, visual information at a lower resolution. This creates a nearly scaling-invariant system that preserves semantic information about the object visualized as long as the focus is in the same place.
This variable sampling is illustrated in the sampling lattice shown in **Figure 1** from Van Essen and Anderson (1). Additionally, the formula below describes the relationship between eccentricity (*E*), defined as angular distance from the center of focus, and sampling interval (*D*). The slope (*&delta;*) is estimated based on psychophysical data from the primate retina.

D=&delta;+&alpha;E=&alpha;(E<sub>o</sub>+E)&approx;0.01(1.3+E)&deg;

---

![samplelattice]

**Figure 1**. Eccentricity-dependent sampling lattice exhibited by the primate retina.

---

## Implementation

Foveated imaging produces images with varying resolution centered around the fovea. The foveated imaging functionality was implemented with [JavaScript][javasource], allowing users to upload an image and visualize this effect with the fovea located at their cursor position. A simple way to illustrate this effect real-time is to apply low-pass filters (2) to each pixel on the image, with the filter size dependent on the pixel distance from the fovea. Therefore, pixels farther from the fovea appear blurrier than pixels closer to the fovea. We provide two different blurring methods, discrete and interpolated, with their differences discussed below.

---

### Interpolation

The discrete blurring method calculates the low-pass filter for every pixel based on its distance from the fovea and is recommended for larger images (n_pixels>1e^6). The interpolated blurring method smoothes the foveated imaging by interpolating adjacent low-pass filters with different sizes in order to avoid concentric bands of identical resolution.

![interpolation]

**Figure 2**. Original image with the types of interpolation. Red arrows show regions where different adjacent low-pass filters were applied. Black circles are the fovea location. The interpolated method smoothed out the transition between filters.

---

### Summed Area Tables

Iteratively applying low-pass filters to every pixel in an image, potentially performing hundreds of summations to compute the value of each pixel, is computationally demanding. This challenge becomes even greater as the image gets larger, due to the quadratic increase in total pixels. To mitigate this issue, we compute a [summed-area table][summedareawiki] (3) right after loading the image, reducing computation on each pixel to constant time and significantly accelerating the processing time (**Figure 3**).

![summedareatable]

**Figure 3**. Summed-area table method to compute image pixel sums. This method created an integral image for which every pixel is the inclusive sum of all the pixels above and to the left of it. Different regions can then be calculated as illustrated.

---

### Log-Polar Transformation

We computed the [log-polar transformation][logpolarwiki] of the input image (4) to illustrate the projection performed in the primary visual cortex. The mapping from Cartesian coordinates to log-polar coordinates is shown in **Equation 1** and **Figure 4**.

&rho;=ln((x-x<sub>c</sub>)<sup>2</sup>+(y-y<sub>c</sub>)<sup>2</sup>)<sup>&half;</sup>

&theta;=atan2(y-y<sub>c</sub>,x-x<sub>c</sub>)

**Equation 1**. Mapping from Cartesian coordinates to Log-Polar coordinates. The distance from the fovea along the *x* and *y* axes is denoted by *x-x<sub>c</sub>* and *y-y<sub>c</sub>* respectively.

![logpolar]

**Figure 4**. Log-Polar Transform from Cartesian coordinates.

---

### References

1. David Van Essen and Charles H. Anderson. Information Processing Strategies and Pathways in the Primate Visual System. Van Essen and Anderson. 1995
2. Low-pass filters (https://en.wikipedia.org/wiki/Low-pass_filter)
3. Summed-area tables (https://en.wikipedia.org/wiki/Summed-area_table)
4. Log-polar coordinates (https://en.wikipedia.org/wiki/Log-polar_coordinates)
5. Log-polar image https://sthoduka.github.io/imreg_fmt/docs/log-polar-transform/

<!-- Links -->
[foveatedsite]: https://alemorm.github.io/foveated-imaging/
[samplelattice]: /content/materials/sampling_lattice.png "Sampling Lattice"
[javasource]: /static/js/foveate.js
[interpolation]: /content/materials/interpolation_arrows.png# "Interpolation Types"
[summedareatable]: /content/materials/summed_area_table.png "Summed Area Table"
[logpolar]: /content/materials/log_polar.png "Log-Polar Transform"
[lowpasswiki]: https://en.wikipedia.org/wiki/Low-pass_filter
[summedareawiki]: https://en.wikipedia.org/wiki/Summed-area_table
[logpolarwiki]: https://en.wikipedia.org/wiki/Log-polar_coordinates
