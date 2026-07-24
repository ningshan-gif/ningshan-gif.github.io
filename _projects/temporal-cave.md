---
title: The Temporal Cave
date: 2024-05-15 08:00:00 +0300
subtitle: Testing the Platonic Representation Hypothesis for video
image: '/images/temporal-cave/autoencoder_recon.png'
---

In Plato's Allegory of the Cave, prisoners observe only shadows on the wall and mistake them for reality — their perception is a projection of a deeper truth they cannot directly access. Machine learning models face a similar situation: they observe training data, which is only an incomplete picture of reality, and construct internal representations accordingly.

The **Platonic Representation Hypothesis** posits that as models grow larger and more capable, their internal representations converge onto a true underlying reality. It predicts that models trained on different architectures or with different objectives will eventually learn the same representation as data and capacity increase. This project tests that hypothesis in the video domain: do contrastive learners and autoencoders trained on the same video data converge to similar representations, and how does the temporal window Δt affect that convergence?

**Datasets.** We run experiments on two datasets with different visual complexity:

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/temporal-cave/hmdb51_grid.png" loading="lazy" alt="HMDB51 — 51 action classes including body movement, facial expressions, and object interaction">
  </div>
</div>

- *Moving MNIST* — 10,000 sequences of 20 frames at 64×64. Two digits moving across a black background; controlled, computationally tractable.
- *HMDB51* — ~7,000 clips across 51 action classes (brush hair, cartwheel, dive, fencing…). More naturalistic and visually complex.

**Methods.** We train a contrastive learner using temporally-close frames as positive pairs — frames within Δt seconds are treated as views of the same underlying scene state, all other frames as negatives. We train an autoencoder on the same data using MSE reconstruction loss, with no temporal signal at all. Both share the same convolutional encoder architecture producing a 256-dimensional latent space. To compare them we use a **mutual k-nearest-neighbor metric**: for each frame, we find its k nearest neighbors in both latent spaces and measure the overlap.

