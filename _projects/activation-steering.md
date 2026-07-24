---
title: Improving Activation Steering
date: 2026-05-01 08:00:00 +0000
subtitle: Gated Cropped Attention-Delta Steering fixes KV-cache contamination in multi-turn dialogue
image: '/images/activation-steering/steering_vs_prompt_coherence.png'
---

This page describes **Prompt–Activation Duality: Improving Activation Steering via Attention-Level Interventions**, submitted to NeurIPS 2026.

Activation steering controls language model behavior by adding a direction in the residual stream at inference time — a lightweight, reversible alternative to fine-tuning. But standard residual-stream steering has a hidden failure mode in **stateful, multi-turn dialogue**: steered token states get stored in the KV cache and repeatedly reused, turning a local perturbation into cumulative coherence degradation across conversation turns.

We identify this failure mode as **KV-cache contamination** and show that coherence deteriorates across turns even when single-turn behavior looks strong. Crucially, prompt-only control remains stable under the same protocol — so the problem is not long context alone. The intervention is entering the computation at the wrong site.

The diagram below shows how the contamination loop builds up across turns, and why prompt-only control avoids it.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="KV-cache contamination under residual-stream steering versus prompt-only control" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif">
<defs>
<marker id="kv-a-slate" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#6a7280"/></marker>
<marker id="kv-a-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d98a9e"/></marker>
<marker id="kv-a-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#7ab89a"/></marker>
</defs>
<text x="30" y="30" font-size="15" font-weight="700" fill="#3d4656">Standard residual-stream steering</text>
<line x1="470" y1="22" x2="500" y2="22" stroke="#6a7280" stroke-width="1.6" marker-end="url(#kv-a-slate)"/>
<text x="507" y="26" font-size="12" fill="#6a7280">states written to cache</text>
<line x1="470" y1="40" x2="500" y2="40" stroke="#6a7280" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#kv-a-slate)"/>
<text x="507" y="44" font-size="12" fill="#6a7280">re-read by attention</text>
<rect x="30" y="52" width="150" height="46" rx="8" fill="#fdf3f3" stroke="#d98a9e"/>
<text x="105" y="72" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Turn 1</text>
<text x="105" y="89" font-size="12" fill="#3d4656" text-anchor="middle">+Δ in residual stream</text>
<rect x="250" y="52" width="150" height="46" rx="8" fill="#fdf3f3" stroke="#d98a9e"/>
<text x="325" y="72" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Turn 2</text>
<text x="325" y="89" font-size="12" fill="#3d4656" text-anchor="middle">+Δ in residual stream</text>
<rect x="470" y="52" width="150" height="46" rx="8" fill="#fdf3f3" stroke="#d98a9e"/>
<text x="545" y="72" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Turn 3</text>
<text x="545" y="89" font-size="12" fill="#3d4656" text-anchor="middle">+Δ in residual stream</text>
<line x1="184" y1="75" x2="243" y2="75" stroke="#6a7280" stroke-width="1.6" marker-end="url(#kv-a-slate)"/>
<line x1="404" y1="75" x2="463" y2="75" stroke="#6a7280" stroke-width="1.6" marker-end="url(#kv-a-slate)"/>
<text x="30" y="140" font-size="13" font-weight="700" fill="#3d4656">KV cache</text>
<rect x="30" y="146" width="100" height="34" fill="#eef2f7" stroke="#7a93c4"/>
<text x="80" y="167" font-size="12" fill="#3d4656" text-anchor="middle">sys prompt</text>
<rect x="130" y="146" width="180" height="34" fill="#fbe9ec" stroke="#d98a9e"/>
<text x="220" y="167" font-size="12" fill="#3d4656" text-anchor="middle">turn-1 steered states</text>
<rect x="310" y="146" width="190" height="34" fill="#f7dbe1" stroke="#d98a9e"/>
<text x="405" y="167" font-size="12" fill="#3d4656" text-anchor="middle">turn-2 steered states</text>
<rect x="500" y="146" width="190" height="34" fill="#f3ccd6" stroke="#d98a9e"/>
<text x="595" y="167" font-size="12" fill="#3d4656" text-anchor="middle">turn-3 steered states</text>
<line x1="115" y1="100" x2="205" y2="142" stroke="#d98a9e" stroke-width="1.6" marker-end="url(#kv-a-red)"/>
<line x1="330" y1="100" x2="398" y2="142" stroke="#d98a9e" stroke-width="1.6" marker-end="url(#kv-a-red)"/>
<line x1="548" y1="100" x2="588" y2="142" stroke="#d98a9e" stroke-width="1.6" marker-end="url(#kv-a-red)"/>
<line x1="245" y1="142" x2="290" y2="102" stroke="#d98a9e" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#kv-a-red)"/>
<line x1="430" y1="142" x2="505" y2="102" stroke="#d98a9e" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#kv-a-red)"/>
<text x="360" y="204" font-size="13" font-style="italic" fill="#6a7280" text-anchor="middle">Each turn re-reads steered entries — the perturbation compounds and coherence drifts</text>
<line x1="30" y1="222" x2="690" y2="222" stroke="#e8e4da"/>
<text x="30" y="248" font-size="15" font-weight="700" fill="#3d4656">Prompt-only control (same multi-turn protocol)</text>
<rect x="30" y="262" width="150" height="46" rx="8" fill="#eef7f1" stroke="#7ab89a"/>
<text x="105" y="282" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Turn 1</text>
<text x="105" y="299" font-size="12" fill="#3d4656" text-anchor="middle">control via sys prompt</text>
<rect x="250" y="262" width="150" height="46" rx="8" fill="#eef7f1" stroke="#7ab89a"/>
<text x="325" y="282" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Turn 2</text>
<text x="325" y="299" font-size="12" fill="#3d4656" text-anchor="middle">control via sys prompt</text>
<rect x="470" y="262" width="150" height="46" rx="8" fill="#eef7f1" stroke="#7ab89a"/>
<text x="545" y="282" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Turn 3</text>
<text x="545" y="299" font-size="12" fill="#3d4656" text-anchor="middle">control via sys prompt</text>
<line x1="184" y1="285" x2="243" y2="285" stroke="#6a7280" stroke-width="1.6" marker-end="url(#kv-a-slate)"/>
<line x1="404" y1="285" x2="463" y2="285" stroke="#6a7280" stroke-width="1.6" marker-end="url(#kv-a-slate)"/>
<text x="30" y="350" font-size="13" font-weight="700" fill="#3d4656">KV cache</text>
<rect x="30" y="356" width="150" height="34" fill="#eef7f1" stroke="#7ab89a"/>
<text x="105" y="377" font-size="12" fill="#3d4656" text-anchor="middle">system prompt</text>
<rect x="180" y="356" width="170" height="34" fill="#eef2f7" stroke="#7a93c4"/>
<text x="265" y="377" font-size="12" fill="#3d4656" text-anchor="middle">turn-1 clean states</text>
<rect x="350" y="356" width="170" height="34" fill="#eef2f7" stroke="#7a93c4"/>
<text x="435" y="377" font-size="12" fill="#3d4656" text-anchor="middle">turn-2 clean states</text>
<rect x="520" y="356" width="170" height="34" fill="#eef2f7" stroke="#7a93c4"/>
<text x="605" y="377" font-size="12" fill="#3d4656" text-anchor="middle">turn-3 clean states</text>
<line x1="115" y1="310" x2="250" y2="352" stroke="#7ab89a" stroke-width="1.6" marker-end="url(#kv-a-green)"/>
<line x1="330" y1="310" x2="430" y2="352" stroke="#7ab89a" stroke-width="1.6" marker-end="url(#kv-a-green)"/>
<line x1="548" y1="310" x2="598" y2="352" stroke="#7ab89a" stroke-width="1.6" marker-end="url(#kv-a-green)"/>
<line x1="135" y1="352" x2="285" y2="312" stroke="#7ab89a" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#kv-a-green)"/>
<path d="M150,354 C 320,306 430,306 505,313" fill="none" stroke="#7ab89a" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#kv-a-green)"/>
<text x="360" y="416" font-size="13" font-style="italic" fill="#6a7280" text-anchor="middle">Cached states stay clean — coherence remains stable across turns</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: The KV-cache contamination loop under residual-stream steering (top), absent under prompt-only control (bottom).</p>
</div>

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/activation-steering/steering_vs_prompt_coherence.png" loading="lazy" alt="Coherence comparison across turns">
    <img src="/images/activation-steering/method1.png" loading="lazy" alt="Method overview">
  </div>
