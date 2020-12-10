---
title: "Implementation"
date: 2020-12-09T11:23:07-08:00
draft: true
---

This foveated rendering web application was implemented with JavaScript, allowing users to upload an image and visualize the effect of foveated rendering with the fovea located at their cursor position.

The basic idea behind foveated rendering is to produce images with [varying resolution centered around the fovea][background]. A simple way to illustrate this effect real-time is to apply low-pass filters pixel by pixel on the image, with the filter size based on the pixel distance from the fovea. Therefore, pixels farther from the fovea appear blurrier than pixels closer to the fovea. Given the computational demand of applying low-pass filters to every pixel in an image, we provide two different blurring methods, discrete and interpolated.

The discrete blurring method just calculates the low-pass filter for every pixel based on its distance from the fovea. The interpolated blurring method smoothes the foveated rendering by interpolating adjacent low-pass filters with different sizes in order to avoid concentric bands of identical resolution.

Applying a mean filter to a pixel potentially means performing hundreds of summations to compute the value of one pixel, which is computationally expensive as the image gets larger. To mitigate such a problem, we compute a summed-area table (Figure 2) when loading the image, and therefore reducing computation on one pixel to constant time, which significantly accelerates processing time.

![summedareatable]

{{< centertxt >}}
**Figure 2**. Computing image sum with a summed-area table
{{< /centertxt >}}

<!-- Links -->
[background]: /posts/background
[summedareatable]: /materials/summed_area_table.png#center "Summed Area Table"