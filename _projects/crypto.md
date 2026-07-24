---
title: Cryptography and Security
date: 2022-01-06 08:01:35 +0300
subtitle: Analyzing Memory Usage of Adversarially Resistant Bloom Filters
image: '/images/security.png'
---

This is a final project I collaborated with three more MIT undergrad students on analyzing bloom filters as a data structure.

Bloom filters are widely used data structures in various applications for approximate mem- bership queries (AMQ). However, their usage in security-critical applications is limited due to the potential vulnerabilities to attacks by adversaries who can manipulate the filter to induce false positives. It is also limited by the need to store the representation of the bloom filter and the associated hash functions. Bloom filters are an important tool in cryptography due to their ability to efficiently represent sets and perform set membership tests. By leveraging their properties, it is possible to improve the efficiency, privacy, and security of various cryptographic protocols and applications.

The diagram below shows the mechanism that makes these false positives possible.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 398" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="How a Bloom filter produces a false positive" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="Helvetica, Arial, sans-serif">
<defs>
<marker id="bf1g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7ab89a"/></marker>
<marker id="bf1p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#d98a9e"/></marker>
</defs>
<rect x="146" y="26" width="140" height="42" rx="9" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="216" y="52" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">insert x₁ ∈ S</text>
<rect x="454" y="26" width="140" height="42" rx="9" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="524" y="52" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">insert x₂ ∈ S</text>
<path d="M186 70 L130 142" stroke="#7ab89a" stroke-width="1.6" fill="none" marker-end="url(#bf1g)"/>
<path d="M216 70 L216 142" stroke="#7ab89a" stroke-width="1.6" fill="none" marker-end="url(#bf1g)"/>
<path d="M246 70 L302 142" stroke="#7ab89a" stroke-width="1.6" fill="none" marker-end="url(#bf1g)"/>
<path d="M494 70 L438 142" stroke="#7ab89a" stroke-width="1.6" fill="none" marker-end="url(#bf1g)"/>
<path d="M524 70 L524 142" stroke="#7ab89a" stroke-width="1.6" fill="none" marker-end="url(#bf1g)"/>
<path d="M554 70 L610 142" stroke="#7ab89a" stroke-width="1.6" fill="none" marker-end="url(#bf1g)"/>
<text x="150" y="102" text-anchor="end" font-size="12" font-style="italic" fill="#6a7280">h₁</text>
<text x="210" y="102" text-anchor="end" font-size="12" font-style="italic" fill="#6a7280">h₂</text>
<text x="283" y="102" font-size="12" font-style="italic" fill="#6a7280">h₃</text>
<rect x="62" y="150" width="44" height="44" fill="#eef2f7" stroke="#aab8ce"/>
<text x="84" y="178" text-anchor="middle" font-size="15" fill="#97a1b2">0</text>
<rect x="106" y="150" width="44" height="44" fill="#eef7f1" stroke="#7ab89a"/>
<text x="128" y="178" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">1</text>
<rect x="150" y="150" width="44" height="44" fill="#eef2f7" stroke="#aab8ce"/>
<text x="172" y="178" text-anchor="middle" font-size="15" fill="#97a1b2">0</text>
<rect x="194" y="150" width="44" height="44" fill="#eef7f1" stroke="#7ab89a"/>
<text x="216" y="178" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">1</text>
<rect x="238" y="150" width="44" height="44" fill="#eef2f7" stroke="#aab8ce"/>
<text x="260" y="178" text-anchor="middle" font-size="15" fill="#97a1b2">0</text>
<rect x="282" y="150" width="44" height="44" fill="#eef7f1" stroke="#7ab89a"/>
<text x="304" y="178" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">1</text>
<rect x="326" y="150" width="44" height="44" fill="#eef2f7" stroke="#aab8ce"/>
<text x="348" y="178" text-anchor="middle" font-size="15" fill="#97a1b2">0</text>
<rect x="370" y="150" width="44" height="44" fill="#eef2f7" stroke="#aab8ce"/>
<text x="392" y="178" text-anchor="middle" font-size="15" fill="#97a1b2">0</text>
<rect x="414" y="150" width="44" height="44" fill="#eef7f1" stroke="#7ab89a"/>
<text x="436" y="178" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">1</text>
<rect x="458" y="150" width="44" height="44" fill="#eef2f7" stroke="#aab8ce"/>
<text x="480" y="178" text-anchor="middle" font-size="15" fill="#97a1b2">0</text>
<rect x="502" y="150" width="44" height="44" fill="#eef7f1" stroke="#7ab89a"/>
<text x="524" y="178" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">1</text>
<rect x="546" y="150" width="44" height="44" fill="#eef2f7" stroke="#aab8ce"/>
<text x="568" y="178" text-anchor="middle" font-size="15" fill="#97a1b2">0</text>
<rect x="590" y="150" width="44" height="44" fill="#eef7f1" stroke="#7ab89a"/>
<text x="612" y="178" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">1</text>
<rect x="634" y="150" width="44" height="44" fill="#eef2f7" stroke="#aab8ce"/>
<text x="656" y="178" text-anchor="middle" font-size="15" fill="#97a1b2">0</text>
<text x="62" y="216" font-size="12" fill="#6a7280">m-bit array</text>
<rect x="350" y="298" width="140" height="42" rx="9" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="420" y="324" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">query y ∉ S</text>
<path d="M388 294 L306 202" stroke="#d98a9e" stroke-width="1.6" stroke-dasharray="5 4" fill="none" marker-end="url(#bf1p)"/>
<path d="M420 294 L436 202" stroke="#d98a9e" stroke-width="1.6" stroke-dasharray="5 4" fill="none" marker-end="url(#bf1p)"/>
<path d="M452 294 L522 202" stroke="#d98a9e" stroke-width="1.6" stroke-dasharray="5 4" fill="none" marker-end="url(#bf1p)"/>
<text x="370" y="368" text-anchor="middle" font-size="13.5" fill="#3d4656">all three probed bits are already 1 → the filter answers “yes”: <tspan font-weight="bold">a false positive</tspan></text>
<text x="370" y="388" text-anchor="middle" font-size="12.5" fill="#6a7280">an adaptive adversary can search for such y’s and trigger false positives on demand</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: shared bits let a never-inserted element y probe only 1s, producing the false positives an adversary hunts for.</p>
</div>

