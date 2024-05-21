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

I have also selected other textures and target image and tested our implementation without iteration to verify if the parameters (block size, overlap size, error threshold) and constant weights of the error are of reasonable range. 

<div class="gallery-box">
  <div class="gallery">
        <img src="/images/64400.jpeg" loading="lazy" alt="Project">
  </div>
</div>

Because there is no iteration and reducing block sizes, the initial block size determines the quality of the output image. A larger block size would correspond to more of the texture element captured in the texture image, but would overlook smaller and more detailed features in the target image such as the facial features of eyes, nose and mouth. On the other hand, if a smaller block size could separate more clearly the facial features, they may sample repetitive small blocks from the texture image that ruins the original texture. In general, smaller blocks can capture finer details of the texture, leading to more precise and nuanced texture transfer and can adapt more easily to varying shapes and contours in the target image. However, they are also more computation-heavy. Therefore, there is trade-off between the continuity and resemblance to the original texture and the accuracy in depicting the structure of the target image. In our approach, we have decided to preserve the smoothness of the texture so we sacrifice finer details sampling such as of the facial features of the target image.

Another parameter that factors into the performance of the texture synthesis is the error threshold given to the block selection process. A lower threshold ensures a closer match between the source texture and the target image, leading to higher quality texture transfer but might result in overfitting, where the choices of blocks that satisfy the constraints are too few and texture adheres too closely to specific image features, losing the continuation of the texture material. On the other hand, a larger error threshold would permit a larger variety of blocks to be sampled from, but the transferred texture might not match as closely with the target image, potentially leading to less accurate or coherent results. It can lead to more varied and natural-looking textures. The texture may not integrate well with the target image’s features, leading to visible inconsistencies.

As can be seen from the iterative results, this image produced from the first generation usually has larger blocks with visible discontinuous edges in between. Moreover, as closer inspection would reveal, despite match- ing the features of target image, all of the blocks are of similar colors and repetitive elements from the texture. Nevertheless, the main features of the target image are approximately retrieved and recovered, maybe due to the initial starting block sizes. In the image produced in the second iteration, the discontinuation between adjacent blocks are already greatly improved from the first iteration such that there is smoother transition and blend- ing along the seams. The texture also is more accurate and close to the texture image as opposed to repetitive blocks. Finally, the third iteration presents the final result where the texture takes that of the texture image with the geometrical structure of the target image. Compared with the first iteration, there is much more variation in the blocks selected and the transition between blocks are barely visible due to the iteratively reducing block sizes.

Besides the block sizes used in each iteration, another parameter crucial to the performance of the iterative texture transfer algorithm is the error weights attached to each type of error. In each iteration, the respective weights of the errors are adjusted. We introduce a variable α to change the weights based on the number of iteration. The coefficient or weight of the original error in texture synthesis (difference in the left and top over- lap) is multiplied by α. The error defined as the difference between correspondence function of the the target image and the block is multiplied by the weight (1 − α) and the error difference between the output from the last iteration and the texture image is multiplied by (1 − α). α is defined as the following in terms of the number of iteration $α=0.5·(i−1)/(n-1) + 0.1$ where i is the number of the current iteration and n is the number of the total iterations. 4 

The greatest difference between the sampling and the quilting algorithm is the efficiency. While synthesizing an output texture of size 192 × 192 can take hours using nonparametric sampling, the quilting algorithm can produce an output of size 512 × 512 within minutes. In fact, the quilting algorithm is inspired by the fact that when running the pixel-based algorithm, the same groups of pixels are repeatedly used, as it forms a minimal motif of the texture. Therefore, there is much potential for increasing the efficiency by using these patches directly.

Although the quilting algorithm is considerably faster, it has potentially two main flaws: 1. The seams along which the blocks are pasted together can look obvious, which makes the resulting image not smooth-looking; 2. The resulting image can look too regular and not organic because the same patches repeat in a periodic pattern, especially when the block ratio setting is either too small or too big. In contrast, the nonparametric sampling algorithm suffers from not being able to faithfully create the minimal integral element of the texture, e.g., a piece of fruit or a flower, and the deformation of these recognizable visual elements can look quite uncanny to the viewer. However, the sampling algorithm can work better with more stochastic and uniform looking textures without discernable integral elements, since there is no artifact of gluing.

We can also explore several future directions for the texture transfer algorithm. First, other correspondence map function can be used other than luminance to produce more interesting results such as the color of a patch or contrast with neighboring patches. Initial block sizes can also be adjusted based on repetitive elements in texture and minimal feature in target image.