</div>

To address this, we propose **Gated Cropped Attention-Delta steering (GCAD)**, which extracts steering signals from system-prompt contributions to self-attention and applies them with token-level gating. Rather than injecting a large residual-stream perturbation after attention and MLP computation have been combined, GCAD introduces smaller attention-level perturbations that subsequent layers can transform and integrate — following the same pathways through which system prompts already exercise behavioral control.

The diagram below contrasts the two intervention sites inside a transformer layer.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 425" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Comparison of intervention sites: post-block residual injection versus GCAD's gated attention-level delta" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif">
<defs>
<marker id="gc-a-slate" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#6a7280"/></marker>
<marker id="gc-a-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d98a9e"/></marker>
<marker id="gc-a-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d9b56a"/></marker>
</defs>
<text x="185" y="30" font-size="15" font-weight="700" fill="#3d4656" text-anchor="middle">Standard residual steering</text>
<text x="185" y="48" font-size="12" fill="#6a7280" text-anchor="middle">one large Δ, injected post-block</text>
<text x="550" y="30" font-size="15" font-weight="700" fill="#3d4656" text-anchor="middle">GCAD: gated, cropped, attention-level</text>
<text x="550" y="48" font-size="12" fill="#6a7280" text-anchor="middle">small gated Δ along the prompt pathway</text>
<line x1="365" y1="20" x2="365" y2="415" stroke="#e8e4da"/>
<text x="185" y="68" font-size="13" fill="#3d4656" text-anchor="middle">hidden state h</text>
<line x1="185" y1="74" x2="185" y2="84" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<rect x="100" y="88" width="170" height="38" rx="8" fill="#eef2f7" stroke="#7a93c4"/>
<text x="185" y="111" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Self-attention</text>
<line x1="185" y1="126" x2="185" y2="144" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<rect x="100" y="148" width="170" height="38" rx="8" fill="#eef2f7" stroke="#7a93c4"/>
<text x="185" y="171" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">MLP</text>
<line x1="185" y1="186" x2="185" y2="203" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<circle cx="185" cy="220" r="13" fill="#ffffff" stroke="#6a7280"/>
<text x="185" y="225" font-size="15" fill="#3d4656" text-anchor="middle">+</text>
<text x="208" y="224" font-size="12" fill="#6a7280">residual add</text>
<line x1="185" y1="233" x2="185" y2="292" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<rect x="22" y="246" width="132" height="42" rx="8" fill="#fdf3f3" stroke="#d98a9e"/>
<text x="88" y="263" font-size="13" font-weight="600" fill="#3d4656" text-anchor="middle">steering vector</text>
<text x="88" y="279" font-size="12" fill="#3d4656" text-anchor="middle">α·v (large Δ)</text>
<line x1="154" y1="267" x2="180" y2="267" stroke="#d98a9e" stroke-width="2" marker-end="url(#gc-a-red)"/>
<text x="200" y="262" font-size="12" fill="#6a7280">added after attn + MLP</text>
<text x="200" y="277" font-size="12" fill="#6a7280">outputs are combined</text>
<rect x="100" y="296" width="170" height="44" rx="8" fill="#fdf3f3" stroke="#d98a9e"/>
<text x="185" y="315" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">later layers</text>
<text x="185" y="331" font-size="12" fill="#3d4656" text-anchor="middle">resist the perturbation</text>
<line x1="185" y1="340" x2="185" y2="358" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<rect x="70" y="362" width="230" height="46" rx="8" fill="#fdf3f3" stroke="#d98a9e" stroke-dasharray="5 3"/>
<text x="185" y="381" font-size="13" font-weight="600" fill="#3d4656" text-anchor="middle">KV cache</text>
<text x="185" y="397" font-size="12" fill="#3d4656" text-anchor="middle">steered states stored and reused</text>
<text x="475" y="68" font-size="13" fill="#3d4656" text-anchor="middle">hidden state h</text>
<line x1="475" y1="74" x2="475" y2="84" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<rect x="390" y="88" width="170" height="38" rx="8" fill="#eef2f7" stroke="#7a93c4"/>
<text x="475" y="111" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Self-attention</text>
<line x1="475" y1="126" x2="475" y2="144" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<rect x="575" y="64" width="150" height="56" rx="8" fill="#fff8ea" stroke="#d9b56a"/>
<text x="650" y="82" font-size="12" font-weight="600" fill="#3d4656" text-anchor="middle">system-prompt</text>
<text x="650" y="96" font-size="12" font-weight="600" fill="#3d4656" text-anchor="middle">contribution to attention</text>
<text x="650" y="112" font-size="12" fill="#3d4656" text-anchor="middle">(cropped)</text>
<path d="M650,120 L650,137 L484,137" fill="none" stroke="#d9b56a" stroke-width="2" marker-end="url(#gc-a-gold)"/>
<text x="658" y="134" font-size="12" fill="#6a7280" text-anchor="start">small Δattn</text>
<circle cx="585" cy="137" r="12" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="585" y="141" font-size="12" fill="#3d4656" text-anchor="middle">g</text>
<text x="612" y="162" font-size="12" fill="#6a7280" text-anchor="start">token-level gate</text>
<rect x="390" y="148" width="170" height="38" rx="8" fill="#eef2f7" stroke="#7a93c4"/>
<text x="475" y="171" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">MLP</text>
<text x="650" y="192" font-size="12" font-style="italic" fill="#6a7280" text-anchor="middle">MLP and later layers</text>
<text x="650" y="207" font-size="12" font-style="italic" fill="#6a7280" text-anchor="middle">transform and integrate</text>
<text x="650" y="222" font-size="12" font-style="italic" fill="#6a7280" text-anchor="middle">the small delta</text>
<line x1="475" y1="186" x2="475" y2="203" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<circle cx="475" cy="220" r="13" fill="#ffffff" stroke="#6a7280"/>
<text x="475" y="225" font-size="15" fill="#3d4656" text-anchor="middle">+</text>
<line x1="475" y1="233" x2="475" y2="292" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<rect x="390" y="296" width="170" height="44" rx="8" fill="#eef7f1" stroke="#7ab89a"/>
<text x="475" y="315" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">later layers</text>
<text x="475" y="331" font-size="12" fill="#3d4656" text-anchor="middle">no downstream resistance</text>
<line x1="475" y1="340" x2="475" y2="358" stroke="#6a7280" stroke-width="1.6" marker-end="url(#gc-a-slate)"/>
<rect x="360" y="362" width="230" height="46" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-dasharray="5 3"/>
<text x="475" y="381" font-size="13" font-weight="600" fill="#3d4656" text-anchor="middle">KV cache</text>
<text x="475" y="397" font-size="12" fill="#3d4656" text-anchor="middle">states follow the prompt pathway</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Where each intervention enters the computation — post-block residual injection vs. GCAD's token-gated, attention-level delta.</p>
</div>

On persona-steering experiments with Qwen2.5-7B-Instruct:

- **Average coherence drift**: improved from −18.6 to −1.9 (standard steering vs. GCAD)
- **Turn-10 trait expression**: raised from 78.0% to 93.1%
- Trait control is preserved while long-horizon stability improves substantially

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/activation-steering/steering_vs_prompt_trait_expression.png" loading="lazy" alt="Trait expression comparison">
    <img src="/images/activation-steering/steering_vs_prompt_combined_vertical.png" loading="lazy" alt="Combined results">
  </div>
</div>

Mechanistic analysis shows that GCAD produces smoother perturbation trajectories that better align with downstream computation, while standard residual-stream steering elicits downstream resistance. The results suggest that activation steering becomes reliably usable in production settings only when interventions follow the prompt-mediated pathways that models already use for behavioral control.
