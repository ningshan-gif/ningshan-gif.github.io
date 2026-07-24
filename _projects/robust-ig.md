---
title: Robust Information-Gain Control
date: 2026-05-01 08:00:00 +0000
subtitle: Fixing belief trap failures in LLM agents with distributionally robust information gain
image: '/images/robust-ig/robust-ig-000.png'
---

This page describes **Robust Information-Gain Control: Active Agentic Reasoning under Approximate Beliefs**, submitted to NeurIPS 2026.

LLM agents deployed in multi-turn reasoning tasks — question answering, interactive diagnosis, information gathering — frequently exhibit a pathological behavior: they repeat the same uninformative queries, revisit already-ruled-out hypotheses, or lock into persistent reasoning loops even when clearly informative actions exist. This failure persists even after RL fine-tuning or tool-use training, suggesting the problem runs deeper than capability.

This paper identifies the mechanism: **Belief Trap Regions (BTRs)**.

### The Problem: Belief Traps

When an LLM agent reasons over multiple turns, it does not plan against the true Bayesian posterior. It uses an internal approximate belief — imperfect due to amortized inference, heuristic updates, or implicit representation. Under approximate beliefs, even small perturbation errors can *invert action rankings*: an action that is genuinely uninformative gets ranked above one that would actually resolve uncertainty. Once the agent takes that uninformative action, it updates its belief slightly — but the same inversion may recur. The agent is trapped.

We formalize this as a Belief Trap Region: a forward-invariant subset of belief space where the expected progress potential fails to decrease, regardless of how many turns elapse. We prove that standard information-gain maximization (IG-max) can induce these traps whenever belief approximation error exceeds a threshold that inverts the top action ranking.

The cycle below shows how a small belief error becomes a self-sustaining trap.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Belief trap cycle diagram" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
  <defs>
    <marker id="rig1b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#7a93c4"/></marker>
    <marker id="rig1r" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#d98a9e"/></marker>
    <marker id="rig1g" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#9aa2af"/></marker>
  </defs>
  <g font-family="Helvetica, Arial, sans-serif" fill="#3d4656">
    <rect x="26" y="30" width="572" height="344" rx="14" fill="#fdf3f3" fill-opacity="0.45" stroke="#d98a9e" stroke-width="1.5" stroke-dasharray="7 5"/>
    <text x="312" y="58" text-anchor="middle" font-size="14" font-weight="600" fill="#b0637a">Belief Trap Region (forward-invariant)</text>
    <text x="312" y="76" text-anchor="middle" font-size="12.5" fill="#b0637a">once inside, expected progress &#934; stops decreasing</text>

    <rect x="52" y="96" width="225" height="84" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="164" y="130" text-anchor="middle" font-size="14.5" font-weight="600">Approximate belief b&#770;&#8348;</text>
    <text x="164" y="152" text-anchor="middle" font-size="12.5" fill="#55606f">= true posterior + error &#948;</text>

    <rect x="346" y="96" width="225" height="84" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="458" y="124" text-anchor="middle" font-size="14.5" font-weight="600">Ranking inversion</text>
    <text x="458" y="146" text-anchor="middle" font-size="12.5" fill="#55606f">&#948; flips the estimated-IG order:</text>
    <text x="458" y="164" text-anchor="middle" font-size="12.5" fill="#55606f">&#226; now outranks a*</text>

    <rect x="346" y="250" width="225" height="84" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
    <text x="458" y="284" text-anchor="middle" font-size="14.5" font-weight="600">Agent queries with &#226;</text>
    <text x="458" y="306" text-anchor="middle" font-size="12.5" fill="#55606f">almost no uncertainty resolved</text>

    <rect x="52" y="250" width="225" height="84" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="164" y="284" text-anchor="middle" font-size="14.5" font-weight="600">Tiny belief update</text>
    <text x="164" y="306" text-anchor="middle" font-size="12.5" fill="#55606f">b&#770;&#8348;&#8330;&#8321; &#8776; b&#770;&#8348; &#8212; still inside the trap</text>

    <line x1="277" y1="138" x2="338" y2="138" stroke="#7a93c4" stroke-width="2" marker-end="url(#rig1b)"/>
    <text x="308" y="126" text-anchor="middle" font-size="12" fill="#6a7280">rank by IG</text>
    <line x1="458" y1="180" x2="458" y2="242" stroke="#7a93c4" stroke-width="2" marker-end="url(#rig1b)"/>
    <text x="470" y="209" font-size="12" fill="#6a7280">act on the</text>
    <text x="470" y="224" font-size="12" fill="#6a7280">flipped ranking</text>
    <line x1="346" y1="292" x2="285" y2="292" stroke="#7a93c4" stroke-width="2" marker-end="url(#rig1b)"/>
    <line x1="164" y1="250" x2="164" y2="188" stroke="#d98a9e" stroke-width="2" marker-end="url(#rig1r)"/>
    <text x="176" y="209" font-size="12" fill="#b0637a">same inversion</text>
    <text x="176" y="224" font-size="12" fill="#b0637a">recurs next turn</text>

    <rect x="612" y="96" width="112" height="84" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
    <text x="668" y="130" text-anchor="middle" font-size="13.5" font-weight="600">Informative</text>
    <text x="668" y="148" text-anchor="middle" font-size="13.5" font-weight="600">action a*</text>
    <line x1="575" y1="138" x2="604" y2="138" stroke="#9aa2af" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#rig1g)"/>
    <text x="590" y="131" text-anchor="middle" font-size="13" fill="#c0616e">&#10007;</text>
    <text x="668" y="200" text-anchor="middle" font-size="12" fill="#6a7280">ranked below &#226;,</text>
    <text x="668" y="216" text-anchor="middle" font-size="12" fill="#6a7280">never selected</text>
  </g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: the belief-trap cycle &#8212; a small belief error inverts the action ranking, the uninformative query barely moves the belief, and the same inversion recurs every turn.</p>
