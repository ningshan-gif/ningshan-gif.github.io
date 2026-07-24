---
title: What Matters in RL for Diffusion Models?
date: 2026-05-01 08:00:00 +0000
subtitle: The dominant role of noise in RL post-training for diffusion models
image: '/images/rl-diffusion/rl-diffusion-000.png'
---

This page describes **What Matters in RL for Diffusion Models? The Dominant Role of Noise**, submitted to NeurIPS 2026.

Reinforcement learning has become a powerful paradigm for post-training generative models — improving reasoning in language models and improving alignment in diffusion models. But a basic question has gone unanswered: what actually drives learning in RL-based diffusion training?

For language models, the signal is clear — it comes from the response. But diffusion models introduce a second axis of stochasticity: **noise initialization**. Each generated image is shaped both by the text prompt and by the noise sample that seeds the denoising trajectory. These two axes both produce variation in reward, but their relative contributions have never been disentangled — until now.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/rl-diffusion/rl-diffusion-000.png" loading="lazy" alt="PickScore training curve: 2x Noise Margin vs Flow-GRPO">
    <img src="/images/rl-diffusion/rl-diffusion-002.png" loading="lazy" alt="Advantage variance vs improvement scatter plot">
  </div>
</div>

We present the first systematic study separating prompt-level and noise-level sources of optimization signal in RL training for diffusion models. The key finding: **noise dominates**. Reward variance and policy-gradient informativeness are driven overwhelmingly by differences among trajectories generated from the same prompt — not by differences across prompts. Prompt-level variation contributes substantially less after group-wise normalization.

The diagram below shows where the two sources of stochasticity enter generation, and why group-wise normalization leaves the noise axis as the dominant source of signal.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 432" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="One prompt is paired with three noise seeds; each seed is denoised into a different image with a different reward, and group-wise normalization subtracts the per-prompt mean reward, keeping only noise-induced spread" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
  <defs>
    <marker id="rlm-blue" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#7a93c4"/></marker>
    <marker id="rlm-slate" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#3d4656"/></marker>
    <marker id="rlm-amber" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#d9b56a"/></marker>
  </defs>
  <g font-family="Helvetica, Arial, sans-serif">
    <text x="370" y="24" text-anchor="middle" font-size="16" font-weight="bold" fill="#3d4656">Two axes of stochasticity — and which one carries the signal</text>
    <rect x="18" y="152" width="128" height="76" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="82" y="186" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">Prompt p</text>
    <text x="82" y="207" text-anchor="middle" font-size="13" fill="#6a7280">one text prompt</text>
    <path d="M146 172 C166 158 172 122 181 104" fill="none" stroke="#7a93c4" stroke-width="1.5" marker-end="url(#rlm-blue)"/>
    <path d="M146 190 L180 190" fill="none" stroke="#7a93c4" stroke-width="1.5" marker-end="url(#rlm-blue)"/>
    <path d="M146 208 C166 222 172 258 181 276" fill="none" stroke="#7a93c4" stroke-width="1.5" marker-end="url(#rlm-blue)"/>
    <text x="210" y="50" text-anchor="middle" font-size="13" fill="#6a7280">noise seeds</text>
    <circle cx="210" cy="90" r="24" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="210" cy="190" r="24" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="210" cy="290" r="24" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="210" y="95" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">z₁</text>
    <text x="210" y="195" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">z₂</text>
    <text x="210" y="295" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">z₃</text>
    <path d="M240 90 c 12 -15 22 15 34 0 c 10 -12 20 10 32 0 l 8 0" fill="none" stroke="#d9b56a" stroke-width="1.8" marker-end="url(#rlm-amber)"/>
    <path d="M240 190 c 12 -15 22 15 34 0 c 10 -12 20 10 32 0 l 8 0" fill="none" stroke="#d9b56a" stroke-width="1.8" marker-end="url(#rlm-amber)"/>
    <path d="M240 290 c 12 -15 22 15 34 0 c 10 -12 20 10 32 0 l 8 0" fill="none" stroke="#d9b56a" stroke-width="1.8" marker-end="url(#rlm-amber)"/>
    <text x="277" y="126" text-anchor="middle" font-size="13" fill="#6a7280">denoising trajectory</text>
    <rect x="320" y="64" width="72" height="52" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
    <rect x="320" y="164" width="72" height="52" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
    <rect x="320" y="264" width="72" height="52" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
    <text x="356" y="86" text-anchor="middle" font-size="13" fill="#6a7280">image</text>
    <text x="356" y="106" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">x₁</text>
    <text x="356" y="186" text-anchor="middle" font-size="13" fill="#6a7280">image</text>
    <text x="356" y="206" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">x₂</text>
    <text x="356" y="286" text-anchor="middle" font-size="13" fill="#6a7280">image</text>
    <text x="356" y="306" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">x₃</text>
    <path d="M392 90 L404 90" fill="none" stroke="#3d4656" stroke-width="1.3" marker-end="url(#rlm-slate)"/>
    <path d="M392 190 L404 190" fill="none" stroke="#3d4656" stroke-width="1.3" marker-end="url(#rlm-slate)"/>
    <path d="M392 290 L404 290" fill="none" stroke="#3d4656" stroke-width="1.3" marker-end="url(#rlm-slate)"/>
    <rect x="408" y="75" width="90" height="30" rx="15" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.3"/>
    <rect x="408" y="175" width="90" height="30" rx="15" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.3"/>
    <rect x="408" y="275" width="90" height="30" rx="15" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.3"/>
    <text x="453" y="95" text-anchor="middle" font-size="14" fill="#3d4656">r₁ = 0.82</text>
    <text x="453" y="195" text-anchor="middle" font-size="14" fill="#3d4656">r₂ = 0.31</text>
    <text x="453" y="295" text-anchor="middle" font-size="14" fill="#3d4656">r₃ = 0.55</text>
    <path d="M510 80 h10 M520 80 V300 M510 300 h10" fill="none" stroke="#3d4656" stroke-width="1.3"/>
    <path d="M520 190 L542 190" fill="none" stroke="#3d4656" stroke-width="1.3" marker-end="url(#rlm-slate)"/>
    <rect x="546" y="148" width="178" height="84" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
    <text x="635" y="174" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">Group-wise</text>
    <text x="635" y="192" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">normalization</text>
    <text x="635" y="216" text-anchor="middle" font-size="15" fill="#3d4656">Aᵢ = rᵢ − r̄</text>
    <rect x="26" y="334" width="12" height="12" rx="3" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
    <text x="46" y="345" font-size="13.5" font-weight="bold" fill="#3d4656">Noise axis (same prompt, different seed):</text>
    <text x="46" y="363" font-size="13" fill="#3d4656">the spread among r₁, r₂, r₃ survives normalization and supplies nearly all of the gradient signal.</text>
    <rect x="26" y="380" width="12" height="12" rx="3" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
    <text x="46" y="391" font-size="13.5" font-weight="bold" fill="#3d4656">Prompt axis (different prompts):</text>
    <text x="46" y="409" font-size="13" fill="#3d4656">their differences enter only through the group mean r̄ — and are subtracted away.</text>
  </g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Group-wise normalization cancels prompt-level reward differences, leaving noise-induced spread within each group as the training signal.</p>
