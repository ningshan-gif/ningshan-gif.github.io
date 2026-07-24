---
title: Caveman Papers
date: 2024-08-19 08:03:35 +0300
subtitle: Animation agents that turn research papers into short-form reels
image: '/images/caveman-papers/frame_cave_painting.jpg'
---

Many great research papers never reach the people who would actually enjoy them. The format asks for too much attention before you know whether you care. Caveman Papers is an animation agent pipeline I built to change that: give it a PDF, and it produces a short vertical reel — something you can watch in 60 seconds and decide whether to go deeper.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/caveman-papers/frame_cute.jpg" loading="lazy" alt="Caveman Papers — chibi caveman discovering a parse tree">
    <img src="/images/caveman-papers/frame_transformer.jpg" loading="lazy" alt="Caveman Papers — caveman explaining transformers to a crowd of neural nets">
  </div>
</div>

The pipeline treats a paper as raw narrative material. An LLM reads the PDF, extracts the central argument and key result, then rewrites it as a compact visual story with a beginning, tension, and payoff. A scene generator breaks that story into timestamped segments and matches each one to a visual style. A narration agent writes voiceover copy calibrated to the reading level and pacing of short-form video. Everything gets assembled — background visuals, animated text, narration — and rendered into a portrait-format short.

The diagram below shows how a paper moves through the pipeline's stages.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 470" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pipeline diagram: a paper PDF flows through a story agent and a scene generator, then branches into style-matched visuals and a narration agent, which are assembled and rendered into a 60-second vertical reel">
  <defs>
    <marker id="cp-arrow1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#7a93c4"/>
    </marker>
  </defs>
  <g font-family="'Helvetica Neue', Arial, sans-serif" fill="#3d4656">
    <!-- input -->
    <rect x="74" y="45" width="88" height="70" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="118" y="75" font-size="15" font-weight="600" text-anchor="middle">Paper</text>
    <text x="118" y="96" font-size="13" text-anchor="middle" fill="#6a7280">(PDF)</text>
    <path d="M162,80 H196" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#cp-arrow1)"/>
    <!-- story agent -->
    <rect x="200" y="30" width="200" height="100" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
    <text x="300" y="57" font-size="15" font-weight="600" text-anchor="middle">Story agent (LLM)</text>
    <text x="300" y="80" font-size="13" text-anchor="middle" fill="#6a7280">argument + key result</text>
    <text x="300" y="100" font-size="13" text-anchor="middle" fill="#6a7280">beginning &#183; tension &#183; payoff</text>
    <path d="M400,80 H436" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#cp-arrow1)"/>
    <!-- scene generator -->
    <rect x="440" y="30" width="200" height="100" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
    <text x="540" y="57" font-size="15" font-weight="600" text-anchor="middle">Scene generator</text>
    <text x="540" y="80" font-size="13" text-anchor="middle" fill="#6a7280">timestamped segments</text>
    <text x="540" y="100" font-size="13" text-anchor="middle" fill="#6a7280">visual style per segment</text>
    <!-- split into two parallel tracks -->
    <path d="M540,130 V162 H220 V192" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#cp-arrow1)"/>
    <path d="M540,130 V162 H520 V192" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#cp-arrow1)"/>
    <text x="552" y="152" font-size="12" font-style="italic" fill="#6a7280">per segment</text>
    <!-- visuals track -->
    <rect x="120" y="200" width="200" height="100" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="220" y="228" font-size="15" font-weight="600" text-anchor="middle">Style-matched visuals</text>
    <text x="220" y="252" font-size="13" text-anchor="middle" fill="#6a7280">flat cartoon &#183; chibi &#183; 3D</text>
    <text x="220" y="272" font-size="13" text-anchor="middle" fill="#6a7280">backgrounds + animated text</text>
    <!-- narration track -->
    <rect x="420" y="200" width="200" height="100" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
    <text x="520" y="228" font-size="15" font-weight="600" text-anchor="middle">Narration agent</text>
    <text x="520" y="252" font-size="13" text-anchor="middle" fill="#6a7280">voiceover copy tuned to</text>
    <text x="520" y="272" font-size="13" text-anchor="middle" fill="#6a7280">reading level + pacing</text>
    <!-- merge into assembler -->
    <path d="M220,300 V320 H340 V334" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#cp-arrow1)"/>
    <path d="M520,300 V320 H400 V334" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#cp-arrow1)"/>
    <rect x="270" y="340" width="200" height="70" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="370" y="368" font-size="15" font-weight="600" text-anchor="middle">Assemble &amp; render</text>
    <text x="370" y="392" font-size="13" text-anchor="middle" fill="#6a7280">visuals + text + narration</text>
    <path d="M470,375 H536" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#cp-arrow1)"/>
    <!-- output: portrait reel -->
    <rect x="544" y="310" width="76" height="130" rx="14" fill="#eef7f1" stroke="#7ab89a" stroke-width="2"/>
    <path d="M572,345 L598,360 L572,375 z" fill="#7ab89a"/>
    <text x="582" y="408" font-size="13" font-weight="600" text-anchor="middle">60 s</text>
    <text x="582" y="426" font-size="12" text-anchor="middle" fill="#6a7280">9:16</text>
    <text x="582" y="462" font-size="13" text-anchor="middle" fill="#6a7280">vertical reel</text>
  </g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: the agent pipeline — a story agent turns the PDF into a narrative arc, a scene generator cuts it into styled, timestamped segments, and visuals plus narration are assembled into a portrait-format short.</p>
