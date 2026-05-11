---
title: 40Hz Toolbox
date: 2025-05-16 08:00:00 +0000
subtitle: VR-based 40Hz light therapy for adult amblyopia and Alzheimer's disease
image: '/images/thesis-40hz/thesis-002.png'
---

This page describes my **MEng thesis at MIT**: *40Hz Toolbox: VR-Based Light Therapy for Amblyopia Treatment and Alzheimer Prevention*, supervised by Professor Mark Bear and Professor Edward Boyden at the Picower Institute.

Amblyopia ("lazy eye") affects roughly 3% of the population and has historically been considered untreatable in adults — conventional patching therapy is only effective during the critical period of visual development in early childhood. Meanwhile, foundational research in rodent models has shown that **40Hz gamma-frequency visual stimulation** can reopen critical periods of neuroplasticity in the adult visual cortex, and separately that it can reduce amyloid pathology in Alzheimer's models by synchronizing neural oscillations.

The thesis translates these laboratory findings into a practical therapeutic platform.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/thesis-40hz/thesis-000.png" loading="lazy" alt="Unity system architecture">
    <img src="/images/thesis-40hz/thesis-002.png" loading="lazy" alt="Light and sound signal synchronization at 40Hz">
  </div>
</div>

The **40Hz Toolbox** is a software system built in Unity for the **Meta Quest 3** VR headset. It delivers precisely timed 40Hz flicker stimuli within an immersive environment where users can engage in daily activities while undergoing therapy. The system is designed to translate laboratory-based gamma entrainment protocols into future clinical trials.

Key engineering work:

- **Precise stimulus timing**: verified 40Hz light delivery via NI-DAQ and Arduino measurement, with light and audio signals synchronized within the 25ms window required for gamma entrainment.
- **Binocular control**: the VR environment can independently control stimulus parameters for each eye, enabling amblyopia-specific dichoptic protocols.
- **Immersive passthrough**: the Meta Quest 3's mixed-reality passthrough allows users to perform real-world tasks while the 40Hz flicker overlays their field of view, improving therapy compliance.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/thesis-40hz/thesis-003.png" loading="lazy" alt="Signal verification plot">
    <img src="/images/thesis-40hz/thesis-004.png" loading="lazy" alt="System in use">
  </div>
</div>

The 40Hz Toolbox is designed to serve as the software substrate for two lines of future clinical investigation: (1) gamma-entrainment-based reopening of visual plasticity in adult amblyopia, and (2) 40Hz stimulation as a non-invasive adjunct therapy in Alzheimer's disease. By delivering these protocols through consumer VR rather than laboratory equipment, the system bridges the gap between neuroscience findings and accessible, at-home treatment.

The work has been filed as a patent application through MIT Technology Licensing Office, covering the VR-based delivery system for gamma-frequency therapeutic stimulation.

Supported by the Picower Innovation Fund.
