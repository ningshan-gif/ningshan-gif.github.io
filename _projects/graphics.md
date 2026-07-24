---
title: Texture Synthesis and Transfer
date: 2023-12-20 08:01:35 +0300
subtitle: Final Project for 6.4400 Computer Graphics
image: '/images/64400.jpeg'
---

This is the final project for the class Computer Graphics 6.4400 in which I implemented the algorithm described in A. A. Efros and W. T. Freeman, “Image Quilting for Texture Synthesis and Transfer,” Proceedings of ACM SIGGRAPH’01, 2001, pp. 341-346. I implemented the texture transfer algorithm described in the paper by selecting texture pictures and applying it to structural images. Below is a demonstration of the transfer algorithm with Van Gogh's Starry Night as the texture element and a headshot of the instructor of the class 6.4400 Computer Graphics during Fall 2023 Mina Konaković Luković.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/starry_mina.jpeg" loading="lazy" alt="Project">
    <img src="/images/texture_transfer.jpeg" loading="lazy" alt="Project">

  </div>

</div>

The diagram below shows where each of the three weighted error terms enters the block-selection step of the transfer algorithm.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 385" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" role="img" aria-label="Block selection data flow in the texture transfer algorithm">
<defs><marker id="qf1arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#3d4656"/></marker></defs>
<g font-family="Helvetica, Arial, sans-serif">
<text x="120" y="38" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Source texture</text>
<rect x="30" y="48" width="180" height="135" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<rect x="48" y="66" width="42" height="42" fill="none" stroke="#7a93c4" stroke-width="1.2" stroke-dasharray="4 3"/>
<rect x="100" y="88" width="42" height="42" fill="none" stroke="#7a93c4" stroke-width="1.2" stroke-dasharray="4 3"/>
<rect x="150" y="62" width="42" height="42" fill="#7a93c4" fill-opacity="0.25" stroke="#7a93c4" stroke-width="1.5"/>
<text x="120" y="172" font-size="13" fill="#3d4656" text-anchor="middle">candidate blocks</text>
<text x="120" y="228" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Target image</text>
<rect x="30" y="238" width="180" height="135" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
<ellipse cx="120" cy="288" rx="30" ry="36" fill="#d9b56a" fill-opacity="0.18" stroke="#d9b56a" stroke-width="1.5"/>
<text x="120" y="345" font-size="13" fill="#3d4656" text-anchor="middle">correspondence map</text>
<text x="120" y="362" font-size="13" fill="#3d4656" text-anchor="middle">(luminance)</text>
<rect x="262" y="130" width="258" height="150" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="391" y="155" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Block selection</text>
<text x="391" y="176" font-size="13" fill="#3d4656" text-anchor="middle">minimize weighted sum of errors:</text>
<text x="278" y="203" font-size="13" fill="#3d4656">α · overlap error (left/top seams)</text>
<text x="278" y="228" font-size="13" fill="#3d4656">(1−α) · correspondence error</text>
<text x="278" y="253" font-size="13" fill="#3d4656">(1−α) · difference from last pass</text>
<text x="640" y="108" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Output (current pass)</text>
<rect x="560" y="118" width="160" height="165" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<rect x="572" y="130" width="44" height="44" fill="#7ab89a" fill-opacity="0.12" stroke="#7ab89a" stroke-width="0.8"/>
<rect x="618" y="130" width="44" height="44" fill="#7ab89a" fill-opacity="0.2" stroke="#7ab89a" stroke-width="0.8"/>
<rect x="664" y="130" width="44" height="44" fill="#7ab89a" fill-opacity="0.1" stroke="#7ab89a" stroke-width="0.8"/>
<rect x="572" y="176" width="44" height="44" fill="#7ab89a" fill-opacity="0.16" stroke="#7ab89a" stroke-width="0.8"/>
<rect x="612" y="170" width="52" height="52" fill="#7ab89a" fill-opacity="0.3" stroke="#7ab89a" stroke-width="1.5"/>
<path d="M614 222 L610 210 L616 198 L611 186 L615 176 L622 172 L632 175 L643 170 L653 174 L664 171" fill="none" stroke="#d98a9e" stroke-width="1.8"/>
<line x1="636" y1="242" x2="622" y2="225" stroke="#6a7280" stroke-width="1"/>
<text x="640" y="256" font-size="13" fill="#3d4656" text-anchor="middle">min-error seam</text>
<path d="M212 115 C240 115 232 182 254 182" fill="none" stroke="#3d4656" stroke-width="1.5" marker-end="url(#qf1arr)"/>
<path d="M212 305 C240 305 232 230 254 230" fill="none" stroke="#3d4656" stroke-width="1.5" marker-end="url(#qf1arr)"/>
<path d="M522 200 L552 200" fill="none" stroke="#3d4656" stroke-width="1.5" marker-end="url(#qf1arr)"/>
<path d="M640 287 C640 345 391 345 391 286" fill="none" stroke="#3d4656" stroke-width="1.5" marker-end="url(#qf1arr)"/>
<text x="516" y="360" font-size="13" fill="#6a7280" text-anchor="middle">output of the previous pass</text>
</g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: block selection during transfer — seam overlap, correspondence to the target, and the previous pass each contribute a weighted error term.</p>
</div>

