---
title: Rewarded Region Replay (R3)
date: 2024-05-16 08:01:35 +0300
subtitle: Reinforcement Learning in Sparse Reward Environments
image: '/images/neurips.jpg'
---
This project arises from the class Computational Sensorimotor Learning, where my teammates and I devised an algorithm that consistently outperforms the existing PPO and DDQN agents in sparse reward environments. We call our algorithm Rewarded Region Replay (R3). R3 improves sample efficiency by using a replay buffer which contains past successful trajectories with reward above a certain threshold, which are used to update a PPO agent with importance sampling. Crucially, we discard the importance sampling factors which are above a certain ratio to reduce variance and stabilize training. We found that R3 significantly outperforms PPO in Minigrid environments with sparse rewards and discrete action space, such as DoorKeyEnv and CrossingEnv, and moreover we found that the improvement margin of our method versus baseline PPO increases with the complexity of the environment. We also benchmarked the performance of R3 against DDQN (Double Deep Q-Network), which is a standard baseline in off-policy methods for discrete actions, and found that R3 also outperforms DDQN agent in DoorKeyEnv. 

The diagram below shows how the pieces fit together: only trajectories that clear the reward threshold enter the replay buffer, which then drives the off-policy PPO update.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="R3 training loop diagram" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="'Helvetica Neue', Arial, sans-serif">
  <defs>
    <marker id="r3a-blue" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7a93c4"/></marker>
    <marker id="r3a-gold" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#d9b56a"/></marker>
    <marker id="r3a-pink" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#d98a9e"/></marker>
  </defs>

  <rect x="16" y="44" width="180" height="84" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.6"/>
  <text x="106" y="68" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">Sparse-reward</text>
  <text x="106" y="86" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">environment</text>
  <text x="106" y="106" text-anchor="middle" font-size="12" fill="#6a7280">MiniGrid: DoorKey,</text>
  <text x="106" y="121" text-anchor="middle" font-size="12" fill="#6a7280">Crossing</text>

  <rect x="250" y="54" width="150" height="64" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.6"/>
  <text x="325" y="80" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">PPO agent</text>
  <text x="325" y="100" text-anchor="middle" font-size="12" fill="#6a7280">collects trajectories</text>

  <rect x="452" y="54" width="160" height="64" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.6"/>
  <text x="532" y="80" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">Reward filter</text>
  <text x="532" y="100" text-anchor="middle" font-size="12.5" fill="#3d4656">R(τ) ≥ threshold?</text>

  <path d="M196 86 H245" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#r3a-blue)"/>
  <path d="M400 86 H447" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#r3a-blue)"/>
  <text x="424" y="78" text-anchor="middle" font-size="13" font-style="italic" fill="#6a7280">τ</text>

  <path d="M532 118 V180" stroke="#d9b56a" stroke-width="1.8" fill="none" marker-end="url(#r3a-gold)"/>
  <text x="541" y="152" font-size="12" fill="#8a6d2f">yes — store</text>

  <path d="M612 86 H656" stroke="#d98a9e" stroke-width="1.8" stroke-dasharray="5 4" fill="none" marker-end="url(#r3a-pink)"/>
  <text x="634" y="78" text-anchor="middle" font-size="12" fill="#b05c74">no</text>
  <text x="662" y="90" font-size="12.5" fill="#b05c74">discarded</text>

  <rect x="452" y="186" width="180" height="88" rx="10" fill="#fbeef1" stroke="#e7c6cf" stroke-width="1.4"/>
  <rect x="442" y="196" width="180" height="88" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.6"/>
  <text x="532" y="224" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">Rewarded Region</text>
  <text x="532" y="242" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">Replay Buffer</text>
  <text x="532" y="264" text-anchor="middle" font-size="12" fill="#6a7280">high-reward trajectories</text>

  <rect x="120" y="192" width="250" height="96" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.6"/>
  <text x="245" y="216" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">Off-policy PPO update</text>
  <text x="245" y="240" text-anchor="middle" font-size="12" fill="#3d4656">importance weight  w = π<tspan font-size="10" dy="2.5">new</tspan><tspan dy="-2.5"> / π</tspan><tspan font-size="10" dy="2.5">old</tspan></text>
  <text x="245" y="261" text-anchor="middle" font-size="12.5" fill="#3d4656">weights above cap c are discarded</text>
  <text x="245" y="280" text-anchor="middle" font-size="12" font-style="italic" fill="#6a7280">→ lower variance, stable training</text>

  <path d="M442 240 H374" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#r3a-blue)"/>
  <text x="408" y="230" text-anchor="middle" font-size="12" fill="#6a7280">replay</text>

  <path d="M245 192 V158 H325 V123" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#r3a-blue)"/>
  <text x="285" y="151" text-anchor="middle" font-size="12" fill="#6a7280">policy update</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: The R3 loop — trajectories whose return clears the reward threshold are stored in a replay buffer and reused for off-policy PPO updates via importance sampling.</p>
