---
title: Is She Smiling?
date: 2022-12-10 08:01:35 +0300
subtitle: Testing bias in facial expression recognition
image: '/images/deepface.png'
---
This is a project I collaborated with three other women in testing bias in AI systems. In this study, we examined the inherent biases in facial expression recognition technology. We tested the FERPlus dataset on the popular facial recognition model DeepFace and analyzed DeepFace’s performance in identifying seven dis- tinct emotions across various races and genders. Through the evaluation of True Positive Rates (TPR), False Positive Rates (FPR), True Negative Rates (TNR), and True Postive Rates (TPR) across demographic segments, our findings revealed a consistent perpetuation of biases by both the technology and the dataset. Our findings underscored the urgent need for a more systematic approach to mitigating biases.


<div class="gallery-box">
  <div class="gallery">
    <img src="/images/deepface.png" loading="lazy" alt="Project">

  </div>
</div>

Facial expression recognition, a key application of artificial intelligence, plays a vital role in various societal domains such as online interviews (Zetlin, 2018), personalized avatars (Borak, 2023), and the surveillance of prisons and detention centers where violent behaviors are common (Standaert, 2021). Despite its widespread adoption, facial expression recognition models, including the popular open-source DeepFace (Serengil & Ozpinar, 2021) can contain biases associated with gender, race, and age. In this project, we focus on investigating potential biases within DeepFace by assessing its performance on facial expression recognition using the FERPlus dataset (Barsoum et al., 2016). We aim to evaluate the biases of DeepFace using metrics such as False Negative Rate (FNR) and False Positive Rate (FPR), specifically addressing faces of different genders and races.

Although the decisions made by facial expression recognition models seem small compared to credit evaluation models or probation decision algorithms, understanding the harm of bias in facial expres- sion recognition models is increasingly critical today. Errors made by these algorithms have the potential to reinforce existing biases against specific racial, gender, and age groups. Biased recogni- tion can lead to financial losses, hinder the initiation of crucial mental health interventions, and even pose risks of injuries from unexpected assaults.

By comparing potential disparities in the accuracy of expression recognition of DeepFace between different genders and races, we aim to identify any systematic biases in DeepFace and analyze the underlying causes of these biases. This research will contribute to the ongoing efforts to enhance the fairness and reliability of facial expression recognition technologies, ensuring their responsible and equitable deployment in society for all.