I have also selected other textures and target image and tested our implementation without iteration to verify if the parameters (block size, overlap size, error threshold) and constant weights of the error are of reasonable range. 

<div class="gallery-box">
  <div class="gallery">
        <img src="/images/64400.jpeg" loading="lazy" alt="Project">
  </div>
</div>

Because there is no iteration and reducing block sizes, the initial block size determines the quality of the output image. A larger block size would correspond to more of the texture element captured in the texture image, but would overlook smaller and more detailed features in the target image such as the facial features of eyes, nose and mouth. On the other hand, if a smaller block size could separate more clearly the facial features, they may sample repetitive small blocks from the texture image that ruins the original texture. In general, smaller blocks can capture finer details of the texture, leading to more precise and nuanced texture transfer and can adapt more easily to varying shapes and contours in the target image. However, they are also more computation-heavy. Therefore, there is trade-off between the continuity and resemblance to the original texture and the accuracy in depicting the structure of the target image. In our approach, we have decided to preserve the smoothness of the texture so we sacrifice finer details sampling such as of the facial features of the target image.

Another parameter that factors into the performance of the texture synthesis is the error threshold given to the block selection process. A lower threshold ensures a closer match between the source texture and the target image, leading to higher quality texture transfer but might result in overfitting, where the choices of blocks that satisfy the constraints are too few and texture adheres too closely to specific image features, losing the continuation of the texture material. On the other hand, a larger error threshold would permit a larger variety of blocks to be sampled from, but the transferred texture might not match as closely with the target image, potentially leading to less accurate or coherent results. It can lead to more varied and natural-looking textures. The texture may not integrate well with the target image’s features, leading to visible inconsistencies.