The diagram below shows the full training setup and where the temporal window Δt enters it.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Training setup: a contrastive branch using frames within Δt as positive pairs, and an autoencoder branch with no temporal signal, both encoding into a 256-dimensional latent space" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="Helvetica,Arial,sans-serif">
  <defs>
    <marker id="tc-arrow1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#7a93c4"/>
    </marker>
  </defs>
  <text x="12" y="56" font-size="13" fill="#3d4656">video sequence</text>
  <rect x="118" y="32" width="44" height="40" rx="4" fill="#fdf3f3" stroke="#d98a9e"/>
  <rect x="170" y="32" width="44" height="40" rx="4" fill="#fdf3f3" stroke="#d98a9e"/>
  <rect x="222" y="32" width="44" height="40" rx="4" fill="#fdf3f3" stroke="#d98a9e"/>
  <rect x="274" y="32" width="44" height="40" rx="4" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <rect x="326" y="32" width="44" height="40" rx="4" fill="#eef2f7" stroke="#7a93c4" stroke-width="2"/>
  <rect x="378" y="32" width="44" height="40" rx="4" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <rect x="430" y="32" width="44" height="40" rx="4" fill="#fdf3f3" stroke="#d98a9e"/>
  <rect x="482" y="32" width="44" height="40" rx="4" fill="#fdf3f3" stroke="#d98a9e"/>
  <rect x="534" y="32" width="44" height="40" rx="4" fill="#fdf3f3" stroke="#d98a9e"/>
  <rect x="586" y="32" width="44" height="40" rx="4" fill="#fdf3f3" stroke="#d98a9e"/>
  <text x="348" y="24" text-anchor="middle" font-size="12" font-weight="bold" fill="#5d708f">anchor</text>
  <path d="M274 80 L274 86 L422 86 L422 80" fill="none" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="348" y="103" text-anchor="middle" font-size="12.5" fill="#4f8a6d">within Δt: positives</text>
  <text x="170" y="103" text-anchor="middle" font-size="12.5" fill="#b3576f">negatives</text>
  <text x="558" y="103" text-anchor="middle" font-size="12.5" fill="#b3576f">negatives</text>
  <text x="40" y="140" font-size="13" font-weight="bold" fill="#3d4656">Contrastive branch — uses the temporal signal</text>
  <rect x="40" y="155" width="34" height="34" rx="3" fill="#eef7f1" stroke="#7ab89a"/>
  <rect x="52" y="165" width="34" height="34" rx="3" fill="#eef2f7" stroke="#7a93c4"/>
  <text x="63" y="220" text-anchor="middle" font-size="12" fill="#6a7280">frame pair</text>
  <path d="M92 177 L136 177" stroke="#7a93c4" stroke-width="1.8" marker-end="url(#tc-arrow1)"/>
  <rect x="142" y="152" width="170" height="50" rx="8" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="227" y="173" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">conv encoder</text>
  <text x="227" y="191" text-anchor="middle" font-size="12" fill="#6a7280">(shared architecture)</text>
  <path d="M312 177 L356 177" stroke="#7a93c4" stroke-width="1.8" marker-end="url(#tc-arrow1)"/>
  <rect x="360" y="152" width="132" height="50" rx="8" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
  <text x="426" y="182" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">256-d latent</text>
  <text x="512" y="166" font-size="12.5" font-weight="bold" fill="#3d4656">contrastive loss:</text>
  <text x="512" y="183" font-size="12" fill="#6a7280">pull positives together,</text>
  <text x="512" y="199" font-size="12" fill="#6a7280">push negatives apart</text>
  <text x="40" y="246" font-size="13" font-weight="bold" fill="#3d4656">Autoencoder branch — no temporal signal</text>
  <rect x="46" y="266" width="34" height="34" rx="3" fill="#eef2f7" stroke="#7a93c4"/>
  <text x="63" y="322" text-anchor="middle" font-size="12" fill="#6a7280">single frame</text>
  <path d="M88 283 L136 283" stroke="#7a93c4" stroke-width="1.8" marker-end="url(#tc-arrow1)"/>
  <rect x="142" y="258" width="170" height="50" rx="8" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="227" y="279" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">conv encoder</text>
  <text x="227" y="297" text-anchor="middle" font-size="12" fill="#6a7280">(same architecture)</text>
  <path d="M312 283 L356 283" stroke="#7a93c4" stroke-width="1.8" marker-end="url(#tc-arrow1)"/>
  <rect x="360" y="258" width="132" height="50" rx="8" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
  <text x="426" y="288" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">256-d latent</text>
  <path d="M492 283 L534 283" stroke="#7a93c4" stroke-width="1.8" marker-end="url(#tc-arrow1)"/>
  <rect x="538" y="258" width="100" height="50" rx="8" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
  <text x="588" y="288" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">decoder</text>
  <path d="M638 283 L682 283" stroke="#7a93c4" stroke-width="1.8" marker-end="url(#tc-arrow1)"/>
  <rect x="686" y="266" width="34" height="34" rx="3" fill="#eef2f7" stroke="#7a93c4" stroke-dasharray="3 2"/>
  <text x="703" y="322" text-anchor="middle" font-size="12" fill="#6a7280">recon</text>
  <text x="588" y="322" text-anchor="middle" font-size="12" fill="#6a7280">MSE reconstruction loss</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: two objectives, one encoder — the contrastive branch treats frames within Δt as views of the same scene state, while the autoencoder sees each frame in isolation; both map into a 256-d latent space.</p>
</div>

**Results — autoencoder reconstruction.** The autoencoder reconstructs Moving MNIST frames as blurred versions of the originals, capturing the main digit structure even when individual digits are not perfectly sharp.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/temporal-cave/autoencoder_recon.png" loading="lazy" alt="Original (top) vs autoencoder reconstructed (bottom) Moving MNIST frames">
  </div>
</div>

