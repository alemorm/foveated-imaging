# [Website][foveatedsite]

## Background

The human visual system uses variable resolution sampling centered at the fovea to discard the vast majority of available visual information (**1**). This sampling scheme takes advantage of the high density of photoreceptors at the fovea to acquire high resolution information where the gaze is directed, while keeping more eccentric, or peripheral, visual information at a lower resolution. This creates a nearly scaling-invariant system that preserves semantic information about the object visualized as long as the focus is in the same place.
This variable sampling is illustrated in the sampling lattice shown in **Figure 1** from Van Essen and Anderson (**1**). Additionally, the formula below describes the relationship between eccentricity $E$, defined as angular distance from the center of focus, and sampling interval $D$. The slope $\alpha$ is estimated based on psychophysical data from the primate retina.

$$D=\delta+\alpha E=\alpha(E_0+E)\approx0.01(1.3+E)\degree$$

---

![samplelattice]

**Figure 1**. Eccentricity-dependent sampling lattice exhibited by the primate retina.

---

## Implementation

This foveated rendering web application was implemented with [JavaScript][javasource], allowing users to upload an image and visualize the effect of foveated rendering with the fovea located at their cursor position.

The basic idea behind foveated rendering is to produce images with [varying resolution centered around the fovea][background]. A simple way to illustrate this effect real-time is to apply low-pass filters pixel by pixel on the image, with the filter size based on the pixel distance from the fovea. Therefore, pixels farther from the fovea appear blurrier than pixels closer to the fovea. Given the computational demand of applying low-pass filters to every pixel in an image, we provide two different blurring methods, discrete and interpolated.

The discrete blurring method just calculates the low-pass filter for every pixel based on its distance from the fovea. The interpolated blurring method smoothes the foveated rendering by interpolating adjacent low-pass filters with different sizes in order to avoid concentric bands of identical resolution.

Applying a mean filter to a pixel potentially means performing hundreds of summations to compute the value of one pixel, which is computationally expensive as the image gets larger. To mitigate such a problem, we compute a summed-area table (Figure 2) when loading the image, and therefore reducing computation on one pixel to constant time, which significantly accelerates processing time.

![summedareatable]

**Figure 2**. Computing image sum with a summed-area table

### References

(1) David Van Essen and Charles H. Anderson. Information Processing Strategies and Pathways in the Primate Visual System. Van Essen and Anderson. 1995

<!-- Links -->
[foveatedsite]: https://alemorm.github.io/foveated-imaging/
[samplelattice]: /content/materials/sampling_lattice.png "Sampling Lattice"
[background]: /posts/background
[javasource]: /static/js/foveate.js
[summedareatable]: /content/materials/summed_area_table.png "Summed Area Table"