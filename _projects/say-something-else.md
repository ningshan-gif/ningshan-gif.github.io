---
title: Say Something Else
date: 2024-08-19 08:01:35 +0300
subtitle: Privacy-preserving LLM communication through information sufficiency
image: '/images/say-something-else/protocol.png'
---

LLM agents increasingly draft messages on behalf of users — time-off requests, rental inquiries, job applications. But when a user shares private context to guide the agent (say, that they need schedule flexibility for chemotherapy), a naive system may surface that detail directly in the message. This project asks: how can an agent help someone communicate effectively while revealing as little private information as possible?

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/say-something-else/teaser.png" loading="lazy" alt="Three privacy strategies: suppression triggers follow-up, generalization partially reveals the domain, pseudonymization satisfies the receiver while protecting the true attribute">
  </div>
</div>

Prior work on LLM privacy offers two strategies borrowed from structured-data privacy: **suppression** (omit the sensitive detail) and **generalization** (replace it with a vaguer category). The teaser above shows why both fall short in conversation. Suppression creates information gaps that invite follow-up questions ("Why? Is everything okay?"). Generalization partially reveals the domain, and its hedged language signals withholding — which triggers targeted probing.

We introduce a third strategy: **free-text pseudonymization**. Instead of deleting or blurring, the agent replaces the sensitive attribute with a plausible, functionally equivalent alternative. The receiver gets a complete, coherent reply with no reason to probe further. The user retains control over what their private life looks like to others.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/say-something-else/protocol.png" loading="lazy" alt="Conversational evaluation protocol: each scenario runs two turns, with a simulated receiver sending realistic follow-up questions">
  </div>
</div>

We evaluated all three strategies with a **conversational evaluation protocol** that tests what happens after the first message. A simulated receiver sends realistic follow-up questions, and we measure how much private information leaks by the end of the exchange. This matters because single-message evaluation systematically gets the rankings wrong.

**Key findings across 792 scenarios and seven frontier LLMs:**

- Pseudonymization achieves the strongest privacy–utility tradeoff (MIL-AD = 0.764), outperforming suppression (0.730) and generalization (0.664).
- Generalization is Pareto-dominated by the unprotected baseline — the default strategy recommended by most prior work actually hurts more than it helps.
- Under follow-up pressure, generalization loses up to 16.3 percentage points of privacy. Suppression degrades too (+8.3 pp). Pseudonymization stays stable (+3.9 pp).
- The mechanism is **covertness**: pseudonymization sounds as natural as an unprotected reply (4.35/5 vs. 4.40/5). Suppression and generalization sound evasive (3.64 and 3.41), which invites exactly the follow-up that causes leakage.