</div>

The pipeline generates visuals in whatever style fits the paper — flat cartoon, chibi, 3D render — so each reel has its own character.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/caveman-papers/frame_worried.jpg" loading="lazy" alt="Caveman Papers — chibi caveman crouching in front of a colorful circuit board">
    <img src="/images/caveman-papers/frame_stone.jpg" loading="lazy" alt="Caveman Papers — caveman confused by equations carved in stone">
    <img src="/images/caveman-papers/frame_results.jpg" loading="lazy" alt="Caveman Papers — caveman celebrating benchmark scores">
  </div>
</div>

Subscribe and watch the channel here: [youtube.com/@CavemanPapers](https://www.youtube.com/@CavemanPapers)

Below are two complete reels generated by the pipeline.

<video controls playsinline preload="metadata" style="width:100%;margin-bottom:16px;">
  <source src="/images/caveman-papers/reel1.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

<video controls playsinline preload="metadata" style="width:100%;">
  <source src="/images/caveman-papers/reel2.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

The design goal was not to summarize papers better. It was to solve a different problem: science communication as an interface problem. Most people's first contact with a paper is either the abstract (too dense) or a Twitter thread (too lossy). A well-made reel can sit in between — cinematic enough to be watchable, accurate enough to be trustworthy, short enough to complete. The goal is to make the first step easier and earn the viewer's attention before asking for it.

The figure below shows where a reel sits between the two usual entry points to a paper.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 240" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Spectrum of first contact with a paper: the abstract is too dense, a Twitter thread is too lossy, and a 60-second reel sits in between as watchable, trustworthy, and short enough to complete">
  <defs>
    <marker id="cp-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#7a93c4"/>
    </marker>
  </defs>
  <g font-family="'Helvetica Neue', Arial, sans-serif" fill="#3d4656">
    <!-- axis -->
    <path d="M70,195 H670" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-start="url(#cp-arrow2)" marker-end="url(#cp-arrow2)"/>
    <text x="70" y="222" font-size="13" fill="#6a7280">dense &#8212; full fidelity, heavy lift</text>
    <text x="670" y="222" font-size="13" text-anchor="end" fill="#6a7280">lossy &#8212; easy, detail lost</text>
    <!-- abstract -->
    <rect x="75" y="75" width="150" height="65" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="150" y="102" font-size="14" font-weight="600" text-anchor="middle">Paper abstract</text>
    <text x="150" y="124" font-size="13" text-anchor="middle" fill="#6a7280">too dense</text>
    <path d="M150,140 V186" stroke="#7a93c4" stroke-width="1.2" fill="none"/>
    <circle cx="150" cy="195" r="5" fill="#7a93c4"/>
    <!-- reel -->
    <rect x="270" y="40" width="200" height="100" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="2"/>
    <text x="370" y="68" font-size="15" font-weight="600" text-anchor="middle">60-second reel</text>
    <text x="370" y="91" font-size="13" text-anchor="middle" fill="#6a7280">cinematic &#8594; watchable</text>
    <text x="370" y="110" font-size="13" text-anchor="middle" fill="#6a7280">accurate &#8594; trustworthy</text>
    <text x="370" y="129" font-size="13" text-anchor="middle" fill="#6a7280">short &#8594; completable</text>
    <path d="M370,140 V186" stroke="#7ab89a" stroke-width="1.2" fill="none"/>
    <circle cx="370" cy="195" r="5" fill="#7ab89a"/>
    <!-- thread -->
    <rect x="515" y="75" width="150" height="65" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
    <text x="590" y="102" font-size="14" font-weight="600" text-anchor="middle">Twitter thread</text>
    <text x="590" y="124" font-size="13" text-anchor="middle" fill="#6a7280">too lossy</text>
    <path d="M590,140 V186" stroke="#d98a9e" stroke-width="1.2" fill="none"/>
    <circle cx="590" cy="195" r="5" fill="#d98a9e"/>
  </g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: first contact with a paper as an interface problem — the reel targets the gap between a dense abstract and a lossy thread.</p>
</div>
