---
title: The Temporal Cave
date: 2024-05-15 08:00:00 +0300
subtitle: Testing the Platonic Representation Hypothesis for video
image: '/images/persona-collapse/kmeans_clusters.png'
---

In Plato's Allegory of the Cave, prisoners observe only shadows on a wall and mistake them for reality — their perception is a projection of a deeper truth they cannot directly access. Machine learning models face a similar situation: they observe training data, which is only an incomplete picture of reality, and construct internal representations accordingly.

The **Platonic Representation Hypothesis** posits that as models grow larger and more capable, their internal representations converge onto a true underlying reality — like the Platonic forms. Specifically, it predicts that models trained on different modalities or with different architectures will eventually learn the same representation as data and capacity increase.

This project tests that hypothesis in the video domain. We ask: do contrastive learners and autoencoders trained on video frames converge to similar representations, and how does the temporal window Δt used for positive sampling affect that convergence?

---

**Methods.** We train two architectures on the same video data. The contrastive learner uses temporally-close frames as positive pairs — frames within Δt seconds are treated as views of the same underlying scene state. The autoencoder learns by reconstruction alone, with no explicit temporal signal. Both share the same convolutional encoder architecture, producing 256-dimensional latent representations. We compare the two using a **mutual k-nearest-neighbor metric**: for each frame, we compute its k-nearest neighbors in both latent spaces and measure the overlap.

**Datasets.** We run experiments on two datasets of different visual complexity:
- *Moving MNIST* — 10,000 sequences of 20 frames, 64×64 pixels, two digits moving across the frame. Controlled and computationally tractable.
- *HMDB51* — ~7,000 video clips covering 51 action classes including body movement, facial expressions, and object interaction. More naturalistic and complex.

**Results.** On Moving MNIST, the autoencoder and contrastive learner representations show measurable similarity that increases as Δt grows — wider temporal windows force the contrastive learner to build more abstract, scene-level representations that align more closely with what the autoencoder independently discovers. The dependence on Δt provides a knob for controlling how "Platonic" the resulting representation is. On HMDB51 the same trend holds but is weaker, consistent with the greater complexity of the visual world making convergence harder to achieve at the scales we tested.

The results provide partial support for the Platonic Representation Hypothesis within a controlled video domain. Two architectures trained with different objectives — one explicitly temporal, one not — do converge toward a shared representation, but the degree of convergence is sensitive to the temporal window and dataset complexity. Whether this convergence continues to a single true representation at larger scales remains an open question.

*Final project for 6.7960 (Deep Learning), MIT. Joint work with Adithya Balachandran and Alex Gu.*