**Results — nearest neighbor structure.** At Δt=1 frame, contrastive learning forces the model to distinguish frames that are almost identical except for slight digit movement. The nearest neighbors it recovers look very similar to the query both in digit identity and position. The autoencoder's neighbors track digit identity more loosely.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/temporal-cave/nn_viz_dt1.png" loading="lazy" alt="Nearest neighbors at Δt=1: contrastive learning (left) vs autoencoder (right)">
  </div>
</div>

The diagram below shows how the mutual k-NN score used in the next experiment is computed.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 332" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mutual k-nearest-neighbor metric: a query frame's k nearest neighbors are found in the contrastive latent space and in the autoencoder latent space, and similarity is the fraction of shared neighbors" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="Helvetica,Arial,sans-serif">
  <defs>
    <marker id="tc-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#8b95a5"/>
    </marker>
  </defs>
  <text x="370" y="12" text-anchor="middle" font-size="13" fill="#3d4656">query frame</text>
  <rect x="353" y="16" width="34" height="34" rx="3" fill="#eef2f7" stroke="#7a93c4" stroke-width="2"/>
  <path d="M350 38 C296 46 250 60 214 78" fill="none" stroke="#8b95a5" stroke-width="1.6" marker-end="url(#tc-arrow2)"/>
  <path d="M390 38 C444 46 490 60 526 78" fill="none" stroke="#8b95a5" stroke-width="1.6" marker-end="url(#tc-arrow2)"/>
  <rect x="60" y="82" width="280" height="168" rx="12" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <rect x="400" y="82" width="280" height="168" rx="12" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
  <text x="200" y="104" text-anchor="middle" font-size="13" font-weight="bold" fill="#5d708f">contrastive latent space</text>
  <text x="540" y="104" text-anchor="middle" font-size="13" font-weight="bold" fill="#b3576f">autoencoder latent space</text>
  <line x1="200" y1="172" x2="148" y2="138" stroke="#a9bad4" stroke-width="1"/>
  <line x1="200" y1="172" x2="252" y2="146" stroke="#a9bad4" stroke-width="1"/>
  <line x1="200" y1="172" x2="120" y2="196" stroke="#a9bad4" stroke-width="1"/>
  <line x1="200" y1="172" x2="186" y2="220" stroke="#a9bad4" stroke-width="1"/>
  <line x1="200" y1="172" x2="258" y2="208" stroke="#a9bad4" stroke-width="1"/>
  <circle cx="110" cy="128" r="3.5" fill="#c6cdd6"/>
  <circle cx="305" cy="122" r="3.5" fill="#c6cdd6"/>
  <circle cx="95" cy="222" r="3.5" fill="#c6cdd6"/>
  <circle cx="312" cy="228" r="3.5" fill="#c6cdd6"/>
  <circle cx="148" cy="138" r="6.5" fill="#7ab89a"/>
  <circle cx="252" cy="146" r="6.5" fill="#7ab89a"/>
  <circle cx="186" cy="220" r="6.5" fill="#7ab89a"/>
  <circle cx="120" cy="196" r="6.5" fill="#d9b56a"/>
  <circle cx="258" cy="208" r="6.5" fill="#d9b56a"/>
  <text x="148" y="126" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">B</text>
  <text x="252" y="134" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">C</text>
  <text x="104" y="200" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">D</text>
  <text x="186" y="238" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">F</text>
  <text x="258" y="226" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">H</text>
  <circle cx="200" cy="172" r="6.5" fill="#7a93c4"/>
  <circle cx="200" cy="172" r="11.5" fill="none" stroke="#7a93c4" stroke-width="1.3" stroke-dasharray="3 2"/>
  <text x="200" y="152" text-anchor="middle" font-size="12" fill="#5d708f">query</text>
  <line x1="540" y1="172" x2="488" y2="138" stroke="#cfa9b4" stroke-width="1"/>
  <line x1="540" y1="172" x2="592" y2="146" stroke="#cfa9b4" stroke-width="1"/>
  <line x1="540" y1="172" x2="462" y2="196" stroke="#cfa9b4" stroke-width="1"/>
  <line x1="540" y1="172" x2="526" y2="220" stroke="#cfa9b4" stroke-width="1"/>
  <line x1="540" y1="172" x2="598" y2="208" stroke="#cfa9b4" stroke-width="1"/>
  <circle cx="450" cy="124" r="3.5" fill="#c6cdd6"/>
  <circle cx="648" cy="126" r="3.5" fill="#c6cdd6"/>
  <circle cx="438" cy="226" r="3.5" fill="#c6cdd6"/>
  <circle cx="652" cy="224" r="3.5" fill="#c6cdd6"/>
  <circle cx="488" cy="138" r="6.5" fill="#7ab89a"/>
  <circle cx="592" cy="146" r="6.5" fill="#7ab89a"/>
  <circle cx="526" cy="220" r="6.5" fill="#7ab89a"/>
  <circle cx="462" cy="196" r="6.5" fill="#d9b56a"/>
  <circle cx="598" cy="208" r="6.5" fill="#d9b56a"/>
  <text x="488" y="126" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">B</text>
  <text x="592" y="134" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">C</text>
  <text x="446" y="200" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">E</text>
  <text x="526" y="238" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">F</text>
  <text x="598" y="226" text-anchor="middle" font-size="12" font-weight="bold" fill="#3d4656">J</text>
  <circle cx="540" cy="172" r="6.5" fill="#7a93c4"/>
  <circle cx="540" cy="172" r="11.5" fill="none" stroke="#7a93c4" stroke-width="1.3" stroke-dasharray="3 2"/>
  <text x="540" y="152" text-anchor="middle" font-size="12" fill="#5d708f">query</text>
  <rect x="150" y="264" width="440" height="54" rx="8" fill="#eef7f1" stroke="#7ab89a"/>
  <text x="370" y="286" text-anchor="middle" font-size="13" fill="#3d4656">neighbor sets (k = 5): {B, C, D, F, H} vs {B, C, E, F, J}</text>
  <text x="370" y="306" text-anchor="middle" font-size="13" font-weight="bold" fill="#4f8a6d">shared = {B, C, F} → mutual k-NN score = 3/5</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: the mutual k-NN metric — a query frame's k nearest neighbors are retrieved in each latent space, and similarity is the fraction of neighbors shared by both spaces (green).</p>