The diagram below shows the audit pipeline we used to surface these disparities.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 408" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram of the bias audit pipeline: FERPlus images pass through DeepFace, predictions are compared with labels, error metrics are computed separately per demographic group, and gaps between groups reveal bias." font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
<defs>
<marker id="aud-blue" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#7a93c4"/></marker>
<marker id="aud-pink" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#d98a9e"/></marker>
</defs>
<rect x="30" y="28" width="180" height="78" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="120" y="54" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">FERPlus dataset</text>
<text x="120" y="74" text-anchor="middle" font-size="13" fill="#6a7280">face images with emotion,</text>
<text x="120" y="92" text-anchor="middle" font-size="13" fill="#6a7280">gender &amp; race labels</text>
<path d="M212,67 L250,67" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#aud-blue)"/>
<rect x="256" y="28" width="170" height="78" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
<text x="341" y="54" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">DeepFace model</text>
<text x="341" y="74" text-anchor="middle" font-size="13" fill="#6a7280">assigns 1 of 7 emotion</text>
<text x="341" y="92" text-anchor="middle" font-size="13" fill="#6a7280">classes to each face</text>
<path d="M428,67 L466,67" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#aud-blue)"/>
<rect x="472" y="28" width="220" height="78" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="582" y="54" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Predictions vs. labels</text>
<text x="582" y="74" text-anchor="middle" font-size="13" fill="#6a7280">hits, false alarms and</text>
<text x="582" y="92" text-anchor="middle" font-size="13" fill="#6a7280">misses for every face</text>
<path d="M582,106 C582,120 205,116 205,168" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#aud-blue)"/>
<path d="M582,106 C582,132 535,136 535,168" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#aud-blue)"/>
<text x="370" y="160" text-anchor="middle" font-size="13" font-style="italic" fill="#6a7280">results split by gender (and race)</text>
<rect x="60" y="172" width="290" height="112" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="205" y="197" text-anchor="middle" font-size="14.5" font-weight="600" fill="#3d4656">Women</text>
<text x="205" y="217" text-anchor="middle" font-size="13" fill="#6a7280">per-emotion confusion counts</text>
<rect x="72" y="232" width="62" height="30" rx="8" fill="#ffffff" stroke="#7a93c4"/>
<text x="103" y="251" text-anchor="middle" font-size="13" font-weight="600" fill="#3d4656">TPR</text>
<rect x="140" y="232" width="62" height="30" rx="8" fill="#ffffff" stroke="#7a93c4"/>
<text x="171" y="251" text-anchor="middle" font-size="13" font-weight="600" fill="#3d4656">FPR</text>
<rect x="208" y="232" width="62" height="30" rx="8" fill="#ffffff" stroke="#7a93c4"/>
<text x="239" y="251" text-anchor="middle" font-size="13" font-weight="600" fill="#3d4656">TNR</text>
<rect x="276" y="232" width="62" height="30" rx="8" fill="#ffffff" stroke="#7a93c4"/>
<text x="307" y="251" text-anchor="middle" font-size="13" font-weight="600" fill="#3d4656">FNR</text>
<rect x="390" y="172" width="290" height="112" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="535" y="197" text-anchor="middle" font-size="14.5" font-weight="600" fill="#3d4656">Men</text>
<text x="535" y="217" text-anchor="middle" font-size="13" fill="#6a7280">per-emotion confusion counts</text>
<rect x="402" y="232" width="62" height="30" rx="8" fill="#ffffff" stroke="#7a93c4"/>
<text x="433" y="251" text-anchor="middle" font-size="13" font-weight="600" fill="#3d4656">TPR</text>
<rect x="470" y="232" width="62" height="30" rx="8" fill="#ffffff" stroke="#7a93c4"/>
<text x="501" y="251" text-anchor="middle" font-size="13" font-weight="600" fill="#3d4656">FPR</text>
<rect x="538" y="232" width="62" height="30" rx="8" fill="#ffffff" stroke="#7a93c4"/>
<text x="569" y="251" text-anchor="middle" font-size="13" font-weight="600" fill="#3d4656">TNR</text>
<rect x="606" y="232" width="62" height="30" rx="8" fill="#ffffff" stroke="#7a93c4"/>
<text x="637" y="251" text-anchor="middle" font-size="13" font-weight="600" fill="#3d4656">FNR</text>
<path d="M205,284 C205,308 300,312 332,326" stroke="#d98a9e" stroke-width="2" fill="none" marker-end="url(#aud-pink)"/>
<path d="M535,284 C535,308 440,312 408,326" stroke="#d98a9e" stroke-width="2" fill="none" marker-end="url(#aud-pink)"/>
<rect x="185" y="330" width="370" height="64" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="370" y="356" text-anchor="middle" font-size="15" font-weight="600" fill="#3d4656">Compare metrics across groups</text>
<text x="370" y="376" text-anchor="middle" font-size="13" fill="#6a7280">systematic gaps in TPR / FPR / TNR / FNR = bias signal</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: The bias audit pipeline — identical error metrics are computed separately per demographic group, and the gaps between groups are the bias signal.</p>
</div>


<div class="gallery-box">
  <div class="gallery">
    <img src="/images/bias.png" loading="lazy" alt="Project">
  </div>
</div>


