---
title: Improving Activation Steering
date: 2026-05-01 08:00:00 +0000
subtitle: Gated Cropped Attention-Delta Steering fixes KV-cache contamination in multi-turn dialogue
image: '/images/activation-steering/steering_vs_prompt_coherence.png'
---

This page describes **Prompt–Activation Duality: Improving Activation Steering via Attention-Level Interventions**, submitted to NeurIPS 2026.

Activation steering controls language model behavior by adding a direction in the residual stream at inference time — a lightweight, reversible alternative to fine-tuning. But standard residual-stream steering has a hidden failure mode in **stateful, multi-turn dialogue**: steered token states get stored in the KV cache and repeatedly reused, turning a local perturbation into cumulative coherence degradation across conversation turns.

We identify this failure mode as **KV-cache contamination** and show that coherence deteriorates across turns even when single-turn behavior looks strong. Crucially, prompt-only control remains stable under the same protocol — so the problem is not long context alone. The intervention is entering the computation at the wrong site.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/activation-steering/steering_vs_prompt_coherence.png" loading="lazy" alt="Coherence comparison across turns">
    <img src="/images/activation-steering/method1.png" loading="lazy" alt="Method overview">
  </div>
</div>

To address this, we propose **Gated Cropped Attention-Delta steering (GCAD)**, which extracts steering signals from system-prompt contributions to self-attention and applies them with token-level gating. Rather than injecting a large residual-stream perturbation after attention and MLP computation have been combined, GCAD introduces smaller attention-level perturbations that subsequent layers can transform and integrate — following the same pathways through which system prompts already exercise behavioral control.

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
