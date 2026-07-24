---
title: KINA Benchmark
date: 2026-04-20 08:00:00 +0000
subtitle: A high-density benchmark spanning 261 disciplines with game-theoretic annotation
image: '/images/kina/kina_top10_upset.png'
---

This page describes **KINA (Knowledge Index of Noah's Ark)**, a benchmark for evaluating the disciplinary knowledge boundaries of frontier AI models, built at 2077AI.

Existing benchmarks for evaluating AI knowledge suffer from three structural problems: they prioritize scale or extreme difficulty over disciplinary representativeness, they are vulnerable to data contamination, and they rely on blind-trust annotations prone to "lazy consensus" — where annotators agree without independent reasoning. KINA addresses all three.

KINA spans **261 disciplines** across the full breadth of human knowledge, organized into a three-level taxonomy. Each question uses a **10-option format** to suppress guessing, with a strict difficulty threshold that filters out surface-level memorization. The result is a benchmark that rewards genuine reasoning over recall.

The diagram below traces how a question earns its place in the benchmark.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 212" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pipeline from the discipline taxonomy to the KINA benchmark" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
<defs>
<marker id="kina-arr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#7a93c4"/></marker>
</defs>
<g font-family="Helvetica, Arial, sans-serif" fill="#3d4656">
<text x="96" y="56" font-size="14" font-weight="bold" text-anchor="middle">Three-level taxonomy</text>
<text x="288" y="56" font-size="14" font-weight="bold" text-anchor="middle">10-option questions</text>
<text x="480" y="56" font-size="14" font-weight="bold" text-anchor="middle">Difficulty threshold</text>
<text x="658" y="56" font-size="14" font-weight="bold" text-anchor="middle">KINA</text>
<rect x="16" y="70" width="160" height="130" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<rect x="208" y="70" width="160" height="130" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
<rect x="400" y="70" width="160" height="130" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<rect x="592" y="70" width="132" height="130" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<line x1="96" y1="98" x2="61" y2="119" stroke="#7a93c4" stroke-width="1.3"/>
<line x1="96" y1="98" x2="131" y2="119" stroke="#7a93c4" stroke-width="1.3"/>
<line x1="61" y1="129" x2="41" y2="150" stroke="#7a93c4" stroke-width="1.3"/>
<line x1="61" y1="129" x2="81" y2="150" stroke="#7a93c4" stroke-width="1.3"/>
<line x1="131" y1="129" x2="111" y2="150" stroke="#7a93c4" stroke-width="1.3"/>
<line x1="131" y1="129" x2="151" y2="150" stroke="#7a93c4" stroke-width="1.3"/>
<circle cx="96" cy="92" r="6" fill="#7a93c4"/>
<circle cx="61" cy="124" r="5" fill="#7a93c4"/>
<circle cx="131" cy="124" r="5" fill="#7a93c4"/>
<circle cx="41" cy="154" r="4" fill="#ffffff" stroke="#7a93c4" stroke-width="1.3"/>
<circle cx="81" cy="154" r="4" fill="#ffffff" stroke="#7a93c4" stroke-width="1.3"/>
<circle cx="111" cy="154" r="4" fill="#ffffff" stroke="#7a93c4" stroke-width="1.3"/>
<circle cx="151" cy="154" r="4" fill="#ffffff" stroke="#7a93c4" stroke-width="1.3"/>
<text x="96" y="184" font-size="13" text-anchor="middle">261 leaf disciplines</text>
<circle cx="232" cy="104" r="11" fill="#ffffff" stroke="#d9b56a" stroke-width="1.3"/>
<circle cx="260" cy="104" r="11" fill="#ffffff" stroke="#d9b56a" stroke-width="1.3"/>
<circle cx="288" cy="104" r="11" fill="#ffffff" stroke="#d9b56a" stroke-width="1.3"/>
<circle cx="316" cy="104" r="11" fill="#ffffff" stroke="#d9b56a" stroke-width="1.3"/>
<circle cx="344" cy="104" r="11" fill="#ffffff" stroke="#d9b56a" stroke-width="1.3"/>
<circle cx="232" cy="140" r="11" fill="#ffffff" stroke="#d9b56a" stroke-width="1.3"/>
<circle cx="260" cy="140" r="11" fill="#ffffff" stroke="#d9b56a" stroke-width="1.3"/>
<circle cx="288" cy="140" r="11" fill="#d9b56a" stroke="#d9b56a" stroke-width="1.3"/>
<circle cx="316" cy="140" r="11" fill="#ffffff" stroke="#d9b56a" stroke-width="1.3"/>
<circle cx="344" cy="140" r="11" fill="#ffffff" stroke="#d9b56a" stroke-width="1.3"/>
<text x="232" y="108" font-size="12" text-anchor="middle">A</text>
<text x="260" y="108" font-size="12" text-anchor="middle">B</text>
<text x="288" y="108" font-size="12" text-anchor="middle">C</text>
<text x="316" y="108" font-size="12" text-anchor="middle">D</text>
<text x="344" y="108" font-size="12" text-anchor="middle">E</text>
<text x="232" y="144" font-size="12" text-anchor="middle">F</text>
<text x="260" y="144" font-size="12" text-anchor="middle">G</text>
<text x="288" y="144" font-size="12" fill="#ffffff" text-anchor="middle">H</text>
<text x="316" y="144" font-size="12" text-anchor="middle">I</text>
<text x="344" y="144" font-size="12" text-anchor="middle">J</text>
<text x="288" y="184" font-size="13" text-anchor="middle">chance ≈ 10%</text>
<text x="424" y="110" font-size="15" font-weight="bold" fill="#d98a9e">✗</text>
<text x="442" y="110" font-size="13">memorization</text>
<text x="442" y="127" font-size="12" fill="#6a7280">filtered out</text>
<text x="424" y="158" font-size="15" font-weight="bold" fill="#7ab89a">✓</text>
<text x="442" y="158" font-size="13">genuine reasoning</text>
<text x="442" y="175" font-size="12" fill="#6a7280">kept</text>
<text x="658" y="112" font-size="13" text-anchor="middle">261 disciplines</text>
<text x="658" y="138" font-size="13" text-anchor="middle">high density</text>
<text x="658" y="164" font-size="13" text-anchor="middle">living benchmark</text>
<path d="M180 135 H203" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#kina-arr-a)"/>
<path d="M372 135 H395" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#kina-arr-a)"/>
<path d="M564 135 H587" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#kina-arr-a)"/>
</g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: how a KINA item is built — drawn from a three-level taxonomy of 261 disciplines, posed with 10 options to suppress guessing, and kept only if it survives the difficulty filter.</p>
</div>

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/kina/discipline_sunburst.png" loading="lazy" alt="Discipline coverage sunburst">
    <img src="/images/kina/kina_top10_upset.png" loading="lazy" alt="Top-10 model ranking">
  </div>
</div>

The annotation pipeline is designed around a **Nash equilibrium incentive structure**. Reviewer payoffs are structured so that honest, independent evaluation is the individually rational strategy, making collusion and lazy consensus irrational at equilibrium. This game-theoretic design is domain-agnostic and is released as a reusable framework alongside the dataset.

The two panels below contrast conventional blind-trust review with KINA's incentive-aligned pipeline.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 356" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lazy consensus versus KINA's incentive-aligned review" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
<defs>
<marker id="kina-arr-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#7a93c4"/></marker>
<marker id="kina-arr-b2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#d98a9e"/></marker>
</defs>
<g font-family="Helvetica, Arial, sans-serif" fill="#3d4656">
<text x="186" y="30" font-size="15" font-weight="bold" text-anchor="middle">Blind-trust review (lazy consensus)</text>
<text x="554" y="30" font-size="15" font-weight="bold" text-anchor="middle">KINA payoff design (equilibrium)</text>
<rect x="16" y="42" width="340" height="300" rx="12" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<rect x="384" y="42" width="340" height="300" rx="12" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<rect x="96" y="60" width="180" height="36" rx="8" fill="#ffffff" stroke="#d98a9e" stroke-width="1.2"/>
<text x="186" y="83" font-size="13" text-anchor="middle">question + draft answer</text>
<path d="M150 96 L86 149" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#kina-arr-b)"/>
<circle cx="76" cy="172" r="19" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="76" y="177" font-size="13" font-weight="bold" text-anchor="middle">R1</text>
<circle cx="186" cy="172" r="19" fill="#ffffff" stroke="#d98a9e" stroke-width="1.5"/>
<text x="186" y="177" font-size="13" font-weight="bold" text-anchor="middle">R2</text>
<circle cx="296" cy="172" r="19" fill="#ffffff" stroke="#d98a9e" stroke-width="1.5"/>
<text x="296" y="177" font-size="13" font-weight="bold" text-anchor="middle">R3</text>
<path d="M97 172 L164 172" stroke="#d98a9e" stroke-width="1.8" stroke-dasharray="5 4" fill="none" marker-end="url(#kina-arr-b2)"/>
<path d="M207 172 L274 172" stroke="#d98a9e" stroke-width="1.8" stroke-dasharray="5 4" fill="none" marker-end="url(#kina-arr-b2)"/>
<text x="130" y="161" font-size="12" fill="#d98a9e" text-anchor="middle">copies</text>
<text x="240" y="161" font-size="12" fill="#d98a9e" text-anchor="middle">copies</text>
<text x="76" y="209" font-size="12" text-anchor="middle">✓ real check</text>
<text x="186" y="209" font-size="12" fill="#6a7280" text-anchor="middle">✓ echoed</text>
<text x="296" y="209" font-size="12" fill="#6a7280" text-anchor="middle">✓ echoed</text>
<path d="M186 220 L186 251" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#kina-arr-b)"/>
<rect x="61" y="256" width="250" height="62" rx="8" fill="#ffffff" stroke="#d98a9e" stroke-width="1.2"/>
<text x="186" y="281" font-size="13" text-anchor="middle">unanimous 3–0 label,</text>
<text x="186" y="300" font-size="13" text-anchor="middle">only one independent evaluation</text>
<rect x="464" y="60" width="180" height="36" rx="8" fill="#ffffff" stroke="#7ab89a" stroke-width="1.2"/>
<text x="554" y="83" font-size="13" text-anchor="middle">question + draft answer</text>
<path d="M506 96 L450 149" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#kina-arr-b)"/>
<path d="M554 96 L554 149" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#kina-arr-b)"/>
<path d="M602 96 L658 149" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#kina-arr-b)"/>
<circle cx="444" cy="172" r="19" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="444" y="177" font-size="13" font-weight="bold" text-anchor="middle">R1</text>
<circle cx="554" cy="172" r="19" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="554" y="177" font-size="13" font-weight="bold" text-anchor="middle">R2</text>
<circle cx="664" cy="172" r="19" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="664" y="177" font-size="13" font-weight="bold" text-anchor="middle">R3</text>
<text x="444" y="209" font-size="12" text-anchor="middle">✓ own verdict</text>
<text x="554" y="209" font-size="12" text-anchor="middle">✓ own verdict</text>
<text x="664" y="209" font-size="12" text-anchor="middle">✗ own verdict</text>
<path d="M444 217 L444 234" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#kina-arr-b)"/>
<path d="M554 217 L554 234" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#kina-arr-b)"/>
<path d="M664 217 L664 234" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#kina-arr-b)"/>
<rect x="424" y="238" width="260" height="52" rx="8" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.2"/>
<text x="554" y="259" font-size="13" text-anchor="middle">payoffs reward accurate, independent</text>
<text x="554" y="277" font-size="13" text-anchor="middle">review — collusion doesn't pay</text>
<path d="M554 292 L554 303" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#kina-arr-b)"/>
<rect x="424" y="306" width="260" height="32" rx="8" fill="#ffffff" stroke="#7ab89a" stroke-width="1.2"/>
<text x="554" y="326" font-size="13" font-weight="bold" text-anchor="middle">honesty is the equilibrium strategy</text>
</g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: why blind-trust annotation collapses into lazy consensus, and how KINA's reviewer payoffs make honest, independent evaluation each reviewer's rational strategy.</p>
</div>

We evaluated **37 frontier models** on KINA. Key findings include:

- Significant room for improvement remains in **domain-specific knowledge**, even for top models.
- **Closed-source flagship models** still maintain a leading position on knowledge-intensive tasks.
- Web search tools exhibit a **non-monotonic, U-shaped efficacy**: both weaker and stronger models benefit substantially, while mid-tier models benefit less. The strongest model (Gemini-3.1-Pro-Preview) recorded the largest absolute gain at +5.17%.
- The top-10 models show **more pronounced performance differences in humanities and social sciences** than in hard sciences.

The schematic below sketches the U-shaped search-tool effect from the third finding.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 284" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schematic U-shaped benefit of web search across model capability" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
<defs>
<marker id="kina-arr-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#3d4656"/></marker>
</defs>
<g font-family="Helvetica, Arial, sans-serif" fill="#3d4656">
<path d="M100 92 C 210 190, 300 202, 385 202 C 470 202, 560 185, 655 78 L655 231 L100 231 Z" fill="#eef2f7"/>
<path d="M100 92 C 210 190, 300 202, 385 202 C 470 202, 560 185, 655 78" fill="none" stroke="#7a93c4" stroke-width="3" stroke-linecap="round"/>
<path d="M70 232 H704" stroke="#3d4656" stroke-width="1.5" fill="none" marker-end="url(#kina-arr-c)"/>
<path d="M70 232 V50" stroke="#3d4656" stroke-width="1.5" fill="none" marker-end="url(#kina-arr-c)"/>
<circle cx="100" cy="92" r="6" fill="#7ab89a" stroke="#ffffff" stroke-width="1.5"/>
<circle cx="385" cy="202" r="6" fill="#d9b56a" stroke="#ffffff" stroke-width="1.5"/>
<circle cx="655" cy="78" r="6" fill="#d98a9e" stroke="#ffffff" stroke-width="1.5"/>
<text x="88" y="54" font-size="13" font-weight="bold">weaker models</text>
<text x="88" y="72" font-size="13">substantial gains</text>
<text x="385" y="168" font-size="13" font-weight="bold" text-anchor="middle">mid-tier models</text>
<text x="385" y="186" font-size="13" text-anchor="middle">smallest benefit</text>
<text x="700" y="42" font-size="13" font-weight="bold" text-anchor="end">strongest models</text>
<text x="700" y="60" font-size="13" text-anchor="end">largest gains</text>
<text x="640" y="83" font-size="13" font-weight="bold" fill="#d98a9e" text-anchor="end">+5.17%</text>
<text x="100" y="252" font-size="12" fill="#6a7280" text-anchor="middle">weaker</text>
<text x="655" y="252" font-size="12" fill="#6a7280" text-anchor="middle">stronger</text>
<text x="387" y="272" font-size="13" text-anchor="middle">base model capability</text>
<text transform="rotate(-90 30 140)" x="30" y="140" font-size="13" text-anchor="middle">gain from web search</text>
<text x="700" y="222" font-size="12" font-style="italic" fill="#6a7280" text-anchor="end">illustrative, not to scale</text>
</g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: schematic of the U-shaped efficacy of web-search tools — weak and strong models gain most, mid-tier models least; the largest absolute gain (+5.17%) went to Gemini-3.1-Pro-Preview.</p>
</div>

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/kina/heatmap.png" loading="lazy" alt="Model performance heatmap">
    <img src="/images/kina/kina_scaling_law.png" loading="lazy" alt="Scaling law analysis">
  </div>
</div>

KINA is designed to be continuously updated. The benchmark, annotation guidelines, and evaluation framework are released publicly alongside the dataset.
