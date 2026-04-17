---
title: Persona Collapse
date: 2024-08-19 08:02:35 +0300
subtitle: Studying how language models compress human variation
image: '/images/persona-collapse/kmeans_clusters.png'
---

When language models are asked to respond as many different kinds of people — different ages, political views, personality traits, socioeconomic backgrounds — do they actually produce meaningfully different responses? Or do they collapse distinct personas into a small set of repeated behavioral patterns?

This project studies that question empirically. We simulate 2,000 diverse personas drawn from real demographic and psychological distributions and ask frontier models to respond to moral reasoning scenarios and social dilemmas as each one. We then embed the responses and measure how much variation survives.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/persona-collapse/kmeans_clusters.png" loading="lazy" alt="KMeans clustering of persona responses — points collapse toward a few centroids">
    <img src="/images/persona-collapse/pca_persona.png" loading="lazy" alt="PCA visualization colored by persona identity — most responses overlap in a tight central region">
  </div>
</div>

The clustering visualizations tell the story directly. Even with 2,000 distinct personas as input, model responses occupy a much smaller region of the embedding space than human responses do. KMeans with K=2 or K=3 recovers sharp, well-separated clusters — meaning the model's output mode dominates individual persona variation. PCA colored by persona identity shows most responses collapsing into a dense central region, with only a thin periphery of differentiated outputs.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/persona-collapse/spectral_clusters.png" loading="lazy" alt="Spectral clustering on response embeddings across personas — similar collapse pattern">
  </div>
</div>

We find this pattern consistently across models, including frontier systems like Claude Sonnet 4.6 and Llama 3.3 70B. The collapse is not uniform — models tend to preserve variation along a few salient dimensions (such as broad political orientation) while flattening others (occupation, marital status, socioeconomic class). Some specialized models trained on persona-like data show slightly more spread, but the core pattern holds.

What makes this technically and humanly interesting is not just that models compress. It is that they do so unevenly, in ways that tend to preserve legible identity signals while erasing the more granular variation that shapes how people actually reason. If AI systems are being deployed to simulate users, personalize interfaces, or stand in for human perspectives, it matters whether they can sustain nuance or whether they default to a small set of stereotyped response modes.

This project is ongoing. The codebase includes experiments across multiple model families, clustering metrics (silhouette score, V-measure, Hopkins statistic), and comparisons against human response distributions from an adapted Moral Foundations survey.
