---
title: "Implementation"
date: 2020-12-09T11:23:07-08:00
math: true
mmark: true
---

This foveated rendering web application was implemented with [JavaScript][foveatejs], allowing users to upload an image and visualize the effect of foveated rendering with the fovea located at their cursor position. The basic idea behind foveated rendering is to produce images with [varying resolution centered around the fovea][background]. A simple way to illustrate this effect real-time is to apply low-pass filters (1) to each pixel on the image, with the filter size dependent on the pixel distance from the fovea. Therefore, pixels farther from the fovea appear blurrier than pixels closer to the fovea. We provide two different blurring methods, discrete and interpolated, with their differences discussed below.

---

{{< centertxt >}} ### Interpolation {{< /centertxt >}}

The discrete blurring method calculates the low-pass filter for every pixel based on its distance from the fovea and is recommended for larger images ({{< math.inline >}} \(n_{pixels}>1e^6\) {{< /math.inline >}}). The interpolated blurring method smoothes the foveated rendering by interpolating adjacent low-pass filters with different sizes in order to avoid concentric bands of identical resolution.

![interpolation]

{{< centertxt >}}
**Figure 2**. Original image with the types of interpolation. Red arrows show regions where different adjacent low-pass filters were applied. Black circles are the fovea location. The interpolated method smoothed out the transition between filters.
{{< /centertxt >}}

---

{{< centertxt >}} ### Summed Area Tables {{< /centertxt >}}

Iteratively applying low-pass filters to every pixel in an image, potentially performing hundreds of summations to compute the value of each pixel, is computationally demanding. This challenge becomes even greater as the image gets larger, due to the exponential increase in total pixels. To mitigate this issue, we compute a [summed-area table][summedareawiki] (2) right after loading the image, reducing computation on each pixel to constant time and significantly accelerating the processing time (**Figure 3**).

![summedareatable]

{{< centertxt >}}
**Figure 3**. Summed-area table method to compute image pixel sums. This method created an integral image for which every pixel is the inclusive sum of all the pixels above and to the left of it. Different regions can then be calculated as illustrated.
{{< /centertxt >}}

---

{{< centertxt >}} ### Log-Polar Transformation {{< /centertxt >}}

We computed the [log-polar transformation][logpolarwiki] of the input image (3) to illustrate the projection performed in the primary visual cortex. The mapping performed is shown in **Figure 4**.

$$\rho=\log{\sqrt{x^2 + y^2}}$$
$$\theta=atan2(y,x)$$

![logpolar]

{{< centertxt >}}
**Figure 4**. Log-Polar Transform from Cartesian coordinates.
{{< /centertxt >}}

---
{{< centertxt >}} ### References {{< /centertxt >}}

1. Low-pass filters (https://en.wikipedia.org/wiki/Low-pass_filter)
2. Summed-area tables (https://en.wikipedia.org/wiki/Summed-area_table)
3. Log-polar coordinates (https://en.wikipedia.org/wiki/Log-polar_coordinates)
4. Log-polar image https://sthoduka.github.io/imreg_fmt/docs/log-polar-transform/

<!-- Links -->
[foveatejs]: /js/foveate.js
[background]: /posts/background
[interpolation]: /materials/interpolation_arrows.png#center "Interpolation Types"
[summedareatable]: /materials/summed_area_table.png#center "Summed Area Table"
[logpolar]: /materials/log_polar.png#center "Log-Polar Transform"
[lowpasswiki]: https://en.wikipedia.org/wiki/Low-pass_filter
[summedareawiki]: https://en.wikipedia.org/wiki/Summed-area_table
[logpolarwiki]: https://en.wikipedia.org/wiki/Log-polar_coordinates