The diagram below summarizes the two parameter trade-offs described above.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 322" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" role="img" aria-label="Trade-offs of block size and error threshold">
<defs><marker id="qf3arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#6a7280"/></marker></defs>
<g font-family="Helvetica, Arial, sans-serif">
<text x="30" y="36" font-size="15" font-weight="600" fill="#3d4656">Block size</text>
<text x="520" y="34" font-size="13" fill="#3d4656" text-anchor="middle">our choice: keep the texture smooth</text>
<path d="M520 54 L513 42 L527 42 Z" fill="#d98a9e"/>
<path d="M370 58 L150 58" fill="none" stroke="#6a7280" stroke-width="1.5" marker-end="url(#qf3arr)"/>
<path d="M370 58 L590 58" fill="none" stroke="#6a7280" stroke-width="1.5" marker-end="url(#qf3arr)"/>
<text x="138" y="62" font-size="13" fill="#3d4656" text-anchor="end">smaller</text>
<text x="602" y="62" font-size="13" fill="#3d4656">larger</text>
<rect x="60" y="78" width="280" height="76" rx="8" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="200" y="100" font-size="13" fill="#3d4656" text-anchor="middle">captures eyes, nose, contours</text>
<text x="200" y="119" font-size="13" fill="#3d4656" text-anchor="middle">repeated small patches ruin texture</text>
<text x="200" y="138" font-size="13" fill="#3d4656" text-anchor="middle">heavier computation</text>
<rect x="400" y="78" width="280" height="76" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="540" y="108" font-size="13" fill="#3d4656" text-anchor="middle">smooth, continuous texture motifs</text>
<text x="540" y="130" font-size="13" fill="#3d4656" text-anchor="middle">fine facial features are lost</text>
<text x="30" y="196" font-size="15" font-weight="600" fill="#3d4656">Error threshold</text>
<path d="M370 218 L150 218" fill="none" stroke="#6a7280" stroke-width="1.5" marker-end="url(#qf3arr)"/>
<path d="M370 218 L590 218" fill="none" stroke="#6a7280" stroke-width="1.5" marker-end="url(#qf3arr)"/>
<text x="138" y="222" font-size="13" fill="#3d4656" text-anchor="end">lower</text>
<text x="602" y="222" font-size="13" fill="#3d4656">higher</text>
<rect x="60" y="238" width="280" height="76" rx="8" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="200" y="260" font-size="13" fill="#3d4656" text-anchor="middle">tight match to target features</text>
<text x="200" y="279" font-size="13" fill="#3d4656" text-anchor="middle">few blocks qualify → overfits</text>
<text x="200" y="298" font-size="13" fill="#3d4656" text-anchor="middle">texture continuity breaks</text>
<rect x="400" y="238" width="280" height="76" rx="8" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
<text x="540" y="260" font-size="13" fill="#3d4656" text-anchor="middle">varied, natural-looking texture</text>
<text x="540" y="279" font-size="13" fill="#3d4656" text-anchor="middle">looser match to the target</text>
<text x="540" y="298" font-size="13" fill="#3d4656" text-anchor="middle">visible inconsistencies</text>
</g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: the two parameter trade-offs — block size and error threshold — with the failure mode at each extreme.</p>
</div>

As can be seen from the iterative results, this image produced from the first generation usually has larger blocks with visible discontinuous edges in between. Moreover, as closer inspection would reveal, despite match- ing the features of target image, all of the blocks are of similar colors and repetitive elements from the texture. Nevertheless, the main features of the target image are approximately retrieved and recovered, maybe due to the initial starting block sizes. In the image produced in the second iteration, the discontinuation between adjacent blocks are already greatly improved from the first iteration such that there is smoother transition and blend- ing along the seams. The texture also is more accurate and close to the texture image as opposed to repetitive blocks. Finally, the third iteration presents the final result where the texture takes that of the texture image with the geometrical structure of the target image. Compared with the first iteration, there is much more variation in the blocks selected and the transition between blocks are barely visible due to the iteratively reducing block sizes.

Besides the block sizes used in each iteration, another parameter crucial to the performance of the iterative texture transfer algorithm is the error weights attached to each type of error. In each iteration, the respective weights of the errors are adjusted. We introduce a variable α to change the weights based on the number of iteration. The coefficient or weight of the original error in texture synthesis (difference in the left and top over- lap) is multiplied by α. The error defined as the difference between correspondence function of the the target image and the block is multiplied by the weight (1 − α) and the error difference between the output from the last iteration and the texture image is multiplied by (1 − α). α is defined as the following in terms of the number of iteration $α=0.5·(i−1)/(n-1) + 0.1$ where i is the number of the current iteration and n is the number of the total iterations. 4 

