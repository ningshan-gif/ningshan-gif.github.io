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

  </div>
  <em>Gallery / <a href="/images/texture_transfer.jpeg" target="_blank">Unsplash</a></em>
</div>

I have also selected other textures and target image and tested our implementation without iteration to verify if the parameters (block size, overlap size, error threshold) and constant weights of the error are of reasonable range. 

<div class="gallery-box">
  <div class="gallery">
        <img src="/images/64400.jpeg" loading="lazy" alt="Project">
  </div>
</div>

Because there is no iteration and reducing block sizes, the initial block size determines the quality of the output image. A larger block size would correspond to more of the texture element captured in the texture image, but would overlook smaller and more detailed features in the target image such as the facial features of eyes, nose and mouth. On the other hand, if a smaller block size could separate more clearly the facial features, they may sample repetitive small blocks from the texture image that ruins the original texture. In general, smaller blocks can capture finer details of the texture, leading to more precise and nuanced texture transfer and can adapt more easily to varying shapes and contours in the target image. However, they are also more computation-heavy. Therefore, there is trade-off between the continuity and resemblance to the original texture and the accuracy in depicting the structure of the target image. In our approach, we have decided to preserve the smoothness of the texture so we sacrifice finer details sampling such as of the facial features of the target image.

Another parameter that factors into the performance of the texture synthesis is the error threshold given to the block selection process. A lower threshold ensures a closer match between the source texture and the target image, leading to higher quality texture transfer but might result in overfitting, where the choices of blocks that satisfy the constraints are too few and texture adheres too closely to specific image features, losing the continuation of the texture material. On the other hand, a larger error threshold would permit a larger variety of blocks to be sampled from, but the transferred texture might not match as closely with the target image, potentially leading to less accurate or coherent results. It can lead to more varied and natural-looking textures. The texture may not integrate well with the target image’s features, leading to visible inconsistencies.