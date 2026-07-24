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

The diagram below shows how a single stimulus engine drives each eye through its own independent channel and renders the flicker over mixed-reality passthrough.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 720 330" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica,Arial,sans-serif">
  <defs>
    <marker id="mB2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#7a93c4"/></marker>
  </defs>
  <rect x="270" y="16" width="200" height="54" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="370" y="40" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Unity stimulus engine</text>
  <text x="370" y="58" text-anchor="middle" font-size="12.5" fill="#6a7280">Meta Quest 3</text>
  <text x="360" y="98" text-anchor="middle" font-size="12.5" fill="#6a7280" font-style="italic">two independent per-eye channels</text>
  <path d="M332,70 C268,88 210,92 189,106" fill="none" stroke="#7a93c4" stroke-width="1.6" marker-end="url(#mB2)"/>
  <path d="M408,70 C472,88 530,92 551,106" fill="none" stroke="#7a93c4" stroke-width="1.6" marker-end="url(#mB2)"/>
  <rect x="40" y="108" width="300" height="104" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="190" y="134" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Left-eye channel</text>
  <text x="70" y="160" font-size="13" fill="#4a5262">&#183; contrast</text>
  <text x="70" y="181" font-size="13" fill="#4a5262">&#183; 40 Hz flicker amplitude</text>
  <text x="70" y="202" font-size="13" fill="#4a5262">&#183; phase / on-off timing</text>
  <rect x="380" y="108" width="300" height="104" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
  <text x="530" y="134" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Right-eye channel</text>
  <text x="410" y="160" font-size="13" fill="#4a5262">&#183; contrast</text>
  <text x="410" y="181" font-size="13" fill="#4a5262">&#183; 40 Hz flicker amplitude</text>
  <text x="410" y="202" font-size="13" fill="#4a5262">&#183; phase / on-off timing</text>
  <path d="M190,212 L197,247" fill="none" stroke="#7a93c4" stroke-width="1.6" marker-end="url(#mB2)"/>
  <path d="M530,212 L523,247" fill="none" stroke="#7a93c4" stroke-width="1.6" marker-end="url(#mB2)"/>
  <rect x="40" y="250" width="640" height="62" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="360" y="276" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Mixed-reality passthrough</text>
  <text x="360" y="297" text-anchor="middle" font-size="12.5" fill="#6a7280">40 Hz flicker overlays each eye's real-world view &#8212; dichoptic protocol per eye</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: the stimulus engine splits into two independently parameterised eye channels (dichoptic control), both rendered as a 40Hz overlay on the headset's passthrough view.</p>
</div>

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/thesis-40hz/thesis-003.png" loading="lazy" alt="Signal verification plot">
    <img src="/images/thesis-40hz/thesis-004.png" loading="lazy" alt="System in use">
  </div>
</div>

The 40Hz Toolbox is designed to serve as the software substrate for two lines of future clinical investigation: (1) gamma-entrainment-based reopening of visual plasticity in adult amblyopia, and (2) 40Hz stimulation as a non-invasive adjunct therapy in Alzheimer's disease. By delivering these protocols through consumer VR rather than laboratory equipment, the system bridges the gap between neuroscience findings and accessible, at-home treatment.

The diagram below traces the two therapeutic pathways that the same 40Hz stimulus is intended to drive.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 720 340" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica,Arial,sans-serif">
  <defs>
    <marker id="mBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#7a93c4"/></marker>
    <marker id="mGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#7ab89a"/></marker>
    <marker id="mRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d98a9e"/></marker>
  </defs>
  <rect x="24" y="132" width="150" height="76" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
  <text x="99" y="165" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">40 Hz stimulus</text>
  <text x="99" y="186" text-anchor="middle" font-size="12.5" fill="#6a7280">light + sound flicker</text>
  <path d="M176,170 L221,170" fill="none" stroke="#7a93c4" stroke-width="1.6" marker-end="url(#mBlue)"/>
  <rect x="230" y="132" width="176" height="76" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="318" y="164" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Gamma-band (40 Hz)</text>
  <text x="318" y="184" text-anchor="middle" font-size="13" fill="#4a5262">neural entrainment</text>
  <path d="M406,158 C440,150 440,84 465,84" fill="none" stroke="#7ab89a" stroke-width="1.6" marker-end="url(#mGreen)"/>
  <path d="M406,182 C440,190 440,257 465,257" fill="none" stroke="#d98a9e" stroke-width="1.6" marker-end="url(#mRed)"/>
  <rect x="470" y="36" width="226" height="100" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="583" y="66" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Amblyopia therapy</text>
  <text x="583" y="88" text-anchor="middle" font-size="12.5" fill="#4a5262">reopens the critical period of</text>
  <text x="583" y="105" text-anchor="middle" font-size="12.5" fill="#4a5262">plasticity in adult visual cortex</text>
  <text x="583" y="122" text-anchor="middle" font-size="12.5" fill="#4a5262">&#8594; recovers the amblyopic eye</text>
  <rect x="470" y="210" width="226" height="100" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
  <text x="583" y="240" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Alzheimer's therapy</text>
  <text x="583" y="262" text-anchor="middle" font-size="12.5" fill="#4a5262">synchronizes neural oscillations</text>
  <text x="583" y="279" text-anchor="middle" font-size="12.5" fill="#4a5262">to clear amyloid pathology</text>
  <text x="583" y="296" text-anchor="middle" font-size="12.5" fill="#4a5262">&#8594; non-invasive adjunct therapy</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: one 40Hz light-plus-sound stimulus drives gamma entrainment, which branches into two intended effects &#8212; reopening visual-cortex plasticity for amblyopia, and clearing amyloid for Alzheimer's.</p>
</div>

The work has been filed as a patent application through MIT Technology Licensing Office, covering the VR-based delivery system for gamma-frequency therapeutic stimulation.

Supported by the Picower Innovation Fund.