From the plot, several key observations can be made. First, the TPR of emotion recognition is generally higher for men than women, demonstrating that it does not perform equally well across gender groups. We observe the emotion ’happy’ in which the woman’s TPR is higher than that of the man’s TPR. This difference suggests that the model may have been trained on a dataset where expressions of happiness in women are either more frequent or more distinctly represented than in men. This could result from a bias in the dataset towards certain types of facial expressions or emotional displays in women. The higher accuracy in recognizing happiness in women could reflect societal stereotypes where women are often expected to show more openly positive emotions like happiness. If the training data for the model disproportionately represents women smiling or showing happiness, it could lead to this bias.
On the other hand, the FPR graph exposes stereotypical representations of men and women across the misinterpretation of certain emotions. High FPR for emotions like anger and fear in men, or happiness and surprise in women, might reinforce stereotypes or lead to misinterpretation in critical situations. The higher FPR for happiness in women and anger in men may inadvertently reinforce gender stereotypes where women are often stereotypically perceived as more emotional or prone to happiness, while men are frequently characterized as more likely to express anger. If an emotion recognition system incorrectly identifies these different emotions more frequently in each gender, it can perpetuate these stereotypes when put into use.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/case_study.png" loading="lazy" alt="Project">
  </div>
</div>

Given the highest accuracy of the ”happy” emotion and the predominant presence of ”neutral” within the predicted faces, we have chosen to focus our analysis on these two primary emotions (Fig.4, Fig.5). Delving into these emotions as case studies, we aimed to investigate potential gender biases. To comprehend the model’s performance in identifying these emotions, we generated heat maps illustrating the true positive rate (TPR), false positive rate (FPR), true negative rate (TNR), and false negative rate (FNR).

In the identification of the ”happy” emotion, the Fig.6 shows that the TPR exhibits a higher value for females (0.85) compared to males (0.78). This suggests that when it comes to correctly identifying the ”happy” emotion, females are more likely to be accurately recognized as experiencing happiness compared to males. Conversely, the TNR is notably lower for females (0.75) in contrast to males (0.92). The higher TNR for males suggests that the model more accurately identifies the absence of happiness in males. However, this could result in more instances of misclassifying unhappy female faces as happy.
On the other hand, in identifying the ”neutral” emotion(the Fig.7), there is a lower TPR for females (0.28) compared to males (0.36). Additionally, the FNR is higher for females (0.72) compared to males (0.64). The lower TPR for females implies that females are less likely to be correctly identified as experiencing a neutral emotion. The higher FNR for females suggests they are more likely to be incorrectly categorized as not experiencing a neutral emotion when they actually are.

 The model appears more proficient at identifying ”happy” emotions overall, yet disparities emerge when comparing the gender-based results. There are several reasons that can explain these biases. First, the FERPlus dataset contains an imbalance in the representation of ”neutral” and “happy” ex- pressions across genders. In the original dataset, for the identified faces, there are 830 faces of men labeled as neutral, whereas only 324 women were labeled as neutral. Second, there could be differ- ences in how males and females typically express certain emotions through facial cues. If the model is trained on expressions that are more commonly associated with one gender, it might perform bet- ter for that gender in recognizing those emotions. Additionally, the algorithms used for emotion recognition might inherently favor certain facial features or expressions that align more closely with one gender’s typical expressions, leading to differential accuracy in emotion identification.

The consequences of facial emotion recognition bias indicated above, especially when more women are misidentified as displaying positive emotions and more men are misidentified as calm or imper- sonal, can lead to social problems. Biases that consistently misidentify women as displaying posi- tive emotions, even when they’re neutral or experiencing negative emotions, can reinforce societal stereotypes that expect women to be more cheerful or emotionally positive. Similarly, misidentify- ing men as calm or impersonal irrespective of their emotions can reinforce stereotypes that expect men to be stoic and unemotional.
Misidentifications can lead to biased outcomes if these biased emotion recognition systems are used in crucial decision-making contexts like job interviews, promotions, or legal proceedings. For ex- ample, if a woman’s neutral expression is consistently interpreted as emotional, it might influence hiring decisions, leading to biased selections.

The diagram below traces how an imbalance in the training data turns into the stereotype-reinforcing loop described above.

