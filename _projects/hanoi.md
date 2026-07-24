---
title: Hanoiiwa
date: 2022-12-10 08:01:35 +0300
subtitle: Robotics Manipulation
image: '/images/hanoi.png'
---

Robots today must be able to engage in autonomous task planning as well as motion planning to solve challenges. In this project, I present Hanoi-iiwa, a robotic system that is able to solve the Tower of Hanoi puzzle. With the goal of solving the puzzle correctly and efficiently, I built the system Drake and used a KUKA LBR iiwa robot arm. The system has a recursive Tower of Hanoi solver, a grasp position and posture selector, and a motion planner as its core components. I evaluated the performance of this system in terms of its correctness, efficiency, and robustness. The results show that the system is able to successfully solve the 3-disk Tower of Hanoi puzzle 100% of the time within 180 seconds over 10 runs. 

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/hanoi_illustration.png" loading="lazy" alt="Project">
  </div>
</div>

II. RELATED WORK
The Tower of Hanoi is a classic mathematical puzzle played around the world. The objective of the game is to stack all disks on the target peg in order of decreasing diameter. The robot’s movement is subject to two constraints:
1) Only one disk can be moved at a time.
2) A larger disk cannot be placed on top of a smaller disk.
The standard setup of a 4-disk Tower of Hanoi puzzle is presented in Fig. 1. At the beginning of the puzzle, four disks
Fig. 1. Illustration of the Tower of Hanoi
are stacked on peg (A). While the middle peg (B) can be used as a temporary holding place, the puzzle is solved when all disks are stacked in the same order on peg (C). The Tower of Hanoi is a puzzle with exponential time complexity [5], and much research has been done on solving the Tower of Hanoi in the field of mathematics, computer science, and robotics.

A. Recursive Approach to The Tower of Hanoi
As a widely studied algorithm challenge for new program- mers, the Tower of Hanoi puzzle with n disks would require at least
2n − 1
moves to solve [6]. Different forms of solutions have been proposed by mathematicians, such as iterative solutions [6], recursive solutions [8], and binary solutions. Our project will combine the classic recursive approach of solving the puzzle with robotic manipulation techniques, demonstrating its ability to not only reason through the puzzle, but also solve the puzzle physically. We choose to implement the recursive algorithm as it provides a compact solution with great flexibility for the robot to play the Tower of Hanoi with any number of disks.

