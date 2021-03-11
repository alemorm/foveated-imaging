---
title: "Background"
math: true
mmark: true
---

The human visual system uses variable resolution sampling centered at the fovea to discard the vast majority of available visual information (1). This sampling scheme takes advantage of the high density of photoreceptors at the fovea to acquire high resolution information where the gaze is directed, while keeping more eccentric, or peripheral, visual information at a lower resolution. This creates a nearly scaling-invariant system that preserves semantic information about the object visualized as long as the focus is in the same place.
This variable sampling is illustrated in the sampling lattice shown in **Figure 1** from Van Essen and Anderson (1). Additionally, **Equation 1** describes the relationship between eccentricity ({{< math.inline >}} \(E\) {{< /math.inline >}}), defined as angular distance from the center of focus, and sampling interval ({{< math.inline >}} \(D\) {{< /math.inline >}}). The slope ({{< math.inline >}} \(\alpha\) {{< /math.inline >}}) is estimated based on psychophysical data from the primate retina.

$$D=\delta+\alpha E=\alpha(E_0+E)\approx0.01(1.3+E)\degree$$

{{< centertxt >}}
**Equation 1**. Foveated imaging equation describing sampling interval as a function of eccentricity from the fovea.
{{< /centertxt >}}

![samplelattice]

{{< centertxt >}}
**Figure 1**. Eccentricity-dependent sampling lattice exhibited by the primate retina.
{{< /centertxt >}}

---
{{< centertxt >}} ### References {{< /centertxt >}}

1. David Van Essen and Charles H. Anderson. Information Processing Strategies and Pathways in the Primate Visual System. Van Essen and Anderson. 1995

<!-- Links -->
[samplelattice]: /materials/sampling_lattice.png#center "Sampling Lattice"
