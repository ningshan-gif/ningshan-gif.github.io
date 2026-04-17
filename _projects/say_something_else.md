---
title: Say Something Else
date: 2026-04-17 08:01:35 +0300
subtitle: Privacy-preserving LLM communication through information sufficiency
image: '/images/say-something-else/teaser.png'
---

This project is a research paper on privacy-preserving LLM communication. As LLM agents are increasingly used to draft emails, messages, and applications on behalf of users, they often receive sensitive private context in the process. The central question of this project is: how can an agent help someone communicate effectively while revealing as little private information as possible?

In this work, we formalize the problem as an Information Sufficiency task. Instead of treating privacy as simply deleting or vaguely generalizing sensitive details, we introduce a third strategy: free-text pseudonymization. The idea is to let the model replace sensitive attributes with plausible, functionally equivalent alternatives that still satisfy the conversational goal. For example, instead of exposing the real private reason behind a request, the system can generate a response that sounds natural, remains useful, and does not invite unnecessary probing.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/say-something-else/teaser.png" loading="lazy" alt="Say Something Else teaser">
    <img src="/images/say-something-else/protocol.png" loading="lazy" alt="Say Something Else protocol">
  </div>
</div>

We also designed a conversational evaluation protocol that goes beyond judging a single generated message. Rather than stopping after the first reply, we test whether privacy strategies still hold up when a receiver asks realistic follow-up questions. Across 792 scenarios covering different power relations and types of sensitive information, we evaluated seven frontier language models on privacy, utility, and covertness. The results show that pseudonymization gives the strongest overall privacy-utility tradeoff, while generalization often performs worse than expected once follow-up pressure is introduced.

More broadly, this project argues that privacy in AI-mediated communication is not just about withholding information. It is about giving users practical control over how much of their private lives becomes legible in everyday interactions with bosses, peers, partners, and institutions. The paper reframes contextual privacy as a question of sufficiency: what is the least amount of true private information that must be revealed for communication to still work?