<div style="background:#fbfaf7;border:1px solid #e8e4da;border-radius:12px;padding:18px 18px 8px">
<svg viewBox="0 0 740 356" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram of the self-reinforcing bias loop: skewed training data leads the model to learn gendered cues, producing asymmetric errors that amplify stereotypes, which feed back into future data." font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" style="max-width:100%;height:auto;display:block;margin:1.4rem auto">
<defs>
<marker id="loop-blue" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#7a93c4"/></marker>
<marker id="loop-pink" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#d98a9e"/></marker>
</defs>
<rect x="40" y="36" width="300" height="96" rx="10" fill="#eef2f7" stroke="#7a93c4" stroke-width="1.5"/>
<text x="190" y="62" text-anchor="middle" font-size="14.5" font-weight="600" fill="#3d4656">1 &#183; Skewed training data</text>
<text x="58" y="82" font-size="13" fill="#6a7280">FERPlus faces labelled &#8220;neutral&#8221;:</text>
<text x="58" y="99" font-size="12" fill="#3d4656">men &#183; 830</text>
<rect x="140" y="90" width="150" height="10" rx="3" fill="#7a93c4"/>
<text x="58" y="117" font-size="12" fill="#3d4656">women &#183; 324</text>
<rect x="140" y="108" width="59" height="10" rx="3" fill="#d98a9e"/>
<rect x="400" y="36" width="300" height="96" rx="10" fill="#eef7f1" stroke="#7ab89a" stroke-width="1.5"/>
<text x="550" y="66" text-anchor="middle" font-size="14.5" font-weight="600" fill="#3d4656">2 &#183; Model learns gendered cues</text>
<text x="550" y="88" text-anchor="middle" font-size="13" fill="#6a7280">expression features become</text>
<text x="550" y="106" text-anchor="middle" font-size="13" fill="#6a7280">entangled with gender</text>
<rect x="400" y="240" width="300" height="96" rx="10" fill="#fff8ea" stroke="#d9b56a" stroke-width="1.5"/>
<text x="550" y="270" text-anchor="middle" font-size="14.5" font-weight="600" fill="#3d4656">3 &#183; Asymmetric errors</text>
<text x="550" y="292" text-anchor="middle" font-size="13" fill="#6a7280">neutral women misread as &#8220;happy&#8221;,</text>
<text x="550" y="310" text-anchor="middle" font-size="13" fill="#6a7280">men defaulted to &#8220;neutral&#8221;</text>
<rect x="40" y="240" width="300" height="96" rx="10" fill="#fdf3f3" stroke="#d98a9e" stroke-width="1.5"/>
<text x="190" y="270" text-anchor="middle" font-size="14.5" font-weight="600" fill="#3d4656">4 &#183; Stereotypes amplified</text>
<text x="190" y="292" text-anchor="middle" font-size="13" fill="#6a7280">&#8220;cheerful&#8221; women, &#8220;stoic&#8221; men in</text>
<text x="190" y="310" text-anchor="middle" font-size="13" fill="#6a7280">hiring, interviews, surveillance</text>
<path d="M344,84 L394,84" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#loop-blue)"/>
<path d="M550,136 L550,234" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#loop-blue)"/>
<path d="M396,288 L346,288" stroke="#7a93c4" stroke-width="2" fill="none" marker-end="url(#loop-blue)"/>
<path d="M190,236 L190,138" stroke="#d98a9e" stroke-width="2" stroke-dasharray="6 5" fill="none" marker-end="url(#loop-pink)"/>
<text x="370" y="178" text-anchor="middle" font-size="13" font-style="italic" fill="#b06a80">feedback: biased outputs shape expectations</text>
<text x="370" y="196" text-anchor="middle" font-size="13" font-style="italic" fill="#b06a80">and the next generation of training data</text>
</svg>
<p style="font-size:0.85em;color:#6a7280;text-align:center;margin:8px 0 6px">Figure: The self-reinforcing bias loop — a labelling imbalance becomes gendered model behaviour, asymmetric errors, and amplified stereotypes that feed back into future data.</p>
</div>
