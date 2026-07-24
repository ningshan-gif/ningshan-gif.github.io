---
title: Trashinator
date: 2022-01-04 08:01:35 +0300
subtitle: A robot that picks up trash
image: '/images/jackal4.JPG'
---


<div class="gallery-box">
  <div class="gallery">
    <img src="/images/jackal1.JPG" loading="lazy" alt="Project">
    <img src="/images/jackal2.JPG" loading="lazy" alt="Project">
    <img src="/images/jackal3.JPG" loading="lazy" alt="Project">
  </div>
</div>

For my Advanced Autonomous Machines class (16.84), a senior seminar dedicated to building a robot of our choice, we built a robot that can detect and pick up trash using the Clearpath jackal robot. I was on the perpection team and the motion planning team.

The diagram below shows how the robot's pipeline turns a detection into a pickup.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 244" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Trashinator pipeline: perception, motion planning, and pickup on the Clearpath Jackal" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="Helvetica, Arial, sans-serif">
  <defs>
    <marker id="trash-arw" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0,0 L9,4.5 L0,9 Z" fill="#3d4656"/>
    </marker>
  </defs>
  <rect x="15" y="30" width="174" height="96" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="102" y="60" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Perception</text>
  <text x="102" y="82" text-anchor="middle" font-size="12.5" fill="#3d4656">find trash in the</text>
  <text x="102" y="100" text-anchor="middle" font-size="12.5" fill="#3d4656">robot&#8217;s surroundings</text>
  <text x="102" y="117" text-anchor="middle" font-size="12" font-style="italic" fill="#6a7280">(my team)</text>
  <rect x="283" y="30" width="174" height="96" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="370" y="60" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Motion planning</text>
  <text x="370" y="82" text-anchor="middle" font-size="12.5" fill="#3d4656">plan a path that drives</text>
  <text x="370" y="100" text-anchor="middle" font-size="12.5" fill="#3d4656">the Jackal to the trash</text>
  <text x="370" y="117" text-anchor="middle" font-size="12" font-style="italic" fill="#6a7280">(my team)</text>
  <rect x="551" y="30" width="174" height="96" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
  <text x="638" y="60" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Pickup</text>
  <text x="638" y="82" text-anchor="middle" font-size="12.5" fill="#3d4656">collect the piece</text>
  <text x="638" y="100" text-anchor="middle" font-size="12.5" fill="#3d4656">of trash</text>
  <path d="M194,78 H274" stroke="#3d4656" stroke-width="1.6" fill="none" marker-end="url(#trash-arw)"/>
  <text x="236" y="70" text-anchor="middle" font-size="12" fill="#6a7280">trash location</text>
  <path d="M462,78 H542" stroke="#3d4656" stroke-width="1.6" fill="none" marker-end="url(#trash-arw)"/>
  <text x="504" y="70" text-anchor="middle" font-size="12" fill="#6a7280">target reached</text>
  <rect x="15" y="174" width="710" height="54" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
  <text x="370" y="196" text-anchor="middle" font-size="14" font-weight="600" fill="#3d4656">Clearpath Jackal mobile robot</text>
  <text x="370" y="215" text-anchor="middle" font-size="12" fill="#6a7280">carries the sensors and pickup hardware and executes the planned path</text>
  <path d="M102,173 V133" stroke="#3d4656" stroke-width="1.6" fill="none" marker-end="url(#trash-arw)"/>
  <text x="110" y="156" font-size="12" fill="#6a7280">sensor data</text>
  <path d="M370,131 V166" stroke="#3d4656" stroke-width="1.6" fill="none" marker-end="url(#trash-arw)"/>
  <text x="378" y="156" font-size="12" fill="#6a7280">drive commands</text>
  <path d="M638,131 V171" stroke="#9aa4b5" stroke-width="1.4" fill="none" stroke-dasharray="4 4"/>
  <text x="630" y="156" text-anchor="end" font-size="12" fill="#6a7280">mounted on the base</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: how a detection becomes a pickup &#8212; perception locates the trash, motion planning drives the Jackal to it, and the pickup stage collects it.</p>
</div>

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/team1.JPG" loading="lazy" alt="Project">
    <img src="/images/team2.JPG" loading="lazy" alt="Project">
  </div>
</div>

