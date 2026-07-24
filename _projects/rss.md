---
title: Localziation, Path Planning and Lane Racing
date: 2022-01-05 08:01:35 +0300
subtitle: Robotics Science and Systems
image: '/images/rss-4.JPG'
---


My co-parents of racecar 19, RSS Team 2.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/rss-1.JPG" loading="lazy" alt="Project">
  </div>
  <em>Gallery / <a href="https://unsplash.com/" target="_blank">Unsplash</a></em>
</div>

For the Robotics Science and Systems class, we implementeed several key functions used in robotics systems today such as localization with particle filters, path planning with A*, pure pursuit line following, and other computer vision functions.

The diagram below shows how these pieces connect on the car.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Racecar autonomy stack data flow" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
  <defs>
    <marker id="rssArw1" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#5b6577"/>
    </marker>
    <marker id="rssArw1g" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#9aa4b2"/>
    </marker>
  </defs>
  <g font-family="Helvetica Neue, Arial, sans-serif">
    <rect x="15" y="60" width="125" height="46" rx="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="77" y="88" text-anchor="middle" font-size="13.5" fill="#3d4656">LiDAR scan</text>
    <rect x="15" y="128" width="125" height="58" rx="9" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="77" y="152" text-anchor="middle" font-size="13.5" fill="#3d4656">Occupancy-grid</text>
    <text x="77" y="170" text-anchor="middle" font-size="13.5" fill="#3d4656">map</text>
    <rect x="180" y="58" width="152" height="120" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
    <text x="256" y="84" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">Particle filter</text>
    <text x="256" y="102" text-anchor="middle" font-size="13" fill="#6a7280">localization</text>
    <text x="256" y="127" text-anchor="middle" font-size="12.5" fill="#3d4656">motion update</text>
    <text x="256" y="144" text-anchor="middle" font-size="12.5" fill="#3d4656">sensor update</text>
    <text x="256" y="161" text-anchor="middle" font-size="12.5" fill="#3d4656">resample</text>
    <rect x="372" y="58" width="140" height="120" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
    <text x="442" y="84" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">A* planner</text>
    <text x="442" y="102" text-anchor="middle" font-size="13" fill="#6a7280">path search</text>
    <text x="442" y="127" text-anchor="middle" font-size="12.5" fill="#3d4656">finds shortest</text>
    <text x="442" y="144" text-anchor="middle" font-size="12.5" fill="#3d4656">safe path on</text>
    <text x="442" y="161" text-anchor="middle" font-size="12.5" fill="#3d4656">the map grid</text>
    <rect x="552" y="58" width="150" height="120" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
    <text x="627" y="84" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">Pure pursuit</text>
    <text x="627" y="102" text-anchor="middle" font-size="13" fill="#6a7280">path tracking</text>
    <text x="627" y="127" text-anchor="middle" font-size="12.5" fill="#3d4656">steer toward a</text>
    <text x="627" y="144" text-anchor="middle" font-size="12.5" fill="#3d4656">lookahead point</text>
    <text x="627" y="161" text-anchor="middle" font-size="12.5" fill="#3d4656">on the path</text>
    <rect x="562" y="232" width="130" height="46" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
    <text x="627" y="260" text-anchor="middle" font-size="15" font-weight="bold" fill="#3d4656">Racecar</text>
    <text x="442" y="26" text-anchor="middle" font-size="12.5" fill="#6a7280">goal pose</text>
    <path d="M442,32 L442,52" stroke="#5b6577" stroke-width="1.5" fill="none" marker-end="url(#rssArw1)"/>
    <path d="M140,83 L174,94" stroke="#5b6577" stroke-width="1.5" fill="none" marker-end="url(#rssArw1)"/>
    <path d="M140,157 L174,143" stroke="#5b6577" stroke-width="1.5" fill="none" marker-end="url(#rssArw1)"/>
    <path d="M332,118 L366,118" stroke="#5b6577" stroke-width="1.5" fill="none" marker-end="url(#rssArw1)"/>
    <text x="350" y="108" text-anchor="middle" font-size="12.5" fill="#6a7280">pose</text>
    <path d="M512,118 L546,118" stroke="#5b6577" stroke-width="1.5" fill="none" marker-end="url(#rssArw1)"/>
    <text x="530" y="108" text-anchor="middle" font-size="12.5" fill="#6a7280">path</text>
    <path d="M627,178 L627,226" stroke="#5b6577" stroke-width="1.5" fill="none" marker-end="url(#rssArw1)"/>
    <text x="636" y="200" font-size="12.5" fill="#6a7280">steering +</text>
    <text x="636" y="217" font-size="12.5" fill="#6a7280">speed</text>
    <path d="M562,255 L256,255 L256,184" stroke="#9aa4b2" stroke-width="1.5" stroke-dasharray="5 5" fill="none" marker-end="url(#rssArw1g)"/>
    <text x="409" y="246" text-anchor="middle" font-size="12.5" fill="#6a7280">odometry + fresh scans</text>
  </g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Data flow on the racecar &mdash; a particle filter localizes against the map, A* plans a path to the goal, and pure pursuit steers the car along it as new scans close the loop.</p>