</div>

This has a direct practical implication: if noise is what matters, training should be structured to maximize informative noise-induced variation. We introduce two strategies:

- **Structured noise oversampling**: generate more candidate trajectories per prompt, exploiting the noise axis more efficiently under the same compute budget.
- **Margin-based trajectory selection**: select training pairs with the largest reward margin, prioritizing trajectories that carry the most learning signal.

The diagram below shows how the two strategies restructure each training batch.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 372" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Left: noise oversampling doubles the number of noise seeds per prompt under the same compute budget; right: among the sampled trajectories, the pair with the largest reward margin is kept for the FlowGRPO update and the rest are discarded" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
  <defs>
    <marker id="rlm2-blue" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#7a93c4"/></marker>
    <marker id="rlm2-slate" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#3d4656"/></marker>
  </defs>
  <g font-family="Helvetica, Arial, sans-serif">
    <text x="24" y="26" font-size="15" font-weight="bold" fill="#3d4656">1 · Structured noise oversampling</text>
    <text x="398" y="26" font-size="15" font-weight="bold" fill="#3d4656">2 · Margin-based selection</text>
    <line x1="376" y1="14" x2="376" y2="356" stroke="#e8e4da" stroke-width="1.5"/>
    <text x="24" y="58" font-size="13" fill="#6a7280">FlowGRPO baseline</text>
    <rect x="24" y="68" width="78" height="34" rx="8" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="63" y="89" text-anchor="middle" font-size="13" fill="#3d4656">prompt</text>
    <path d="M102 85 L118 85" fill="none" stroke="#7a93c4" stroke-width="1.5" marker-end="url(#rlm2-blue)"/>
    <circle cx="134" cy="85" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="160" cy="85" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="186" cy="85" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="212" cy="85" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="232" y="90" font-size="13" fill="#3d4656">4 trajectories</text>
    <text x="24" y="146" font-size="13" fill="#6a7280">Noise oversampling (2×), same compute</text>
    <rect x="24" y="156" width="78" height="34" rx="8" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="63" y="177" text-anchor="middle" font-size="13" fill="#3d4656">prompt</text>
    <path d="M102 173 L118 173" fill="none" stroke="#7a93c4" stroke-width="1.5" marker-end="url(#rlm2-blue)"/>
    <circle cx="134" cy="173" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="160" cy="173" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="186" cy="173" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="212" cy="173" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="238" cy="173" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="264" cy="173" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="290" cy="173" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <circle cx="316" cy="173" r="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="24" y="212" font-size="13" fill="#3d4656">8 trajectories from the same prompt</text>
    <text x="24" y="258" font-size="13" font-style="italic" fill="#6a7280">Fewer prompts, more seeds per prompt:</text>
    <text x="24" y="276" font-size="13" font-style="italic" fill="#6a7280">each group probes the noise axis more densely</text>
    <text x="24" y="294" font-size="13" font-style="italic" fill="#6a7280">and produces a wider within-group reward spread.</text>
    <path d="M404 330 L404 54" fill="none" stroke="#3d4656" stroke-width="1.3" marker-end="url(#rlm2-slate)"/>
    <text x="414" y="58" font-size="13" fill="#6a7280">reward</text>
    <circle cx="458" cy="80" r="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="2"/>
    <circle cx="466" cy="116" r="6.5" fill="#eef2f7" stroke="#a9b4c4" stroke-width="1.2"/>
    <circle cx="450" cy="142" r="6.5" fill="#eef2f7" stroke="#a9b4c4" stroke-width="1.2"/>
    <circle cx="462" cy="168" r="6.5" fill="#eef2f7" stroke="#a9b4c4" stroke-width="1.2"/>
    <circle cx="454" cy="196" r="6.5" fill="#eef2f7" stroke="#a9b4c4" stroke-width="1.2"/>
    <circle cx="468" cy="224" r="6.5" fill="#eef2f7" stroke="#a9b4c4" stroke-width="1.2"/>
    <circle cx="452" cy="252" r="6.5" fill="#eef2f7" stroke="#a9b4c4" stroke-width="1.2"/>
    <circle cx="460" cy="296" r="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="2"/>
    <path d="M480 80 h12 M492 80 V296 M480 296 h12" fill="none" stroke="#7ab89a" stroke-width="1.6"/>
    <text x="504" y="180" font-size="13.5" font-weight="bold" fill="#3d4656">largest</text>
    <text x="504" y="197" font-size="13.5" font-weight="bold" fill="#3d4656">margin Δr</text>
    <path d="M578 188 L594 188" fill="none" stroke="#3d4656" stroke-width="1.3" marker-end="url(#rlm2-slate)"/>
    <rect x="598" y="148" width="126" height="80" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="661" y="174" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">FlowGRPO</text>
    <text x="661" y="192" text-anchor="middle" font-size="13" fill="#3d4656">update on the</text>
    <text x="661" y="209" text-anchor="middle" font-size="13" fill="#3d4656">selected pair</text>
    <text x="398" y="352" font-size="13" font-style="italic" fill="#6a7280">trajectories with small reward margins are discarded</text>
  </g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Noise oversampling widens each prompt's candidate pool; margin-based selection keeps the pair with the largest reward gap for the FlowGRPO update.</p>
</div>

Both strategies plug directly into FlowGRPO, the standard RL framework for flow-based diffusion models. Across three tasks — compositional image generation, OCR-based text rendering, and human preference alignment — noise margin selection consistently improves over the baseline. The 2x Noise Margin variant reaches FlowGRPO's final PickScore in **2.2× fewer training steps**, and ends with a higher final score (23.14 vs. 22.92). Prompt-level filtering, by contrast, yields substantially weaker gains — confirming the asymmetry.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/rl-diffusion/rl-diffusion-001.png" loading="lazy" alt="Method diagram">
    <img src="/images/rl-diffusion/rl-diffusion-003.png" loading="lazy" alt="Results across tasks">
  </div>
</div>

The broader takeaway is that RL for diffusion models is governed by **trajectory-level exploration and selection over the noise-induced space** — a fundamentally different structure from RL alignment in autoregressive language models, where the prompt is the primary axis of variation. Understanding this distinction matters for how we design data collection, sampling strategies, and reward-weighting schemes for the next generation of RL-trained generative models.
