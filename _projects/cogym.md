---
title: CogGym
date: 2026-04-15 08:00:00 +0000
subtitle: A scalable framework for comparing AI models against humans using cognitive science experiments
image: '/images/cogym/cognitive_domains.png'
---

This page describes **CogGym: Towards Large-Scale Comparative Evaluation of Human and Machine Cognition**, a benchmark and infrastructure project developed in collaboration with over 30 research labs.

AI benchmarks typically measure accuracy against objective ground truth. But arriving at the correct answer is not the same as thinking like a human. CogGym asks a different question: across the broad space of cognitive science experiments developed over decades to characterize human thought, how well do AI models actually align with human cognition?

The diagram below contrasts what CogGym measures with what a standard benchmark measures.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Standard benchmarks score a single answer against ground truth; CogGym compares model and human response patterns on the same experiment" style="max-width:100%;height:auto;display:block;margin:1.4rem auto;font-family:Helvetica,Arial,sans-serif">
<defs>
<marker id="cg-arw1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#6a7280"/>
</marker>
</defs>
<rect x="8" y="8" width="352" height="284" rx="12" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.2"/>
<text x="184" y="38" font-size="16" font-weight="bold" fill="#3d4656" text-anchor="middle">Standard benchmark</text>
<rect x="26" y="72" width="78" height="40" rx="8" fill="#ffffff" stroke="#7a93c4" stroke-width="1.3"/>
<text x="65" y="97" font-size="14" fill="#3d4656" text-anchor="middle">Task</text>
<path d="M104,92 L134,92" stroke="#6a7280" stroke-width="1.6" fill="none" marker-end="url(#cg-arw1)"/>
<rect x="138" y="72" width="88" height="40" rx="8" fill="#ffffff" stroke="#7a93c4" stroke-width="1.3"/>
<text x="182" y="97" font-size="14" fill="#3d4656" text-anchor="middle">Model</text>
<path d="M226,92 L256,92" stroke="#6a7280" stroke-width="1.6" fill="none" marker-end="url(#cg-arw1)"/>
<rect x="260" y="72" width="82" height="40" rx="8" fill="#ffffff" stroke="#7a93c4" stroke-width="1.3"/>
<text x="301" y="97" font-size="14" fill="#3d4656" text-anchor="middle">Answer</text>
<path d="M301,112 L301,150" stroke="#6a7280" stroke-width="1.6" fill="none" marker-end="url(#cg-arw1)"/>
<rect x="252" y="154" width="98" height="40" rx="8" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.3"/>
<text x="301" y="179" font-size="13" fill="#3d4656" text-anchor="middle">Ground truth</text>
<path d="M301,194 L301,226" stroke="#6a7280" stroke-width="1.6" fill="none" marker-end="url(#cg-arw1)"/>
<text x="301" y="248" font-size="15" font-weight="bold" fill="#3d4656" text-anchor="middle">&#10003; / &#10007;</text>
<text x="184" y="276" font-size="13" font-style="italic" fill="#6a7280" text-anchor="middle">One number: was the answer correct?</text>
<rect x="380" y="8" width="352" height="284" rx="12" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.2"/>
<text x="556" y="38" font-size="16" font-weight="bold" fill="#3d4656" text-anchor="middle">CogGym</text>
<rect x="486" y="56" width="140" height="38" rx="8" fill="#ffffff" stroke="#7ab89a" stroke-width="1.3"/>
<text x="556" y="80" font-size="14" fill="#3d4656" text-anchor="middle">Same experiment</text>
<path d="M524,94 L476,118" stroke="#6a7280" stroke-width="1.6" fill="none" marker-end="url(#cg-arw1)"/>
<path d="M588,94 L636,118" stroke="#6a7280" stroke-width="1.6" fill="none" marker-end="url(#cg-arw1)"/>
<rect x="411" y="122" width="112" height="40" rx="8" fill="#ffffff" stroke="#d98a9e" stroke-width="1.3"/>
<text x="467" y="139" font-size="13.5" fill="#3d4656" text-anchor="middle">Humans</text>
<text x="467" y="155" font-size="12" fill="#6a7280" text-anchor="middle">many participants</text>
<rect x="589" y="122" width="112" height="40" rx="8" fill="#ffffff" stroke="#7a93c4" stroke-width="1.3"/>
<text x="645" y="139" font-size="13.5" fill="#3d4656" text-anchor="middle">AI model</text>
<text x="645" y="155" font-size="12" fill="#6a7280" text-anchor="middle">each of 35 models</text>
<rect x="415" y="212" width="16" height="20" rx="2" fill="#d98a9e" fill-opacity="0.85"/>
<rect x="437" y="196" width="16" height="36" rx="2" fill="#d98a9e" fill-opacity="0.85"/>
<rect x="459" y="182" width="16" height="50" rx="2" fill="#d98a9e" fill-opacity="0.85"/>
<rect x="481" y="200" width="16" height="32" rx="2" fill="#d98a9e" fill-opacity="0.85"/>
<rect x="503" y="216" width="16" height="16" rx="2" fill="#d98a9e" fill-opacity="0.85"/>
<line x1="411" y1="232" x2="523" y2="232" stroke="#6a7280" stroke-width="1"/>
<text x="467" y="248" font-size="12" fill="#6a7280" text-anchor="middle">response pattern</text>
<rect x="593" y="222" width="16" height="10" rx="2" fill="#7a93c4" fill-opacity="0.85"/>
<rect x="615" y="206" width="16" height="26" rx="2" fill="#7a93c4" fill-opacity="0.85"/>
<rect x="637" y="176" width="16" height="56" rx="2" fill="#7a93c4" fill-opacity="0.85"/>
<rect x="659" y="210" width="16" height="22" rx="2" fill="#7a93c4" fill-opacity="0.85"/>
<rect x="681" y="224" width="16" height="8" rx="2" fill="#7a93c4" fill-opacity="0.85"/>
<line x1="589" y1="232" x2="701" y2="232" stroke="#6a7280" stroke-width="1"/>
<text x="645" y="248" font-size="12" fill="#6a7280" text-anchor="middle">response pattern</text>
<path d="M541,198 L571,198" stroke="#3d4656" stroke-width="1.6" fill="none"/>
<polygon points="535,198 543,194 543,202" fill="#3d4656"/>
<polygon points="577,198 569,194 569,202" fill="#3d4656"/>
<text x="556" y="188" font-size="12" fill="#3d4656" text-anchor="middle">compare</text>
<text x="556" y="212" font-size="12" fill="#3d4656" text-anchor="middle">alignment (R&#178;)</text>
<text x="556" y="276" font-size="13" font-style="italic" fill="#6a7280" text-anchor="middle">How closely does it match human responses?</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Standard benchmarks score a single answer against ground truth; CogGym administers the same experiment to humans and models and scores how well the response patterns align.</p>
</div>

The core challenge is scale. Cognitive experiments are highly diverse in modality (text, audio, visual) and are built across heterogeneous software frameworks (PsychoPy, jsPsych, MATLAB). CogGym introduces the **Experiment Markup Language (EML)**, a high-level, model-agnostic format that abstracts experimental logic — stimulus presentation, trial structure, response collection — into structured specifications. An expert-in-the-loop, LLM-assisted translation pipeline converts diverse paradigms into EML, enabling cognitive experiments to be administered to AI models at scale for the first time.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/cogym/cognitive_domains.png" loading="lazy" alt="Cognitive domains covered by CogGym">
    <img src="/images/cogym/CogGym_pipeline.png" loading="lazy" alt="CogGym pipeline">
  </div>
</div>

The current version focuses on **rational common-sense reasoning**: causal inference, decision-making under uncertainty, social cognition, moral judgment, and probabilistic thinking. Through partnerships with over 30 labs, we standardized **320 experiments from 100 published papers** and evaluated **35 models** released between April 2024 and April 2026 across text, image, and video modalities.

Three key findings:

1. **Progress in cognitive alignment has largely stagnated.** Despite rapid gains in general capabilities, most models cluster in a narrow band (R² = 0.23–0.33) with human responses — far below human split-half reliability (R² = 0.85).

2. **Models approximate the group mean but not the distribution.** Models learn to mimic an "average human" without capturing individual heterogeneity. Divergence ratios remain flat at ~3× human variability.

3. **Modality is a major bottleneck.** Only 2.5% of text experiments are universally hard for all models, but 27.6% of video experiments have no model achieving r > 0.2, revealing that perceptual grounding remains a fundamental challenge.

The schematic below illustrates the second finding at the level of a single experiment.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 305" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Models match the human group mean but predict far less individual spread; the divergence ratio stays flat at about three times human variability" style="max-width:100%;height:auto;display:block;margin:1.4rem auto;font-family:Helvetica,Arial,sans-serif">
<defs>
<marker id="cg-arw2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#3d4656"/>
</marker>
</defs>
<path d="M60,252 C150,248 172,140 237,140 C302,140 324,248 414,252 Z" fill="#fdf3f3" stroke="#d98a9e" stroke-width="2"/>
<path d="M196,252 C218,250 221,86 237,86 C253,86 256,250 278,252 Z" fill="#eef2f7" fill-opacity="0.9" stroke="#7a93c4" stroke-width="2"/>
<line x1="237" y1="70" x2="237" y2="252" stroke="#3d4656" stroke-width="1.2" stroke-dasharray="5 4"/>
<text x="237" y="60" font-size="12.5" fill="#3d4656" text-anchor="middle">human group mean</text>
<path d="M36,252 L436,252" stroke="#3d4656" stroke-width="1.4" fill="none" marker-end="url(#cg-arw2)"/>
<text x="236" y="292" font-size="12" fill="#6a7280" text-anchor="middle">response scale on one experiment (e.g., a judgment)</text>
<circle cx="102" cy="264" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="126" cy="267" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="151" cy="262" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="175" cy="266" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="199" cy="263" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="222" cy="267" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="246" cy="263" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="270" cy="266" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="299" cy="262" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="330" cy="266" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="368" cy="263" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<circle cx="398" cy="266" r="4" fill="#d98a9e" fill-opacity="0.9"/>
<text x="30" y="268" font-size="12" fill="#6a7280">individuals</text>
<text x="40" y="112" font-size="13" fill="#3d4656">Humans: wide spread</text>
<text x="40" y="129" font-size="13" fill="#3d4656">across individuals</text>
<path d="M120,136 L168,196" stroke="#d98a9e" stroke-width="1.3" fill="none"/>
<text x="298" y="96" font-size="13" fill="#3d4656">Models: pile up on</text>
<text x="298" y="113" font-size="13" fill="#3d4656">the group mean,</text>
<text x="298" y="130" font-size="13" fill="#3d4656">little spread</text>
<path d="M294,108 L258,122" stroke="#7a93c4" stroke-width="1.3" fill="none"/>
<rect x="482" y="64" width="240" height="192" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.2"/>
<text x="602" y="88" font-size="13" font-weight="bold" fill="#3d4656" text-anchor="middle">Divergence ratio over time</text>
<line x1="512" y1="102" x2="512" y2="222" stroke="#6a7280" stroke-width="1.2"/>
<line x1="512" y1="222" x2="702" y2="222" stroke="#6a7280" stroke-width="1.2"/>
<line x1="508" y1="130" x2="512" y2="130" stroke="#6a7280" stroke-width="1.2"/>
<line x1="508" y1="196" x2="512" y2="196" stroke="#6a7280" stroke-width="1.2"/>
<text x="504" y="134" font-size="12" fill="#3d4656" text-anchor="end">3&#215;</text>
<text x="504" y="200" font-size="12" fill="#3d4656" text-anchor="end">1&#215;</text>
<line x1="518" y1="130" x2="696" y2="130" stroke="#d98a9e" stroke-width="2.5"/>
<text x="606" y="120" font-size="12" fill="#3d4656" text-anchor="middle">model vs. human &#8212; stays flat</text>
<line x1="518" y1="196" x2="696" y2="196" stroke="#7ab89a" stroke-width="2" stroke-dasharray="5 4"/>
<text x="606" y="188" font-size="12" fill="#3d4656" text-anchor="middle">human vs. human baseline</text>
<text x="606" y="237" font-size="12" fill="#6a7280" text-anchor="middle">model release date</text>
<text x="606" y="252" font-size="12" fill="#6a7280" text-anchor="middle">(Apr 2024 &#8594; Apr 2026)</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Models land on the average human response but collapse the spread of individuals; model&#8211;human divergence holds at roughly 3&#215; human-to-human variability across two years of model releases.</p>
</div>

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/cogym/01_correlation_histogram.png" loading="lazy" alt="Correlation histogram across models">
    <img src="/images/cogym/02_modality_violin.png" loading="lazy" alt="Performance by modality">
  </div>
</div>

CogGym is designed as a **living evaluation framework** — continuously incorporating new experiments and human replications as AI capabilities evolve. The goal is a persistent grand challenge: to develop computational models that truly think like humans.