</div>

**Results — similarity vs Δt.** The key experiment: how does mutual KNN similarity between the two representations change as we vary Δt?

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/temporal-cave/similarity_mnist.png" loading="lazy" alt="Moving MNIST: similarity between contrastive and autoencoder representations decreases as Δt grows">
    <img src="/images/temporal-cave/similarity_hmdb51.png" loading="lazy" alt="HMDB51: similarity increases with larger Δt, supporting the Platonic Hypothesis">
  </div>
</div>

On **Moving MNIST**, similarity is highest at Δt=1 and decreases as Δt grows. Small temporal windows force contrastive representations to be very fine-grained and position-sensitive — close to what the autoencoder independently learns from pixel reconstruction. Larger windows push the contrastive model toward more abstract, temporally-invariant features that diverge from the autoencoder's focus.

On **HMDB51**, the trend reverses: similarity increases with larger Δt. For complex naturalistic video, a wider temporal window pushes the contrastive learner toward semantic scene representations that better align with what the autoencoder recovers from the richer visual signal. This supports the Platonic Representation Hypothesis: in a sufficiently complex domain, representations from different objectives do converge.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/temporal-cave/nn_viz_hmdb51.png" loading="lazy" alt="Nearest neighbors on HMDB51: contrastive (Δt=0.25s) vs autoencoder — both recover similar-looking clips">
  </div>
</div>

The two datasets tell complementary stories. In simple visual worlds, tight temporal supervision produces representations that match reconstruction-based ones at small Δt but diverge at large Δt. In complex visual worlds, wider temporal windows are needed to reach the level of abstraction where the two objectives converge. Whether this convergence continues toward a single true Platonic representation at larger scales remains an open question.

