---
title: Cryptography and Security
date: 2022-01-06 08:01:35 +0300
subtitle: Analyzing Memory Usage of Adversarially Resistant Bloom Filters
image: '/images/security.png'
---

This is a final project I collaborated with three more MIT undergrad students on analyzing bloom filters as a data structure.

Bloom filters are widely used data structures in various applications for approximate mem- bership queries (AMQ). However, their usage in security-critical applications is limited due to the potential vulnerabilities to attacks by adversaries who can manipulate the filter to induce false positives. It is also limited by the need to store the representation of the bloom filter and the associated hash functions. Bloom filters are an important tool in cryptography due to their ability to efficiently represent sets and perform set membership tests. By leveraging their properties, it is possible to improve the efficiency, privacy, and security of various cryptographic protocols and applications.

In this project, we analyze the space-efficiency of bloom filters that are resilient against bounded and unbounded adversaries. Building on top work by Naor and Yogev, we show that we can construct adversarially resiliant AMQ filters with near-optimal memory usage under the correct assumptions.

[Download Bloom Filter Research PDF](/images/bloom_filter_research.pdf)