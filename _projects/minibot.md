---
title: Mini PID bot
date: 2022-01-02 08:01:35 +0300
subtitle: NEET Autonomous Machines Competition
image: '/images/mini.PNG'
---

Fall 2021: I built a robot using Arduino, color sensor and PID control My robot won 1st place in the NEET Autonomous Machines competition. The challenge is the navigate through a maze with black lines successfully and accurately despite corners and intersections minimizing total time. 

The diagram below shows the control loop the robot runs continuously as it follows the line.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Closed-loop PID line-following control diagram" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="Helvetica, Arial, sans-serif">
<defs>
<marker id="pidArrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#7a93c4"/></marker>
<marker id="pidArrP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#d98a9e"/></marker>
</defs>
<text x="380" y="30" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Closed-loop line following: sense, correct, drive</text>
<path d="M20 120 H83" stroke="#7a93c4" stroke-width="1.6" fill="none" marker-end="url(#pidArrB)"/>
<path d="M117 120 H166" stroke="#7a93c4" stroke-width="1.6" fill="none" marker-end="url(#pidArrB)"/>
<path d="M362 120 H408" stroke="#7a93c4" stroke-width="1.6" fill="none" marker-end="url(#pidArrB)"/>
<path d="M564 120 H604" stroke="#7a93c4" stroke-width="1.6" fill="none" marker-end="url(#pidArrB)"/>
<circle cx="100" cy="120" r="15" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="100" y="125" text-anchor="middle" font-size="13" fill="#3d4656">&#931;</text>
<text x="76" y="112" font-size="13" fill="#3d4656">+</text>
<text x="108" y="156" font-size="14" fill="#3d4656">&#8722;</text>
<text x="50" y="144" text-anchor="middle" font-size="12" fill="#6a7280">setpoint:</text>
<text x="50" y="159" text-anchor="middle" font-size="12" fill="#6a7280">offset = 0</text>
<text x="141" y="110" text-anchor="middle" font-size="12" font-style="italic" fill="#3d4656">error e</text>
<rect x="170" y="68" width="190" height="104" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="265" y="90" text-anchor="middle" font-size="13.5" font-weight="600" fill="#3d4656">Arduino PID</text>
<text x="265" y="112" text-anchor="middle" font-size="13" fill="#3d4656">P: Kp&#183;e &#8212; steer back</text>
<text x="265" y="130" text-anchor="middle" font-size="13" fill="#3d4656">I: Ki&#183;&#931;e &#8212; trim drift</text>
<text x="265" y="148" text-anchor="middle" font-size="13" fill="#3d4656">D: Kd&#183;&#916;e &#8212; damp turns</text>
<text x="265" y="165" text-anchor="middle" font-size="12" fill="#6a7280">output u = steering correction</text>
<text x="386" y="110" text-anchor="middle" font-size="13" font-style="italic" fill="#3d4656">u</text>
<rect x="412" y="68" width="150" height="104" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="487" y="90" text-anchor="middle" font-size="13.5" font-weight="600" fill="#3d4656">Differential drive</text>
<text x="487" y="116" text-anchor="middle" font-size="13" fill="#3d4656">left: base &#8722; u</text>
<text x="487" y="134" text-anchor="middle" font-size="13" fill="#3d4656">right: base + u</text>
<text x="487" y="160" text-anchor="middle" font-size="12" fill="#6a7280">speed gap turns robot</text>
<rect x="608" y="68" width="140" height="104" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
<text x="678" y="88" text-anchor="middle" font-size="13" font-weight="600" fill="#3d4656">Robot on the line</text>
<rect x="666" y="96" width="8" height="64" rx="3" fill="#3d4656"/>
<path d="M686 100 V117" stroke="#d98a9e" stroke-width="1" stroke-dasharray="3 3" fill="none"/>
<path d="M672 111 H684" stroke="#d98a9e" stroke-width="1.2" fill="none"/>
<path d="M670 111 L676 108 L676 114 z" fill="#d98a9e"/>
<path d="M686 111 L680 108 L680 114 z" fill="#d98a9e"/>
<text x="678" y="106" text-anchor="middle" font-size="12" font-style="italic" fill="#3d4656">e</text>
<rect x="668" y="118" width="36" height="30" rx="6" fill="#ffffff" stroke="#d9b56a" stroke-width="1.5"/>
<rect x="661" y="126" width="6" height="14" rx="2" fill="#3d4656" opacity="0.75"/>
<rect x="705" y="126" width="6" height="14" rx="2" fill="#3d4656" opacity="0.75"/>
<path d="M686 142 V133" stroke="#d9b56a" stroke-width="1.5" fill="none"/>
<path d="M686 126 L682 133 L690 133 z" fill="#d9b56a"/>
<circle cx="673" cy="123" r="3" fill="#d98a9e"/>
<path d="M678 172 V272 H494" stroke="#d98a9e" stroke-width="1.6" fill="none" marker-end="url(#pidArrP)"/>
<rect x="320" y="246" width="170" height="52" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="405" y="268" text-anchor="middle" font-size="13.5" font-weight="600" fill="#3d4656">Color sensor</text>
<text x="405" y="286" text-anchor="middle" font-size="12" fill="#6a7280">black line vs. white floor</text>
<path d="M320 272 H100 V139" stroke="#d98a9e" stroke-width="1.6" fill="none" marker-end="url(#pidArrP)"/>
<text x="210" y="262" text-anchor="middle" font-size="12" fill="#3d4656">measured offset e</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: The PID loop behind the robot &#8212; the color sensor measures the robot's offset from the black line, the Arduino's P, I, and D terms turn that error into a steering correction u, and a differential in wheel speeds re-centers the robot.</p>
</div>

Here's a demo of the robot working on a smaller scale board.
<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/948959495?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="mini - SD 480p"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