</div>

### The Fix: Distributionally Robust Information Gain

We propose **DR-IG (Distributionally Robust Information Gain)**: instead of maximizing expected information gain under the current estimated belief, optimize *worst-case* information gain over an ambiguity set — an L1 ball of radius ε around the current belief estimate. This favors actions whose informativeness is stable under perturbation rather than actions that look good only under one precise belief point.

The schematic below shows how the worst-case objective changes which action gets chosen.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="IG-max versus DR-IG objective schematic" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
  <defs>
    <marker id="rig2r" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#d98a9e"/></marker>
    <marker id="rig2g" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#7ab89a"/></marker>
  </defs>
  <g font-family="Helvetica, Arial, sans-serif" fill="#3d4656">
    <text x="185" y="34" text-anchor="middle" font-size="15" font-weight="600">Ambiguity set over beliefs</text>
    <text x="550" y="34" text-anchor="middle" font-size="15" font-weight="600">Point IG vs worst-case IG</text>
    <line x1="352" y1="44" x2="352" y2="305" stroke="#e5e1d8" stroke-width="1"/>

    <path d="M185 80 L300 290 L70 290 Z" fill="#f2f4f8" stroke="#aab4c4" stroke-width="1.5" stroke-linejoin="round"/>
    <text x="185" y="68" text-anchor="middle" font-size="12.5" fill="#6a7280">h&#8321;</text>
    <text x="308" y="304" font-size="12.5" fill="#6a7280">h&#8322;</text>
    <text x="62" y="304" text-anchor="end" font-size="12.5" fill="#6a7280">h&#8323;</text>
    <path d="M196 165 L241 210 L196 255 L151 210 Z" fill="#eef2f7" fill-opacity="0.85" stroke="#7a93c4" stroke-width="1.6" stroke-dasharray="5 4"/>
    <circle cx="196" cy="210" r="4.5" fill="#7a93c4"/>
    <text x="205" y="206" font-size="13.5" font-weight="600">b&#770;</text>
    <text x="196" y="273" text-anchor="middle" font-size="12" fill="#55627a">L1 ball, radius &#949;</text>
    <circle cx="170" cy="192" r="3.5" fill="#8a93a2"/>
    <line x1="166" y1="188" x2="122" y2="152" stroke="#b3bac6" stroke-width="1"/>
    <text x="118" y="146" text-anchor="end" font-size="12" fill="#6a7280">true posterior</text>
    <text x="185" y="316" text-anchor="middle" font-size="12" fill="#6a7280">DR-IG scores actions on every belief in the ball</text>

    <line x1="380" y1="60" x2="380" y2="270" stroke="#9aa2af" stroke-width="1.2"/>
    <line x1="380" y1="270" x2="715" y2="270" stroke="#9aa2af" stroke-width="1.2"/>
    <text x="368" y="165" text-anchor="middle" font-size="12" fill="#6a7280" transform="rotate(-90 368 165)">information gain</text>
    <rect x="420" y="50" width="13" height="13" fill="#eef2f7" stroke="#7a93c4"/>
    <text x="439" y="61" font-size="12" fill="#55606f">IG at b&#770;</text>
    <rect x="520" y="50" width="13" height="13" fill="#fff8ea" stroke="#d9b56a"/>
    <text x="539" y="61" font-size="12" fill="#55606f">worst case in &#949;-ball</text>

    <rect x="414" y="95" width="48" height="175" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <rect x="470" y="240" width="48" height="30" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <rect x="574" y="160" width="48" height="110" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <rect x="630" y="174" width="48" height="96" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="466" y="292" text-anchor="middle" font-size="13.5">action a&#8321;</text>
    <text x="626" y="292" text-anchor="middle" font-size="13.5">action a&#8322;</text>

    <text x="466" y="86" text-anchor="middle" font-size="13" font-weight="600" fill="#c0616e">IG-max picks a&#8321;</text>
    <path d="M470 100 C505 135 508 195 497 235" fill="none" stroke="#d98a9e" stroke-width="1.6" marker-end="url(#rig2r)"/>
    <text x="550" y="140" text-anchor="middle" font-size="12" fill="#c0616e">collapses under</text>
    <text x="550" y="155" text-anchor="middle" font-size="12" fill="#c0616e">perturbation</text>
    <text x="626" y="120" text-anchor="middle" font-size="13" font-weight="600" fill="#4e8a6c">DR-IG picks a&#8322;</text>
    <line x1="630" y1="128" x2="648" y2="168" stroke="#7ab89a" stroke-width="1.4" marker-end="url(#rig2g)"/>
    <text x="548" y="306" text-anchor="middle" font-size="12" fill="#6a7280">fragile a&#8321; wins at the point estimate;</text>
    <text x="548" y="320" text-anchor="middle" font-size="12" fill="#6a7280">stable a&#8322; wins in the worst case</text>
  </g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: IG-max scores actions only at the belief estimate b&#770;; DR-IG scores them by worst-case gain over an L1 ball of radius &#949;, preferring stably informative actions.</p>