In this project, we analyze the space-efficiency of bloom filters that are resilient against bounded and unbounded adversaries. Building on top work by Naor and Yogev, we show that we can construct adversarially resiliant AMQ filters with near-optimal memory usage under the correct assumptions.

The figure below sketches the adversarial model behind this analysis and where the memory costs diverge for the two adversary classes.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 402" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Adversarial resilience game and memory cost" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="Helvetica, Arial, sans-serif">
<defs>
<marker id="bf2b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7a93c4"/></marker>
<marker id="bf2a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#d9b56a"/></marker>
</defs>
<rect x="40" y="40" width="195" height="100" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
<text x="137" y="70" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">Adversary</text>
<text x="137" y="92" text-anchor="middle" font-size="12" fill="#6a7280">picks each query after</text>
<text x="137" y="108" text-anchor="middle" font-size="12" fill="#6a7280">seeing earlier answers</text>
<rect x="505" y="40" width="195" height="100" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="602" y="70" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">AMQ filter</text>
<text x="602" y="92" text-anchor="middle" font-size="12" fill="#6a7280">compressed representation</text>
<text x="602" y="108" text-anchor="middle" font-size="12" fill="#6a7280">of the set S</text>
<path d="M235 76 H498" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#bf2b)"/>
<text x="368" y="64" text-anchor="middle" font-size="13" fill="#3d4656">adaptive queries q₁, q₂, …, qₜ</text>
<path d="M505 112 H242" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#bf2b)"/>
<text x="370" y="134" text-anchor="middle" font-size="13" fill="#3d4656">yes / no answers</text>
<text x="370" y="158" text-anchor="middle" font-size="12" font-style="italic" fill="#6a7280">each answer leaks information that guides the next query</text>
<path d="M137 140 V229 H142" stroke="#d9b56a" stroke-width="1.6" fill="none" marker-end="url(#bf2a)"/>
<path d="M602 140 V229 H598" stroke="#7a93c4" stroke-width="1.6" fill="none" marker-end="url(#bf2b)"/>
<rect x="150" y="196" width="440" height="66" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="370" y="224" text-anchor="middle" font-size="13.5" font-weight="bold" fill="#3d4656">challenge: output some x* ∉ S it never queried</text>
<text x="370" y="246" text-anchor="middle" font-size="13" fill="#3d4656">the adversary wins if the filter still answers “yes” on x*</text>
<text x="370" y="290" text-anchor="middle" font-size="12.5" font-style="italic" fill="#6a7280">memory required to keep the adversary’s win probability negligible:</text>
<rect x="40" y="304" width="325" height="88" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="202" y="328" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">Bounded adversary</text>
<text x="202" y="348" text-anchor="middle" font-size="12" fill="#3d4656">limited computation — under cryptographic</text>
<text x="202" y="364" text-anchor="middle" font-size="12" fill="#3d4656">assumptions ≈ n·log(1/ε) bits suffice,</text>
<text x="202" y="380" text-anchor="middle" font-size="12" fill="#3d4656">near-optimal (ε = false-positive rate)</text>
<rect x="375" y="304" width="325" height="88" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="537" y="328" text-anchor="middle" font-size="14" font-weight="bold" fill="#3d4656">Unbounded adversary</text>
<text x="537" y="348" text-anchor="middle" font-size="12" fill="#3d4656">unlimited computation — resilience is</text>
<text x="537" y="364" text-anchor="middle" font-size="12" fill="#3d4656">still possible, but memory must grow</text>
<text x="537" y="380" text-anchor="middle" font-size="12" fill="#3d4656">with the number of adversarial queries t</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: the adversarial-resilience game after Naor and Yogev, and its memory cost against bounded vs. unbounded adversaries.</p>
</div>

[Download Bloom Filter Research PDF](/images/bloom_filter_research.pdf)