The diagram below traces this covertness mechanism from reply style to eventual leakage.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 276" role="img" aria-label="Two-lane flow diagram: suppression and generalization produce evasive-sounding replies that signal withholding, trigger targeted follow-up questions, and lose privacy; pseudonymization produces natural-sounding replies, gives no reason to probe, and stays stable." style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
<defs>
<marker id="sse1-ap" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#d98a9e"/></marker>
<marker id="sse1-ag" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#7ab89a"/></marker>
</defs>
<g font-family="Helvetica, Arial, sans-serif">
<rect x="20" y="15" width="11" height="11" rx="2" fill="#d98a9e"/>
<text x="38" y="26" font-size="14" font-weight="600" fill="#3d4656">Suppression &amp; generalization</text>
<rect x="20" y="40" width="160" height="88" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="100" y="70" text-anchor="middle" font-size="13" fill="#3d4656">Reply sounds hedged</text>
<text x="100" y="88" text-anchor="middle" font-size="13" fill="#3d4656">and evasive</text>
<text x="100" y="110" text-anchor="middle" font-size="12" fill="#6a7280">naturalness 3.64 / 3.41</text>
<path d="M184 84 L203 84" stroke="#d98a9e" stroke-width="1.8" fill="none" marker-end="url(#sse1-ap)"/>
<rect x="209" y="40" width="136" height="88" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="277" y="78" text-anchor="middle" font-size="13" fill="#3d4656">Receiver senses</text>
<text x="277" y="96" text-anchor="middle" font-size="13" fill="#3d4656">withholding</text>
<path d="M349 84 L368 84" stroke="#d98a9e" stroke-width="1.8" fill="none" marker-end="url(#sse1-ap)"/>
<rect x="374" y="40" width="140" height="88" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="444" y="78" text-anchor="middle" font-size="13" fill="#3d4656">Targeted follow-up</text>
<text x="444" y="96" text-anchor="middle" font-size="13" fill="#3d4656">questions</text>
<path d="M518 84 L537 84" stroke="#d98a9e" stroke-width="1.8" fill="none" marker-end="url(#sse1-ap)"/>
<rect x="543" y="40" width="176" height="88" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="631" y="68" text-anchor="middle" font-size="13" fill="#3d4656">Privacy erodes</text>
<text x="631" y="90" text-anchor="middle" font-size="12" fill="#6a7280">suppression: 8.3 pp lost</text>
<text x="631" y="107" text-anchor="middle" font-size="12" fill="#6a7280">generalization: up to 16.3 pp</text>
<rect x="20" y="149" width="11" height="11" rx="2" fill="#7ab89a"/>
<text x="38" y="160" font-size="14" font-weight="600" fill="#3d4656">Pseudonymization</text>
<rect x="20" y="174" width="160" height="88" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="100" y="202" text-anchor="middle" font-size="13" fill="#3d4656">Reply sounds natural</text>
<text x="100" y="224" text-anchor="middle" font-size="12" fill="#6a7280">naturalness 4.35</text>
<text x="100" y="241" text-anchor="middle" font-size="12" fill="#6a7280">(unprotected: 4.40)</text>
<path d="M184 218 L203 218" stroke="#7ab89a" stroke-width="1.8" fill="none" marker-end="url(#sse1-ag)"/>
<rect x="209" y="174" width="136" height="88" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="277" y="212" text-anchor="middle" font-size="13" fill="#3d4656">Nothing signals</text>
<text x="277" y="230" text-anchor="middle" font-size="13" fill="#3d4656">withholding</text>
<path d="M349 218 L368 218" stroke="#7ab89a" stroke-width="1.8" fill="none" marker-end="url(#sse1-ag)"/>
<rect x="374" y="174" width="140" height="88" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="444" y="212" text-anchor="middle" font-size="13" fill="#3d4656">No reason</text>
<text x="444" y="230" text-anchor="middle" font-size="13" fill="#3d4656">to probe further</text>
<path d="M518 218 L537 218" stroke="#7ab89a" stroke-width="1.8" fill="none" marker-end="url(#sse1-ag)"/>
<rect x="543" y="174" width="176" height="88" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="631" y="202" text-anchor="middle" font-size="13" fill="#3d4656">Privacy holds steady</text>
<text x="631" y="224" text-anchor="middle" font-size="12" fill="#6a7280">only 3.9 pp lost</text>
<text x="631" y="241" text-anchor="middle" font-size="12" fill="#6a7280">under follow-up</text>
</g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: The covertness mechanism — evasive-sounding replies signal withholding and invite the targeted follow-ups where leakage happens; pseudonymized replies sound natural, so the probing never starts.</p>
</div>