</div>

The variance-control step is shown below: importance-sampling weights above a fixed cap are discarded rather than reused.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 275" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Importance weight truncation in R3" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="'Helvetica Neue', Arial, sans-serif">
  <defs>
    <marker id="r3b-gray" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#8a94a6"/></marker>
    <marker id="r3b-pink" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#d98a9e"/></marker>
  </defs>

  <text x="70" y="28" font-size="13.5" font-weight="bold" fill="#3d4656">Distribution of importance weights  w = π<tspan font-size="11" dy="2.5">new</tspan><tspan dy="-2.5"> / π</tspan><tspan font-size="11" dy="2.5">old</tspan></text>

  <rect x="90" y="172" width="30" height="58" rx="2" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
  <rect x="128" y="122" width="30" height="108" rx="2" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
  <rect x="166" y="92" width="30" height="138" rx="2" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
  <rect x="204" y="108" width="30" height="122" rx="2" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
  <rect x="242" y="138" width="30" height="92" rx="2" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
  <rect x="280" y="164" width="30" height="66" rx="2" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
  <rect x="318" y="182" width="30" height="48" rx="2" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
  <rect x="356" y="194" width="30" height="36" rx="2" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
  <rect x="394" y="203" width="30" height="27" rx="2" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.4"/>
  <rect x="432" y="209" width="30" height="21" rx="2" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.4"/>
  <rect x="470" y="213" width="30" height="17" rx="2" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.4"/>
  <rect x="508" y="216" width="30" height="14" rx="2" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.4"/>
  <rect x="546" y="219" width="30" height="11" rx="2" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.4"/>
  <rect x="584" y="221" width="30" height="9" rx="2" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.4"/>

  <path d="M70 230 H692" stroke="#8a94a6" stroke-width="1.5" fill="none" marker-end="url(#r3b-gray)"/>
  <path d="M70 230 V72" stroke="#8a94a6" stroke-width="1.5" fill="none" marker-end="url(#r3b-gray)"/>
  <text transform="rotate(-90 54 150)" x="54" y="150" text-anchor="middle" font-size="12" fill="#6a7280">frequency</text>

  <path d="M390 80 V230" stroke="#d9b56a" stroke-width="2" stroke-dasharray="5 4" fill="none"/>
  <text x="390" y="68" text-anchor="middle" font-size="13" font-weight="bold" fill="#a8873f">ratio cap c</text>

  <text x="220" y="64" text-anchor="middle" font-size="13" font-weight="600" fill="#4a7a62">w ≤ c: kept for the update</text>

  <text x="540" y="96" text-anchor="middle" font-size="13" font-weight="bold" fill="#b05c74">w &gt; c: discarded</text>
  <text x="540" y="116" text-anchor="middle" font-size="12" fill="#6a7280">rare large weights would dominate</text>
  <text x="540" y="132" text-anchor="middle" font-size="12" fill="#6a7280">the gradient and inflate variance</text>
  <path d="M520 140 Q502 178 492 206" stroke="#d98a9e" stroke-width="1.6" fill="none" marker-end="url(#r3b-pink)"/>

  <path d="M181 230 V236" stroke="#8a94a6" stroke-width="1.5"/>
  <text x="70" y="251" text-anchor="middle" font-size="12" fill="#6a7280">0</text>
  <text x="181" y="251" text-anchor="middle" font-size="12" fill="#6a7280">1</text>
  <text x="390" y="251" text-anchor="middle" font-size="12.5" font-style="italic" fill="#a8873f">c</text>
  <text x="381" y="269" text-anchor="middle" font-size="13" fill="#3d4656">importance weight w</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Variance control in R3 — importance-sampling weights above a fixed ratio cap are discarded, removing the heavy tail that destabilizes the gradient.</p>
</div>

Below are the performance of R3 benchmarked against PPO and DDQN agents in DoorKeyEnv.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/68200-2.jpg" loading="lazy" alt="Project">
    <img src="/images/68200-1.jpg" loading="lazy" alt="Project">
    <img src="/images/68200.jpg" loading="lazy" alt="Project">
  </div>
  <!-- <em>Gallery / <a href="https://unsplash.com/" target="_blank">Unsplash</a></em> -->
</div>

This work has been submitted to Neurips 2024 for review.
<div class="gallery-box">
  <div class="gallery">
    <img src="/images/neurips.jpg" loading="lazy" alt="Project">
  </div>
</div>