</div>

The line-following step relies on a simple geometric rule, sketched below.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 412" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pure pursuit geometry" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
  <g font-family="Helvetica Neue, Arial, sans-serif">
    <circle cx="250" cy="262" r="120" fill="none" stroke="#d9b56a" stroke-width="2" stroke-dasharray="7 6"/>
    <path d="M90,320 C200,305 290,245 351,197 C420,143 540,110 665,108" fill="none" stroke="#7ab89a" stroke-width="3.5" stroke-linecap="round"/>
    <text x="560" y="90" text-anchor="middle" font-size="13.5" fill="#3d4656">planned path (from A*)</text>
    <line x1="250" y1="262" x2="351" y2="197" stroke="#9aa4b2" stroke-width="1.5"/>
    <rect x="294" y="218" width="20" height="16" fill="#fbfaf7"/>
    <text x="304" y="231" text-anchor="middle" font-size="14" font-style="italic" fill="#6a7280">L</text>
    <line x1="250" y1="262" x2="364" y2="116" stroke="#5b6577" stroke-width="1.5" stroke-dasharray="4 5"/>
    <text x="371" y="113" font-size="13" fill="#6a7280">heading</text>
    <line x1="320" y1="173" x2="351" y2="197" stroke="#3d4656" stroke-width="1.8"/>
    <circle cx="320" cy="173" r="2.5" fill="#3d4656"/>
    <text x="341" y="180" font-size="14" font-style="italic" fill="#3d4656">x</text>
    <path d="M250,262 Q302,195 351,197" fill="none" stroke="#d98a9e" stroke-width="3"/>
    <rect x="286" y="242" width="150" height="40" fill="#fbfaf7"/>
    <text x="296" y="257" font-size="13.5" font-weight="bold" fill="#d98a9e">steering arc</text>
    <text x="296" y="275" font-size="13" fill="#6a7280">curvature = 2x / L&#178;</text>
    <g transform="translate(250,262) rotate(-52)">
      <rect x="-26" y="-19" width="14" height="7" rx="2" fill="#6a7280"/>
      <rect x="-26" y="12" width="14" height="7" rx="2" fill="#6a7280"/>
      <rect x="13" y="-19" width="14" height="7" rx="2" fill="#6a7280"/>
      <rect x="13" y="12" width="14" height="7" rx="2" fill="#6a7280"/>
      <rect x="-27" y="-15" width="54" height="30" rx="7" fill="#eef2f7" stroke="#7a93c4" stroke-width="2"/>
      <polygon points="15,-6 26,0 15,6" fill="#7a93c4"/>
    </g>
    <text x="250" y="308" text-anchor="middle" font-size="13" fill="#6a7280">car</text>
    <circle cx="351" cy="197" r="6.5" fill="#d9b56a" stroke="#fbfaf7" stroke-width="2"/>
    <text x="368" y="202" font-size="13.5" fill="#3d4656">lookahead point</text>
    <text x="250" y="400" text-anchor="middle" font-size="13" fill="#6a7280">lookahead circle (radius L)</text>
  </g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Pure-pursuit geometry &mdash; the controller intersects a circle of radius L around the car with the planned path, then commands the arc through that lookahead point (curvature 2x/L&#178;, where x is the point's lateral offset from the car's heading).</p>
</div>

Here's a demonstration of robot using color segmentation to park in front of a orange cone.
<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/948597518?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="color segmentation"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

[Download report on Localization](/images/Lab5_Report.pdf)

[Download report on Path Planning](/images/Lab6_Report.pdf)

[Download report on Final race](/images/RSS_Final_Report.pdf)



<div class="gallery-box">
  <div class="gallery">
    <img src="/images/rss5.JPG" loading="lazy" alt="Project">
    <img src="/images/rss6.JPG" loading="lazy" alt="Project">
    <img src="/images/rss7.JPG" loading="lazy" alt="Project">
    <img src="/images/rss8.JPG" loading="lazy" alt="Project">
    <img src="/images/rss-2.JPG" loading="lazy" alt="Project">
    <img src="/images/rss-3.JPG" loading="lazy" alt="Project">
  </div>
</div>