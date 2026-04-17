---
title: Persona Collapse
date: 2024-08-19 08:02:35 +0300
subtitle: Studying how language models compress human variation
image: '/images/persona-collapse/spectral_clusters.png'
---

When language models are asked to respond as many different kinds of people — different ages, political views, personalities, socioeconomic backgrounds — do they actually produce meaningfully different responses? Or do they collapse distinct personas into a small set of repeated behavioral patterns?

This project answers that question empirically across 16 frontier models. We simulate 2,000 diverse personas drawn from real demographic and psychological distributions and ask models to respond to moral reasoning scenarios and social dilemmas as each one. We then embed all responses and measure how much of the human behavioral space survives.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/persona-collapse/kmeans_clusters.png" loading="lazy" alt="KMeans clustering at K=2 — despite 2000 distinct personas, responses split into two dominant behavioral modes">
    <img src="/images/persona-collapse/spectral_clusters.png" loading="lazy" alt="Spectral clustering shows the same two-cluster collapse with sharp boundaries">
  </div>
</div>

**The collapse is severe.** Across nearly every model tested, the Hopkins statistic — a measure of how strongly data clusters — is essentially 1.0, compared to 0.59 for actual humans. This means model responses are maximally clustered: despite receiving 2,000 distinct persona prompts, the outputs converge on a few tight behavioral modes. The intrinsic dimensionality of model responses (LID ≈ 5–15) is far below that of human responses (LID = 32.3), confirming that models operate in a much lower-dimensional behavioral space.

The most direct measure of collapse is **recall** — what fraction of the actual diversity of human responses does the model's output space cover? For most frontier models the answer is close to zero:

- Claude Sonnet 4.6: recall = 0.029 (covers 3% of human behavioral space)
- Llama 3.1 8B: recall = 0.013
- Qwen3 32B: recall = 0.014
- Claude Haiku 3.5: recall = 0.443 (the most diverse of the group, but at the cost of lower precision)

High **precision** (0.6–0.9 across models) means model responses are recognizably human-like — they are not random or incoherent. The problem is that they cover almost none of the actual variation in how humans reason about the same scenarios.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/persona-collapse/pca_persona.png" loading="lazy" alt="PCA colored by persona identity — despite 2000 distinct identities, the response cloud shows almost no color separation, confirming that persona identity does not predict response placement">
  </div>
</div>

The PCA plot above is one of the clearest illustrations. Points are colored by persona identity — 2,000 distinct identities should produce 2,000 distinct colors spreading across the space. Instead the cloud is nearly uniform, with almost no color separation. The model's outputs do not depend meaningfully on who is supposed to be giving them.

A few findings cut against the simple story of total collapse. **Minimax M2 Her** is a strong outlier: Hopkins = 0.28 (nearly random), recall = 0.51, but precision = 0.08 — its responses are highly diverse but mostly fall outside the range of human responses entirely, suggesting a different failure mode. **Fine-tuned models** trained on persona-conditioned data can recover some recall (ds200\_Qwen3-32B reaches 0.26 vs 0.01 for the base model), showing that the collapse is not inevitable. **Thinking mode** (chain-of-thought) does not help: Qwen3-32B thinking and non-thinking are nearly identical on every metric.

The deeper concern is not performance but representation. If AI systems are deployed to simulate users, generate synthetic diversity for evaluation, or stand in for human perspectives in product testing, what they actually represent is a much smaller slice of behavioral space than the input demographic diversity implies. A system that claims to represent 2,000 personas but delivers the equivalent of 2–3 behavioral modes is not providing the diversity it promises.

This project is ongoing, running experiments across multiple model families with a growing set of metrics: Hopkins statistic, silhouette score, V-measure, intrinsic dimensionality (LID), and Precision/Recall/Density/Coverage (PRDC) against a human baseline from an adapted Moral Foundations survey.