The sketch below summarizes the mechanism behind the two opposite trends.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 292" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="As the temporal window Δt grows, contrastive features move from fine-grained to abstract; the autoencoder representation of Moving MNIST aligns at small Δt while that of HMDB51 aligns at large Δt" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="Helvetica,Arial,sans-serif">
  <defs>
    <marker id="tc-arrow3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#8b95a5"/>
    </marker>
    <linearGradient id="tc-grad3" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#e9eff7"/>
      <stop offset="1" stop-color="#e4f0e9"/>
    </linearGradient>
  </defs>
  <text x="84" y="46" font-size="12" fill="#6a7280">must tell near-identical frames apart</text>
  <text x="656" y="46" text-anchor="end" font-size="12" fill="#6a7280">must be invariant across the window</text>
  <rect x="70" y="56" width="600" height="44" rx="8" fill="url(#tc-grad3)" stroke="#d5dbe4"/>
  <text x="84" y="76" font-size="12.5" font-weight="bold" fill="#3d4656">fine-grained</text>
  <text x="84" y="92" font-size="12" fill="#6a7280">position and appearance</text>
  <text x="656" y="76" text-anchor="end" font-size="12.5" font-weight="bold" fill="#3d4656">abstract</text>
  <text x="656" y="92" text-anchor="end" font-size="12" fill="#6a7280">scene semantics, motion-invariant</text>
  <text x="370" y="84" text-anchor="middle" font-size="12" font-style="italic" fill="#6a7280">contrastive features</text>
  <path d="M70 128 L672 128" stroke="#8b95a5" stroke-width="1.6" marker-end="url(#tc-arrow3)"/>
  <text x="70" y="150" font-size="12.5" fill="#3d4656">small Δt</text>
  <text x="664" y="150" text-anchor="end" font-size="12.5" fill="#3d4656">large Δt</text>
  <text x="371" y="150" text-anchor="middle" font-size="12" fill="#6a7280">temporal window Δt</text>
  <circle cx="160" cy="128" r="6" fill="#7a93c4"/>
  <circle cx="580" cy="128" r="6" fill="#7ab89a"/>
  <path d="M160 136 L160 186" stroke="#7a93c4" stroke-width="1.4" stroke-dasharray="3 3" fill="none"/>
  <path d="M580 136 L580 186" stroke="#7ab89a" stroke-width="1.4" stroke-dasharray="3 3" fill="none"/>
  <rect x="40" y="188" width="320" height="88" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="200" y="210" text-anchor="middle" font-size="13" font-weight="bold" fill="#3d4656">Moving MNIST — simple visuals</text>
  <text x="200" y="230" text-anchor="middle" font-size="12" fill="#3d4656">the autoencoder already captures</text>
  <text x="200" y="247" text-anchor="middle" font-size="12" fill="#3d4656">digit position, so agreement is highest</text>
  <text x="200" y="264" text-anchor="middle" font-size="12" fill="#3d4656">at Δt = 1 and falls as Δt grows</text>
  <rect x="380" y="188" width="320" height="88" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="540" y="210" text-anchor="middle" font-size="13" font-weight="bold" fill="#3d4656">HMDB51 — complex visuals</text>
  <text x="540" y="230" text-anchor="middle" font-size="12" fill="#3d4656">the autoencoder captures scene</text>
  <text x="540" y="247" text-anchor="middle" font-size="12" fill="#3d4656">content, so agreement grows with Δt</text>
  <text x="540" y="264" text-anchor="middle" font-size="12" fill="#3d4656">— the Platonic convergence regime</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: why the two datasets trend in opposite directions — widening Δt pushes contrastive features from fine-grained toward abstract, and each dataset's autoencoder sits at a different point on that spectrum.</p>
</div>

*Final project for 6.7960 (Deep Learning), MIT. Joint work with Adithya Balachandran and Alex Gu.*