The diagram below shows how the recursive solver unrolls the 3-disk puzzle into the exact sequence of pick-and-place steps the robot executes.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 405" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="Helvetica, Arial, sans-serif">
  <defs>
    <marker id="hn-arr-tree" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#7a93c4"/>
    </marker>
    <marker id="hn-arr-seq" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#6a7280"/>
    </marker>
  </defs>
  <text x="20" y="24" font-size="15" font-weight="bold" fill="#3d4656">Recursive decomposition of the 3-disk puzzle</text>
  <rect x="285" y="40" width="170" height="36" rx="8" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="370" y="63" font-size="14" text-anchor="middle" fill="#3d4656">solve(3, A &#8594; C)</text>
  <path d="M362,76 L178,126" stroke="#7a93c4" stroke-width="1.3" fill="none" marker-end="url(#hn-arr-tree)"/>
  <path d="M370,76 L370,118" stroke="#7a93c4" stroke-width="1.3" fill="none" marker-end="url(#hn-arr-tree)"/>
  <path d="M378,76 L562,126" stroke="#7a93c4" stroke-width="1.3" fill="none" marker-end="url(#hn-arr-tree)"/>
  <rect x="95" y="130" width="150" height="36" rx="8" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="170" y="153" font-size="14" text-anchor="middle" fill="#3d4656">solve(2, A &#8594; B)</text>
  <rect x="495" y="130" width="150" height="36" rx="8" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
  <text x="570" y="153" font-size="14" text-anchor="middle" fill="#3d4656">solve(2, B &#8594; C)</text>
  <rect x="312" y="123" width="116" height="48" rx="8" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
  <text x="370" y="143" font-size="13" text-anchor="middle" fill="#3d4656">move disk 3</text>
  <text x="370" y="161" font-size="13" text-anchor="middle" fill="#6a7280">A &#8594; C</text>
  <circle cx="318" cy="123" r="11" fill="#d9b56a"/>
  <text x="318" y="127.5" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">4</text>
  <path d="M148,166 L76,216" stroke="#7a93c4" stroke-width="1.3" fill="none" marker-end="url(#hn-arr-tree)"/>
  <path d="M170,166 L178,215" stroke="#7a93c4" stroke-width="1.3" fill="none" marker-end="url(#hn-arr-tree)"/>
  <path d="M192,166 L280,216" stroke="#7a93c4" stroke-width="1.3" fill="none" marker-end="url(#hn-arr-tree)"/>
  <path d="M548,166 L460,216" stroke="#7a93c4" stroke-width="1.3" fill="none" marker-end="url(#hn-arr-tree)"/>
  <path d="M570,166 L562,215" stroke="#7a93c4" stroke-width="1.3" fill="none" marker-end="url(#hn-arr-tree)"/>
  <path d="M592,166 L664,216" stroke="#7a93c4" stroke-width="1.3" fill="none" marker-end="url(#hn-arr-tree)"/>
  <rect x="20" y="220" width="100" height="48" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="70" y="240" font-size="13" text-anchor="middle" fill="#3d4656">move disk 1</text>
  <text x="70" y="258" font-size="13" text-anchor="middle" fill="#6a7280">A &#8594; C</text>
  <circle cx="26" cy="220" r="11" fill="#7ab89a"/>
  <text x="26" y="224.5" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">1</text>
  <rect x="128" y="220" width="100" height="48" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="178" y="240" font-size="13" text-anchor="middle" fill="#3d4656">move disk 2</text>
  <text x="178" y="258" font-size="13" text-anchor="middle" fill="#6a7280">A &#8594; B</text>
  <circle cx="134" cy="220" r="11" fill="#7ab89a"/>
  <text x="134" y="224.5" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">2</text>
  <rect x="236" y="220" width="100" height="48" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="286" y="240" font-size="13" text-anchor="middle" fill="#3d4656">move disk 1</text>
  <text x="286" y="258" font-size="13" text-anchor="middle" fill="#6a7280">C &#8594; B</text>
  <circle cx="242" cy="220" r="11" fill="#7ab89a"/>
  <text x="242" y="224.5" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">3</text>
  <rect x="404" y="220" width="100" height="48" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="454" y="240" font-size="13" text-anchor="middle" fill="#3d4656">move disk 1</text>
  <text x="454" y="258" font-size="13" text-anchor="middle" fill="#6a7280">B &#8594; A</text>
  <circle cx="410" cy="220" r="11" fill="#7ab89a"/>
  <text x="410" y="224.5" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">5</text>
  <rect x="512" y="220" width="100" height="48" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="562" y="240" font-size="13" text-anchor="middle" fill="#3d4656">move disk 2</text>
  <text x="562" y="258" font-size="13" text-anchor="middle" fill="#6a7280">B &#8594; C</text>
  <circle cx="518" cy="220" r="11" fill="#7ab89a"/>
  <text x="518" y="224.5" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">6</text>
  <rect x="620" y="220" width="100" height="48" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="670" y="240" font-size="13" text-anchor="middle" fill="#3d4656">move disk 1</text>
  <text x="670" y="258" font-size="13" text-anchor="middle" fill="#6a7280">A &#8594; C</text>
  <circle cx="626" cy="220" r="11" fill="#7ab89a"/>
  <text x="626" y="224.5" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">7</text>
  <path d="M370,276 L370,298" stroke="#6a7280" stroke-width="1.5" fill="none" marker-end="url(#hn-arr-seq)"/>
  <text x="382" y="292" font-size="13" fill="#6a7280">leaf moves, in order</text>
  <rect x="24" y="308" width="92" height="56" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="70" y="325" font-size="13" font-weight="bold" text-anchor="middle" fill="#3d4656">1</text>
  <text x="70" y="341" font-size="13" text-anchor="middle" fill="#3d4656">disk 1</text>
  <text x="70" y="357" font-size="13" text-anchor="middle" fill="#6a7280">A &#8594; C</text>
  <rect x="124" y="308" width="92" height="56" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="170" y="325" font-size="13" font-weight="bold" text-anchor="middle" fill="#3d4656">2</text>
  <text x="170" y="341" font-size="13" text-anchor="middle" fill="#3d4656">disk 2</text>
  <text x="170" y="357" font-size="13" text-anchor="middle" fill="#6a7280">A &#8594; B</text>
  <rect x="224" y="308" width="92" height="56" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="270" y="325" font-size="13" font-weight="bold" text-anchor="middle" fill="#3d4656">3</text>
  <text x="270" y="341" font-size="13" text-anchor="middle" fill="#3d4656">disk 1</text>
  <text x="270" y="357" font-size="13" text-anchor="middle" fill="#6a7280">C &#8594; B</text>
  <rect x="324" y="308" width="92" height="56" rx="8" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
  <text x="370" y="325" font-size="13" font-weight="bold" text-anchor="middle" fill="#3d4656">4</text>
  <text x="370" y="341" font-size="13" text-anchor="middle" fill="#3d4656">disk 3</text>
  <text x="370" y="357" font-size="13" text-anchor="middle" fill="#6a7280">A &#8594; C</text>
  <rect x="424" y="308" width="92" height="56" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="470" y="325" font-size="13" font-weight="bold" text-anchor="middle" fill="#3d4656">5</text>
  <text x="470" y="341" font-size="13" text-anchor="middle" fill="#3d4656">disk 1</text>
  <text x="470" y="357" font-size="13" text-anchor="middle" fill="#6a7280">B &#8594; A</text>
  <rect x="524" y="308" width="92" height="56" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="570" y="325" font-size="13" font-weight="bold" text-anchor="middle" fill="#3d4656">6</text>
  <text x="570" y="341" font-size="13" text-anchor="middle" fill="#3d4656">disk 2</text>
  <text x="570" y="357" font-size="13" text-anchor="middle" fill="#6a7280">B &#8594; C</text>
  <rect x="624" y="308" width="92" height="56" rx="8" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
  <text x="670" y="325" font-size="13" font-weight="bold" text-anchor="middle" fill="#3d4656">7</text>
  <text x="670" y="341" font-size="13" text-anchor="middle" fill="#3d4656">disk 1</text>
  <text x="670" y="357" font-size="13" text-anchor="middle" fill="#6a7280">A &#8594; C</text>
  <text x="370" y="392" font-size="13" font-style="italic" text-anchor="middle" fill="#6a7280">pick-and-place step sequence handed to the gripper grasp selector</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: The recursive solver expands solve(3, A&#8594;C) into the minimal 7-move (2&#179;&#8722;1) pick-and-place sequence that drives the grasp selector.</p>
</div>

B. Path Planning for Disk Transportation
A critical challenge for a robot to solve the Tower of Hanoi is to determine a smooth, collision-free and time-efficient path to transport each disk to desired pegs. In 2013, a physical system with two robotic manipulators capable of solving variations of the Tower of Hanoi has been developed by Havur et al. [4]. Havur’s system approached the problem of path planning by establishing a bilateral relationship between task planning and motion planning in the framework [4]. Havur employed Rapidly exploring Random Trees (RRT) [7] using both the initial and the goal location as starting nodes of the bilateral RRT [4]. Bilateral RRT expands from both starting nodes to the center, and a desired trajectory is created once paths of two ends connect [4].

Path planning in our project differs from the approach taken by Havur in several critical ways. First, our robot assumes an initial knowledge of the starting location of each disk and peg. We made this simplification given the limited time of our project. With more time, a camera system can be installed to determine the location of disks and pegs dynamically using point cloud registration [8]. Second, instead of RRT, we generate the gripper’s planned path by a simple linear interpolation of keyframes, which we implement using Drake’s PiecewisePolynomial class. We choose this implementation because the manipulation environment of the Tower of Hanoi is static and has no cluttered objects, and simple interpolation is sufficient to generate efficient collision-free trajectories and has less computational complexity compared to RRT. Our choice is further justified by our decision to use flat platforms of different colors to represent pegs, which reduces the required accuracy of the robot’s positioning of the disks and allows more flexibility in generating feasible paths to use interpolation.

The figure below contrasts the two path-planning strategies for a single disk transfer.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 330" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;display:block;margin:1.4rem auto" font-family="Helvetica, Arial, sans-serif">
  <defs>
    <marker id="hn-arr-kf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#7a93c4"/>
    </marker>
  </defs>
  <text x="20" y="24" font-size="15" font-weight="bold" fill="#3d4656">Path planning for one disk transfer: sampling vs. keyframes</text>
  <rect x="20" y="40" width="300" height="230" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1"/>
  <text x="170" y="64" font-size="14" font-weight="bold" text-anchor="middle" fill="#3d4656">Bilateral RRT (prior work)</text>
  <path d="M58,238 L95,220 M58,238 L80,196 M58,238 L118,244 M95,220 L128,198 M95,220 L140,232 M80,196 L108,170 M128,198 L158,178 M108,170 L140,148 M158,178 L178,162" stroke="#d98a9e" stroke-width="1.4" fill="none"/>
  <path d="M283,90 L252,108 M283,90 L268,136 M283,90 L240,86 M252,108 L222,124 M268,136 L246,160 M222,124 L198,142 M246,160 L220,182 M198,142 L190,152" stroke="#d98a9e" stroke-width="1.4" fill="none"/>
  <circle cx="95" cy="220" r="3" fill="#d98a9e"/>
  <circle cx="80" cy="196" r="3" fill="#d98a9e"/>
  <circle cx="118" cy="244" r="3" fill="#d98a9e"/>
  <circle cx="128" cy="198" r="3" fill="#d98a9e"/>
  <circle cx="140" cy="232" r="3" fill="#d98a9e"/>
  <circle cx="108" cy="170" r="3" fill="#d98a9e"/>
  <circle cx="158" cy="178" r="3" fill="#d98a9e"/>
  <circle cx="140" cy="148" r="3" fill="#d98a9e"/>
  <circle cx="178" cy="162" r="3" fill="#d98a9e"/>
  <circle cx="252" cy="108" r="3" fill="#d98a9e"/>
  <circle cx="268" cy="136" r="3" fill="#d98a9e"/>
  <circle cx="240" cy="86" r="3" fill="#d98a9e"/>
  <circle cx="222" cy="124" r="3" fill="#d98a9e"/>
  <circle cx="246" cy="160" r="3" fill="#d98a9e"/>
  <circle cx="198" cy="142" r="3" fill="#d98a9e"/>
  <circle cx="220" cy="182" r="3" fill="#d98a9e"/>
  <circle cx="190" cy="152" r="3" fill="#d98a9e"/>
  <circle cx="184" cy="157" r="14" fill="none" stroke="#3d4656" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="184" y="196" font-size="13" text-anchor="middle" fill="#6a7280">trees meet</text>
  <circle cx="58" cy="238" r="5" fill="#3d4656"/>
  <text x="58" y="258" font-size="13" text-anchor="middle" fill="#3d4656">start</text>
  <circle cx="283" cy="90" r="5" fill="#3d4656"/>
  <text x="283" y="80" font-size="13" text-anchor="middle" fill="#3d4656">goal</text>
  <text x="170" y="292" font-size="13" text-anchor="middle" fill="#6a7280">random tree growth from both endpoints;</text>
  <text x="170" y="309" font-size="13" text-anchor="middle" fill="#6a7280">a path emerges where the trees meet</text>
  <rect x="340" y="40" width="380" height="230" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1"/>
  <text x="530" y="64" font-size="14" font-weight="bold" text-anchor="middle" fill="#3d4656">Keyframe interpolation (Hanoi-iiwa)</text>
  <line x1="362" y1="240" x2="698" y2="240" stroke="#6a7280" stroke-width="1"/>
  <rect x="385" y="230" width="80" height="10" rx="4" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.2"/>
  <text x="425" y="258" font-size="13" text-anchor="middle" fill="#6a7280">start peg</text>
  <rect x="595" y="230" width="80" height="10" rx="4" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.2"/>
  <text x="635" y="258" font-size="13" text-anchor="middle" fill="#6a7280">goal peg</text>
  <rect x="408" y="206" width="34" height="24" rx="3" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
  <rect x="618" y="206" width="34" height="24" rx="3" fill="none" stroke="#d9b56a" stroke-width="1.2" stroke-dasharray="4 3"/>
  <path d="M425,193 L425,140" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#hn-arr-kf)"/>
  <path d="M432,130 L626,130" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#hn-arr-kf)"/>
  <path d="M635,137 L635,191" stroke="#7a93c4" stroke-width="1.5" fill="none" marker-end="url(#hn-arr-kf)"/>
  <circle cx="425" cy="184" r="2.2" fill="#7a93c4"/>
  <circle cx="425" cy="170" r="2.2" fill="#7a93c4"/>
  <circle cx="425" cy="156" r="2.2" fill="#7a93c4"/>
  <circle cx="452" cy="130" r="2.2" fill="#7a93c4"/>
  <circle cx="478" cy="130" r="2.2" fill="#7a93c4"/>
  <circle cx="504" cy="130" r="2.2" fill="#7a93c4"/>
  <circle cx="530" cy="130" r="2.2" fill="#7a93c4"/>
  <circle cx="556" cy="130" r="2.2" fill="#7a93c4"/>
  <circle cx="582" cy="130" r="2.2" fill="#7a93c4"/>
  <circle cx="608" cy="130" r="2.2" fill="#7a93c4"/>
  <circle cx="635" cy="150" r="2.2" fill="#7a93c4"/>
  <circle cx="635" cy="164" r="2.2" fill="#7a93c4"/>
  <circle cx="635" cy="178" r="2.2" fill="#7a93c4"/>
  <circle cx="425" cy="200" r="6" fill="#ffffff" stroke="#7a93c4" stroke-width="2"/>
  <circle cx="425" cy="130" r="6" fill="#ffffff" stroke="#7a93c4" stroke-width="2"/>
  <circle cx="635" cy="130" r="6" fill="#ffffff" stroke="#7a93c4" stroke-width="2"/>
  <circle cx="635" cy="200" r="6" fill="#ffffff" stroke="#7a93c4" stroke-width="2"/>
  <text x="438" y="198" font-size="13" fill="#3d4656">K1 grasp</text>
  <text x="425" y="114" font-size="13" text-anchor="middle" fill="#3d4656">K2 lift</text>
  <text x="635" y="114" font-size="13" text-anchor="middle" fill="#3d4656">K3 above goal</text>
  <text x="623" y="197" font-size="13" text-anchor="end" fill="#3d4656">K4 place</text>
  <text x="530" y="152" font-size="13" font-style="italic" text-anchor="middle" fill="#6a7280">sampled at each timestep</text>
  <text x="530" y="292" font-size="13" text-anchor="middle" fill="#6a7280">keyframes joined by straight segments (PiecewisePolynomial);</text>
  <text x="530" y="309" font-size="13" text-anchor="middle" fill="#6a7280">inverse kinematics gives joint angles at every sample</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Why Hanoi-iiwa replaces sampling-based RRT with straight-line keyframe interpolation &#8212; the static, uncluttered scene keeps interpolated gripper paths collision-free.</p>
</div>

C. Limitations of Current Research and Goal of Our Project
The goal of our research is to build a robotic system capable of strategic task planning and path planning in the context of playing the Tower of Hanoi. Compared to complex physical robotic systems like Havur’s, our system takes on a fundamental approach and is nonetheless efficient in solving a slightly simplified version of the problem. We constructed a system composed of a recursive puzzle solver, a gripper grasp position selector, and a robot arm motion planner. The system was tested on a simulation Tower of Hanoi model with three disks, and results showed that it was capable of solving a 3- disk Tower of Hanoi puzzle with a 100% success rate on 10 runs. With minor modifications, the system can be expanded to solve the Tower of Hanoi puzzles with more than three disks easily. We made certain simplifications on visual components of the model and the environment as trade-offs to present a functioning system given the limited amount of time. The final product of our project is Hanoi-iiwa, a working implementa- tion of a robot The Tower of Hanoi solver. Thanks to Drake’s wide range of compatible robot models, the system of Hanoi- iiwa can be generalized to control different types of robot arms.


<div class="gallery-box">
  <div class="gallery">
    <img src="/images/architecture.png" loading="lazy" alt="Project">
  </div>
</div>

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/hanoi.png" loading="lazy" alt="Project">
  </div>
</div>


To develop Hanoi-iiwa, we followed three steps: First, we set up the simulation environment in Drake; Second, we
designed the system architecture with three components of a puzzle solver, a grasp selector, and a motion planner; Last, we implemented the system and optimized its performance.

A. Simulation Environment Setup
The simulation environment of Hanoi-iiwa is composed of a KuKa LBR iiwa robot arm, three ”pegs” of the Tower of Hanoi in the form three cylindrical platforms of different colors, and three ”disks” represented by boxes of different sizes. The 3D visualization of Hanoi-iiwa in Drake is shown in Fig. 1 below.
Fig. 2. Setup of Hanoi-iiwa in Drake
Due to the difficulty of contact geometry with objects with holes, we could not simulate the three pegs in the original tower of Hanoi game with loops that have holes in the middle. Instead, we replaced the peg in the original model with colored areas indicating the spot and the disks with boxes that increase in size. Moreover, instead of perceiving the location and pose of the disks at every grasp which is time consuming and data- heavy, we simply store the pose of each disk in a list of variables and update it when it is moved. Therefore we have access to the location of any disk in time.
Our project is based on the Drake simulation platform and we referenced the Drake guide extensively. Specifically, we used the AddShape function in Drake to build the disks that have increasing diameters.
B. System Architecture Design
At a high level, a recursive Tower of Hanoi solver, a gripper grasp position and posture selector, and a motion planner are the three core components of the Hanoi-iiwa system. As shown in Fig. 3, the system accepts the number of disks in the Tower of Hanoi, the starting position and posture of disks, pegs, and the robot arm as input. The puzzle solver takes the input and generates a sequence of pick-and-place movement steps, where each step specifies the disk to be moved, the starting peg, and the destination peg. For each step in the sequence, the gripper grasp position selector maps the step to the desired beginning and ending position and rotation of the robot’s gripper. Finally, the motion planner takes the data and constructs a trajectory for the gripper using key frame interpolation, derives joint angles of the robot arm at each time step of the trajectory.


<div class="gallery-box">
  <div class="gallery">
    <img src="/images/flowchart.png" loading="lazy" alt="Project">
  </div>
</div>

We evaluate the performance of Hanoi-iiwa based on its ability to successfully solve the Tower of Hanoi and the efficiency of its solution. Due to the limitation of time and exponential time complexity of the Tower of Hanoi, we tested Hanoi-iiwa’s performance on the 3-disk Tower of Hanoi puzzle. Our simulation showed that Hanoi-iiwa was able to successfully solve the puzzle 100% of the time over 10 runs. In terms of efficiency, Hanoi-iiwa was able to solve the puzzle in the minimum number of steps (7), but it took 175 seconds to complete those steps, averaging 25 seconds per step. Overall, Hanoi-iiwa meets our design goal of generating correct puzzle solutions and performing efficient task planning. It offers a straightforward framework for combining task planning and motion planning to enable robots to solve mathematical puzzles. However, there is room for improvement in terms of the time-efficiency of manipulation.