</div>

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/robust-ig/robust-ig-000.png" loading="lazy" alt="DR-IG retention under mode-shifted belief across ambiguity radius">
  </div>
</div>

Theoretically, we show that robust worst-case control restores negative drift of the progress potential under bounded belief error, whenever uniformly informative actions exist. In other words, DR-IG guarantees epistemic progress where IG-max cannot.

To make this practical without retraining, we derive a **verbalized belief proxy** that extracts approximate belief states directly from confidence-annotated model outputs. This gives a belief-space interface for any existing LLM agent with no additional training or explicit posterior modeling.

The diagram below shows how the method wraps a deployed agent at decision time.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Verbalized belief proxy pipeline" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
  <defs>
    <marker id="rig3b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#7a93c4"/></marker>
    <marker id="rig3g" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#7ab89a"/></marker>
  </defs>
  <g font-family="Helvetica, Arial, sans-serif" fill="#3d4656">
    <rect x="36" y="50" width="204" height="110" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="138" y="74" text-anchor="middle" font-size="14.5" font-weight="600">Deployed LLM agent</text>
    <text x="56" y="98" font-size="12" font-family="Menlo, Consolas, monospace" fill="#55606f">pneumonia &#8212; 60%</text>
    <text x="56" y="116" font-size="12" font-family="Menlo, Consolas, monospace" fill="#55606f">embolism &#8212; 25%</text>
    <text x="56" y="134" font-size="12" font-family="Menlo, Consolas, monospace" fill="#55606f">pleurisy &#8212; 15%</text>

    <line x1="240" y1="105" x2="260" y2="105" stroke="#7a93c4" stroke-width="2" marker-end="url(#rig3b)"/>

    <rect x="268" y="50" width="204" height="110" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="370" y="74" text-anchor="middle" font-size="14.5" font-weight="600">Verbalized belief proxy</text>
    <text x="370" y="100" text-anchor="middle" font-size="12.5" fill="#55606f">read the stated confidences</text>
    <text x="370" y="118" text-anchor="middle" font-size="12.5" fill="#55606f">normalize &#8594; belief estimate b&#770;</text>
    <text x="370" y="140" text-anchor="middle" font-size="12" fill="#6a7280">no retraining required</text>

    <line x1="472" y1="105" x2="492" y2="105" stroke="#7a93c4" stroke-width="2" marker-end="url(#rig3b)"/>

    <rect x="500" y="50" width="204" height="110" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
    <text x="602" y="74" text-anchor="middle" font-size="14.5" font-weight="600">DR-IG action selection</text>
    <text x="602" y="100" text-anchor="middle" font-size="12.5" fill="#55606f">score each query by its</text>
    <text x="602" y="118" text-anchor="middle" font-size="12.5" fill="#55606f">worst-case IG on the &#949;-ball</text>
    <text x="602" y="140" text-anchor="middle" font-size="12" fill="#6a7280">choose the max</text>

    <path d="M602 160 L602 192 Q602 200 594 200 L146 200 Q138 200 138 192 L138 168" fill="none" stroke="#7ab89a" stroke-width="2" marker-end="url(#rig3g)"/>
    <text x="370" y="190" text-anchor="middle" font-size="12.5" fill="#4e8a6c">next query a&#8348; &#8212; decision-time only, training-free</text>
  </g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: the training-free loop &#8212; verbalized confidences become an approximate belief, and the robust selector returns the agent's next query.</p>
</div>

### Results

Across interactive reasoning benchmarks and multiple LLM families:

- Naive IG-max agents **frequently collapse into deterministic self-locking loops** with near-zero solve rates
- These failures compound gradually across turns through small repeated ranking errors — not through single catastrophic steps
- **DR-IG substantially reduces trap incidence** and restores epistemic progress under approximate beliefs
- The entire system is **training-free** — it operates at decision time over the agent's existing outputs

The work identifies a concrete, theoretically grounded failure mechanism for active reasoning in LLM agents, and provides a robust remedy that works within the constraints of deployed systems.