Context matters too. Pseudonymization's advantage is largest in intimate settings where the receiver has strong priors and high motivation to probe (MIL-AD = 0.853 in Intimate × Social Cost, vs. 0.704 for no protection). The hardest setting is Institutional × Discrimination Risk, where even the request itself partially reveals the attribute — asking for workplace accommodations narrows the hypothesis space regardless of strategy.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 284" role="img" aria-label="Two side-by-side panels comparing how much of the receiver's hypothesis space survives the request itself: in intimate social-cost settings most of the space stays plausible, leaving room for a pseudonym to hide; in institutional discrimination-risk settings the accommodation request alone rules out most of the space, leaving little cover for any strategy." style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
<defs>
<marker id="sse2-a" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#7a93c4"/></marker>
</defs>
<g font-family="Helvetica, Arial, sans-serif">
<text x="370" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">The request itself carries information</text>
<line x1="370" y1="44" x2="370" y2="272" stroke="#e8e4da" stroke-width="1"/>
<text x="30" y="60" font-size="14" font-weight="600" fill="#3d4656">Intimate &#215; Social Cost</text>
<text x="30" y="78" font-size="12" fill="#6a7280">strong priors, high motivation to probe</text>
<rect x="30" y="92" width="300" height="32" rx="7" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.4"/>
<text x="180" y="112" text-anchor="middle" font-size="12" fill="#3d4656">hypothesis space: many plausible reasons</text>
<path d="M70 130 L70 158" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#sse2-a)"/>
<text x="86" y="148" font-size="12" fill="#6a7280">request: an everyday scheduling ask</text>
<rect x="30" y="168" width="226" height="32" rx="7" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
<rect x="262" y="168" width="68" height="32" rx="7" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.2" stroke-dasharray="4 3"/>
<line x1="143" y1="202" x2="143" y2="208" stroke="#6a7280" stroke-width="1"/>
<line x1="296" y1="202" x2="296" y2="208" stroke="#6a7280" stroke-width="1"/>
<text x="143" y="222" text-anchor="middle" font-size="12" fill="#6a7280">still plausible — room to hide</text>
<text x="296" y="222" text-anchor="middle" font-size="12" fill="#6a7280">ruled out</text>
<text x="30" y="250" font-size="13" fill="#3d4656">A pseudonym has plenty of cover to blend into.</text>
<text x="30" y="268" font-size="12" fill="#6a7280">MIL-AD 0.853 vs 0.704 unprotected — largest gain</text>
<text x="390" y="60" font-size="14" font-weight="600" fill="#3d4656">Institutional &#215; Discrimination Risk</text>
<text x="390" y="78" font-size="12" fill="#6a7280">the request alone partially reveals the attribute</text>
<rect x="390" y="92" width="300" height="32" rx="7" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.4"/>
<text x="540" y="112" text-anchor="middle" font-size="12" fill="#3d4656">hypothesis space: many plausible reasons</text>
<path d="M430 130 L430 158" stroke="#7a93c4" stroke-width="1.8" fill="none" marker-end="url(#sse2-a)"/>
<text x="446" y="148" font-size="12" fill="#6a7280">request: asks for workplace accommodations</text>
<rect x="390" y="168" width="62" height="32" rx="7" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.4"/>
<rect x="458" y="168" width="232" height="32" rx="7" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.2" stroke-dasharray="4 3"/>
<line x1="421" y1="202" x2="421" y2="208" stroke="#6a7280" stroke-width="1"/>
<line x1="574" y1="202" x2="574" y2="208" stroke="#6a7280" stroke-width="1"/>
<text x="421" y="222" text-anchor="middle" font-size="12" fill="#6a7280">still plausible</text>
<text x="574" y="222" text-anchor="middle" font-size="12" fill="#6a7280">ruled out by the ask itself</text>
<text x="390" y="250" font-size="13" fill="#3d4656">Little cover remains for any strategy to use.</text>
<text x="390" y="268" font-size="12" fill="#6a7280">hardest setting across all strategies</text>
</g>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: Why context matters — an everyday ask leaves the receiver's hypothesis space wide, giving a pseudonym room to hide; an institutional accommodation request narrows that space by itself, so every strategy struggles.</p>
</div>

The broader argument: privacy in AI-mediated communication is not about withholding information. It is about giving users practical control over how much of their private lives becomes legible in everyday exchanges with bosses, peers, partners, and institutions. What is the least amount of true private information that must be revealed for communication to still work?

*Joint work with Yunze Xiao, Wenkai Li, Xiaoyuan Wu, Yueqi Song, and Weihao Xuan. Submitted to COLM 2026.*