The schematic below shows how the block size and the weight α evolve across the passes.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 322" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" role="img" aria-label="Iterative refinement with shrinking block size and growing alpha">
<defs>
<marker id="qf2arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#3d4656"/></marker>
<marker id="qf2arrg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#6a7280"/></marker>
</defs>
<g font-family="Helvetica, Arial, sans-serif">
<text x="120" y="32" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Iteration 1 · large blocks</text>
<text x="370" y="32" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Iteration 2 · smaller</text>
<text x="620" y="32" font-size="14" font-weight="600" fill="#3d4656" text-anchor="middle">Iteration 3 · smallest</text>
<rect x="20" y="52" width="200" height="141" rx="6" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<rect x="70" y="52" width="50" height="47" fill="#7a93c4" fill-opacity="0.15"/>
<rect x="170" y="52" width="50" height="47" fill="#7a93c4" fill-opacity="0.15"/>
<rect x="20" y="99" width="50" height="47" fill="#7a93c4" fill-opacity="0.15"/>
<rect x="120" y="99" width="50" height="47" fill="#7a93c4" fill-opacity="0.15"/>
<rect x="70" y="146" width="50" height="47" fill="#7a93c4" fill-opacity="0.15"/>
<rect x="170" y="146" width="50" height="47" fill="#7a93c4" fill-opacity="0.15"/>
<path d="M70 52 L70 193 M120 52 L120 193 M170 52 L170 193 M20 99 L220 99 M20 146 L220 146" fill="none" stroke="#d98a9e" stroke-width="2.2" opacity="0.85"/>
<rect x="270" y="52" width="200" height="141" rx="6" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<rect x="295" y="52" width="25" height="23.5" fill="#7a93c4" fill-opacity="0.18"/>
<rect x="370" y="52" width="25" height="23.5" fill="#7a93c4" fill-opacity="0.1"/>
<rect x="420" y="75.5" width="25" height="23.5" fill="#7a93c4" fill-opacity="0.2"/>
<rect x="270" y="99" width="25" height="23.5" fill="#7a93c4" fill-opacity="0.08"/>
<rect x="345" y="75.5" width="25" height="23.5" fill="#7a93c4" fill-opacity="0.12"/>
<rect x="320" y="122.5" width="25" height="23.5" fill="#7a93c4" fill-opacity="0.16"/>
<rect x="445" y="122.5" width="25" height="23.5" fill="#7a93c4" fill-opacity="0.12"/>
<rect x="295" y="169.5" width="25" height="23.5" fill="#7a93c4" fill-opacity="0.14"/>
<rect x="395" y="146" width="25" height="23.5" fill="#7a93c4" fill-opacity="0.2"/>
<path d="M295 52 L295 193 M320 52 L320 193 M345 52 L345 193 M370 52 L370 193 M395 52 L395 193 M420 52 L420 193 M445 52 L445 193 M270 75.5 L470 75.5 M270 99 L470 99 M270 122.5 L470 122.5 M270 146 L470 146 M270 169.5 L470 169.5" fill="none" stroke="#d98a9e" stroke-width="1.2" opacity="0.5"/>
<rect x="520" y="52" width="200" height="141" rx="6" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<rect x="520" y="52" width="200" height="141" rx="6" fill="#7a93c4" fill-opacity="0.05"/>
<rect x="532.5" y="63.75" width="12.5" height="11.75" fill="#7a93c4" fill-opacity="0.2"/>
<rect x="570" y="52" width="12.5" height="11.75" fill="#7a93c4" fill-opacity="0.14"/>
<rect x="607.5" y="87.25" width="12.5" height="11.75" fill="#7a93c4" fill-opacity="0.22"/>
<rect x="545" y="110.75" width="12.5" height="11.75" fill="#7a93c4" fill-opacity="0.12"/>
<rect x="657.5" y="63.75" width="12.5" height="11.75" fill="#7a93c4" fill-opacity="0.18"/>
<rect x="682.5" y="122.5" width="12.5" height="11.75" fill="#7a93c4" fill-opacity="0.15"/>
<rect x="595" y="157.75" width="12.5" height="11.75" fill="#7a93c4" fill-opacity="0.2"/>
<rect x="632.5" y="134.25" width="12.5" height="11.75" fill="#7a93c4" fill-opacity="0.12"/>
<rect x="695" y="169.5" width="12.5" height="11.75" fill="#7a93c4" fill-opacity="0.16"/>
<path d="M532.5 52 L532.5 193 M545 52 L545 193 M557.5 52 L557.5 193 M570 52 L570 193 M582.5 52 L582.5 193 M595 52 L595 193 M607.5 52 L607.5 193 M620 52 L620 193 M632.5 52 L632.5 193 M645 52 L645 193 M657.5 52 L657.5 193 M670 52 L670 193 M682.5 52 L682.5 193 M695 52 L695 193 M707.5 52 L707.5 193 M520 63.75 L720 63.75 M520 75.5 L720 75.5 M520 87.25 L720 87.25 M520 99 L720 99 M520 110.75 L720 110.75 M520 122.5 L720 122.5 M520 134.25 L720 134.25 M520 146 L720 146 M520 157.75 L720 157.75 M520 169.5 L720 169.5 M520 181.25 L720 181.25" fill="none" stroke="#d98a9e" stroke-width="1" opacity="0.18"/>
<text x="245" y="110" font-size="13" fill="#3d4656" text-anchor="middle">smaller</text>
<text x="245" y="126" font-size="13" fill="#3d4656" text-anchor="middle">blocks</text>
<path d="M226 142 L262 142" fill="none" stroke="#3d4656" stroke-width="1.5" marker-end="url(#qf2arr)"/>
<text x="495" y="110" font-size="13" fill="#3d4656" text-anchor="middle">smaller</text>
<text x="495" y="126" font-size="13" fill="#3d4656" text-anchor="middle">blocks</text>
<path d="M476 142 L512 142" fill="none" stroke="#3d4656" stroke-width="1.5" marker-end="url(#qf2arr)"/>
<text x="120" y="212" font-size="13" fill="#3d4656" text-anchor="middle">visible seams,</text>
<text x="120" y="229" font-size="13" fill="#3d4656" text-anchor="middle">repetitive similar blocks</text>
<text x="370" y="212" font-size="13" fill="#3d4656" text-anchor="middle">smoother blending</text>
<text x="370" y="229" font-size="13" fill="#3d4656" text-anchor="middle">along the seams</text>
<text x="620" y="212" font-size="13" fill="#3d4656" text-anchor="middle">texture of the source,</text>
<text x="620" y="229" font-size="13" fill="#3d4656" text-anchor="middle">structure of the target</text>
<text x="370" y="254" font-size="13" fill="#3d4656" text-anchor="middle">weight α on the overlap (texture-coherence) error grows each pass</text>
<path d="M100 268 L634 268" fill="none" stroke="#6a7280" stroke-width="1.5" marker-end="url(#qf2arrg)"/>
<path d="M120 263 L120 273 M370 263 L370 273 M620 263 L620 273" fill="none" stroke="#6a7280" stroke-width="1.5"/>
<text x="120" y="291" font-size="13" fill="#3d4656" text-anchor="middle">α = 0.10</text>
<text x="370" y="291" font-size="13" fill="#3d4656" text-anchor="middle">α = 0.35</text>
<text x="620" y="291" font-size="13" fill="#3d4656" text-anchor="middle">α = 0.60</text>
<text x="370" y="312" font-size="13" fill="#6a7280" text-anchor="middle">α = 0.5·(i−1)/(n−1) + 0.1 (shown for n = 3 iterations)</text>
</g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: iterative refinement — blocks shrink each pass while α shifts weight from target matching toward texture coherence, fading the seams.</p>
</div>

The greatest difference between the sampling and the quilting algorithm is the efficiency. While synthesizing an output texture of size 192 × 192 can take hours using nonparametric sampling, the quilting algorithm can produce an output of size 512 × 512 within minutes. In fact, the quilting algorithm is inspired by the fact that when running the pixel-based algorithm, the same groups of pixels are repeatedly used, as it forms a minimal motif of the texture. Therefore, there is much potential for increasing the efficiency by using these patches directly.

Although the quilting algorithm is considerably faster, it has potentially two main flaws: 1. The seams along which the blocks are pasted together can look obvious, which makes the resulting image not smooth-looking; 2. The resulting image can look too regular and not organic because the same patches repeat in a periodic pattern, especially when the block ratio setting is either too small or too big. In contrast, the nonparametric sampling algorithm suffers from not being able to faithfully create the minimal integral element of the texture, e.g., a piece of fruit or a flower, and the deformation of these recognizable visual elements can look quite uncanny to the viewer. However, the sampling algorithm can work better with more stochastic and uniform looking textures without discernable integral elements, since there is no artifact of gluing.

We can also explore several future directions for the texture transfer algorithm. First, other correspondence map function can be used other than luminance to produce more interesting results such as the color of a patch or contrast with neighboring patches. Initial block sizes can also be adjusted based on repetitive elements in texture and minimal feature in target image.
