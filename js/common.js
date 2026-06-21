document.addEventListener("DOMContentLoaded", function() {
  'use strict';

  var html = document.querySelector('html'),
    menuOpenIcon = document.querySelector(".icon__menu"),
    menuCloseIcon = document.querySelector(".nav__icon-close"),
    menuList = document.querySelector(".main-nav"),
    toggleTheme = document.querySelector(".toggle-theme-js"),
    btnScrollToTop = document.querySelector(".top");


  /* =======================================================
  // Menu + Theme Switcher
  ======================================================= */
  menuOpenIcon.addEventListener("click", () => {
    menuOpen();
  });

  menuCloseIcon.addEventListener("click", () => {
    menuClose();
  });

  function menuOpen() {
    menuList.classList.add("is-open");
  }

  function menuClose() {
    menuList.classList.remove("is-open");
  }

  if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
      darkMode();
    });
  };


  // Theme Switcher
  function darkMode() {
    if (html.classList.contains('dark-mode')) {
      html.classList.remove('dark-mode');
      localStorage.removeItem("theme");
      document.documentElement.removeAttribute("dark");
    } else {
      html.classList.add('dark-mode');
      localStorage.setItem("theme", "dark");
      document.documentElement.setAttribute("dark", "");
    }
  }


  /* ================================================================
  // Stop Animations During Window Resizing and Switching Theme Modes
  ================================================================ */
  let disableTransition;

  if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
      stopAnimation();
    });

    window.addEventListener("resize", () => {
      stopAnimation();
    });

    function stopAnimation() {
      document.body.classList.add("disable-animation");
      clearTimeout(disableTransition);
      disableTransition = setTimeout(() => {
        document.body.classList.remove("disable-animation");
      }, 100);
    }
  }


  /* =======================
  // Responsive Videos
  ======================= */
  reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off), .project-content iframe:not(.reframe-off)");


  /* =======================
  // LazyLoad Images
  ======================= */
  var lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy"
  })


  /* ============================================================
  // Instagram Immersive 3-D Gallery
  ============================================================ */
  const instagramPost = document.querySelector("[data-instagram-post]");

  if (instagramPost) {
    const gallery      = instagramPost.querySelector(".gallery");
    // Select both images AND videos so scraped reels appear in the sphere
    const galleryMedia = gallery ? Array.from(gallery.querySelectorAll("img, video")) : [];
    const postContent  = instagramPost.querySelector(".post__content");
    const instagramUrl = instagramPost.dataset.instagramUrl;
    const REDUCED      = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── 1. Distribute media across clusters — max 5 per cluster, max 3 clusters ──
    //    Cap at 15 items so the sphere stays readable; extras stay hidden in post body.
    const MAX_SHOWN   = 15;
    const MAX_PER     = 5;
    const MAX_CLUSTERS = 3;
    const visibleMedia = galleryMedia.slice(0, MAX_SHOWN);
    const n = visibleMedia.length || 1;
    const numClusters = Math.min(MAX_CLUSTERS, Math.ceil(n / MAX_PER));

    // Cluster centers — spread far apart so each orb is clearly distinct.
    const CENTERS = [
      { cx:    0, cy:   0, cz:    0 },   // 1 – center
      { cx: -360, cy: -60, cz:  160 },   // 2 – left-front
      { cx:  360, cy: -60, cz: -160 },   // 3 – right-back
    ];

    // Single cluster: larger ellipsoid. Multi-cluster: tighter so they don't overlap.
    const RX = numClusters === 1 ? 310 : 180;
    const RY = numClusters === 1 ? 210 : 125;
    const RZ = numClusters === 1 ? 170 : 100;
    const GA = Math.PI * (3 - Math.sqrt(5)); // golden angle

    const mediaNodes = visibleMedia.map((el, i) => {
      const ci  = Math.min(Math.floor(i / MAX_PER), MAX_CLUSTERS - 1);
      const li  = i % MAX_PER;
      const lc  = Math.min(MAX_PER, n - ci * MAX_PER);
      const cc  = CENTERS[ci];
      const isVid = el.tagName === "VIDEO";

      // Golden-angle sphere distribution within each cluster
      const theta = li * GA;
      const phi   = Math.acos(1 - (2 * (li + 0.5)) / lc);
      const lx = Math.sin(phi) * Math.cos(theta) * RX;
      const ly = Math.cos(phi) * RY;
      const lz = Math.sin(phi) * Math.sin(theta) * RZ;
      const lr = ((theta * 57.3) % 18) - 9;

      const bx = cc.cx + lx;
      const by = cc.cy + ly;
      const bz = cc.cz + lz;

      const ph  = (i / n) * Math.PI * 2;
      const ay  = 14 + (i % 4) * 6;
      const ax  = 5  + (i % 3) * 3;
      const spd = 0.32 + (i % 7) * 0.07;

      el.classList.add("no-lightense");
      el.setAttribute("tabindex", "0");
      el.dataset.igIndex   = i;
      el.dataset.igCluster = ci;
      el.style.transform   = `translate3d(calc(-50% + ${bx}px), calc(-50% + ${by}px), ${bz}px) rotateZ(${lr}deg)`;

      // Videos muted in sphere; unmuted only when focused
      let badge = null;
      if (isVid) {
        el.muted = true;
        el.loop  = true;
        // Inject a ▶ badge that we'll move in the rAF loop to match the video
        badge = document.createElement("span");
        badge.className = "ig-video-badge";
        badge.setAttribute("aria-hidden", "true");
        el.insertAdjacentElement("afterend", badge);
      }

      return { el, badge, bx, by, bz, br: lr, ph, ay, ax, spd, ci, isVid };
    });

    // ── 2. Particle system ────────────────────────────────────────────────
    const pWrap = document.createElement("div");
    pWrap.className = "ig-particles";
    if (gallery) gallery.appendChild(pWrap);

    const PTINTS = ["#14b8a6", "#0d9488", "#5eead4", "#99f6e4", "#fff"];
    let particles = [];

    function spawnParticle() {
      if (particles.length >= 28) return;
      const el = document.createElement("div");
      el.className = "ig-particle";
      const sz = 3 + Math.random() * 7;
      el.style.setProperty("--psize", `${sz}px`);
      el.style.background = PTINTS[Math.floor(Math.random() * PTINTS.length)];
      el.style.boxShadow  = `0 0 ${sz * 2}px ${PTINTS[0]}`;
      pWrap.appendChild(el);
      particles.push({
        el, life: 0,
        maxLife: 80 + Math.random() * 140,
        x: (Math.random() - 0.5) * 460,
        y: (Math.random() - 0.5) * 280,
        z: (Math.random() - 0.5) * 180,
        vx: (Math.random() - 0.5) * 0.55,
        vy: -(0.55 + Math.random() * 0.75),
        vz: (Math.random() - 0.5) * 0.4,
      });
    }

    // ── 3. Animation state ────────────────────────────────────────────────
    let autoAngle = 0;
    let smMouseX  = 0, smMouseY = 0;
    let rawMouseX = 0, rawMouseY = 0;
    let focusIdx  = -1;
    let isPlaying = false;
    let lastTs    = 0;

    // ── 4. Pointer tracking ───────────────────────────────────────────────
    if (gallery) {
      const onMove = (e) => {
        const r  = gallery.getBoundingClientRect();
        const pt = e.touches ? e.touches[0] : e;
        rawMouseX = (pt.clientX - r.left) / r.width  - 0.5;
        rawMouseY = (pt.clientY - r.top)  / r.height - 0.5;
      };
      gallery.addEventListener("mousemove",  onMove);
      gallery.addEventListener("touchmove",  onMove, { passive: true });
      gallery.addEventListener("mouseleave", () => { rawMouseX = rawMouseY = 0; });
    }

    // ── 5. Media focus on click ───────────────────────────────────────────
    mediaNodes.forEach(({ el, isVid }, i) => {
      const toggle = () => {
        const opening = focusIdx !== i;
        focusIdx = opening ? i : -1;

        mediaNodes.forEach(({ el: mel, isVid: mv }, j) => {
          mel.classList.toggle("ig-focused", j === focusIdx);
          mel.classList.toggle("ig-dimmed",  focusIdx !== -1 && j !== focusIdx);

          // Pause all videos that are no longer focused
          if (mv && j !== focusIdx) {
            mel.muted = true;
            mel.pause();
          }
        });

        // If we just opened a video, play it (unmuted, with controls)
        if (opening && isVid) {
          el.muted = false;
          el.controls = true;
          el.play().catch(() => { el.muted = true; el.play(); });
        } else if (!opening && isVid) {
          el.controls = false;
          el.muted = true;
          el.pause();
        }
      };
      el.addEventListener("click",   toggle);
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") toggle(); });
    });

    // ── 6. Main rAF loop ─────────────────────────────────────────────────
    function raf(ts) {
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;

      if (!REDUCED) {
        smMouseX += (rawMouseX - smMouseX) * 0.055;
        smMouseY += (rawMouseY - smMouseY) * 0.055;

        autoAngle += dt * (isPlaying ? 11 : 4.5);

        const sceneX = smMouseY * -13 + Math.sin(ts / 5500) * 1.8;
        const sceneY = autoAngle  + smMouseX * 22;
        if (gallery) gallery.style.transform = `rotateX(${sceneX}deg) rotateY(${sceneY}deg)`;

        const t    = ts / 1000;
        const beat = isPlaying ? Math.sin(t * 5.8) * 0.022 : 0;

        mediaNodes.forEach((d, i) => {
          let tx, ty, tz, rz, sc;
          const fy = Math.sin(t * d.spd + d.ph) * d.ay;
          const fx = Math.cos(t * d.spd * 0.65 + d.ph) * d.ax;
          const fz = Math.sin(t * d.spd * 0.45 + d.ph + 1.1) * 16;
          const fr = Math.sin(t * d.spd * 0.35 + d.ph) * 1.4;

          if (focusIdx === i) {
            tx = 0; ty = 0; tz = 320; rz = 0; sc = 1.18;
          } else if (focusIdx !== -1) {
            tx = d.bx + fx; ty = d.by + fy; tz = d.bz + fz - 90; rz = d.br + fr; sc = 0.8;
          } else {
            const beatZ = isPlaying ? Math.sin(t * 3.2 + d.ph) * 18 : 0;
            tx = d.bx + fx; ty = d.by + fy; tz = d.bz + fz + beatZ;
            rz = d.br + fr; sc = 1 + beat;
          }

          const xf = `translate3d(calc(-50% + ${tx}px), calc(-50% + ${ty}px), ${tz}px) rotateZ(${rz}deg) scale(${sc})`;
          d.el.style.transform = xf;
          // Move the ▶ badge to the same 3D position as its video
          if (d.badge) {
            d.badge.style.transform = xf;
            d.badge.style.visibility = (focusIdx === i) ? "hidden" : "visible";
          }
        });

        if (isPlaying && Math.random() < 0.10) spawnParticle();

        particles = particles.filter(p => {
          p.life++;
          if (p.life > p.maxLife) { p.el.remove(); return false; }
          p.x += p.vx; p.y += p.vy; p.z += p.vz;
          p.vy *= 0.997;
          const fade = p.life < 14 ? p.life / 14
                     : p.life > p.maxLife - 18 ? (p.maxLife - p.life) / 18 : 1;
          p.el.style.left    = `calc(50% + ${p.x}px)`;
          p.el.style.top     = `calc(50% + ${p.y}px)`;
          p.el.style.opacity = (fade * 0.68).toFixed(3);
          p.el.style.transform = `translateZ(${p.z}px)`;
          return true;
        });
      }

      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ── 7. Word cloud ─────────────────────────────────────────────────────
    if (postContent) {
      const cloud = document.createElement("div");
      const rawW = postContent.textContent
        .replace(/https?:\/\/\S+/g, "").replace(/[@#][^\s]+/g, "")
        .split(/\s+/).map(w => w.replace(/[.,!?;:"'()[\]{}]/g, "").trim())
        .filter(w => w.length > 3).slice(0, 18);
      const words = rawW.length ? rawW : ["sleepychunk", "memory", "image", "song"];
      words.forEach((w, i) => {
        const chip = document.createElement("span");
        chip.textContent = w;
        chip.style.setProperty("--word-x",     `${8  + ((i * 29) % 84)}%`);
        chip.style.setProperty("--word-y",     `${18 + ((i * 17) % 64)}%`);
        chip.style.setProperty("--word-r",     `${((i % 7) - 3) * 5}deg`);
        chip.style.setProperty("--word-delay", `${(i * 0.45) % 7}s`);
        cloud.appendChild(chip);
      });
      cloud.className = "instagram-word-cloud";
      postContent.appendChild(cloud);
    }

    // ── 8. Music player ───────────────────────────────────────────────────
    function setPlaying(on) {
      isPlaying = on;
      if (gallery) gallery.classList.toggle("ig-playing", on);
    }

    const player = instagramPost.querySelector("[data-instagram-player]");
    if (player) {
      const playBtn   = player.querySelector("[data-instagram-play-toggle]");
      const playIcon  = player.querySelector("[data-play-icon]");
      const waveform  = player.querySelector("[data-instagram-waveform]");
      const progWrap  = player.querySelector("[data-instagram-progress-wrap]");
      const progBar   = player.querySelector("[data-instagram-progress]");
      const thumb     = player.querySelector("[data-instagram-thumb]");
      const timeEl    = player.querySelector("[data-instagram-time]");
      let audio = null, tickId = null;

      const fmt = s => {
        const m = Math.floor(s / 60);
        return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
      };

      const tick = () => {
        if (!audio) return;
        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progBar.style.width = pct + "%";
        thumb.style.left    = pct + "%";
        timeEl.textContent  = fmt(audio.currentTime) + (audio.duration ? " / " + fmt(audio.duration) : "");
        tickId = requestAnimationFrame(tick);
      };

      const setUI = (on) => {
        playBtn.setAttribute("aria-pressed", on ? "true" : "false");
        playBtn.classList.toggle("is-playing", on);
        playIcon.className = on ? "ion ion-ios-pause" : "ion ion-ios-play";
        waveform.classList.toggle("is-playing", on);
        setPlaying(on);
        if (on) { tickId = requestAnimationFrame(tick); }
        else { cancelAnimationFrame(tickId); }
      };

      playBtn.addEventListener("click", () => {
        if (!audio) {
          audio = new Audio(instagramPost.dataset.musicUrl);
          audio.addEventListener("ended", () => setUI(false));
          audio.addEventListener("error", () => { setUI(false); });
        }
        if (audio.paused) {
          audio.play()
            .then(() => setUI(true))
            .catch(() => {
              setPlaying(!isPlaying);
              playBtn.classList.toggle("is-playing", isPlaying);
              playIcon.className = isPlaying ? "ion ion-ios-pause" : "ion ion-ios-play";
              waveform.classList.toggle("is-playing", isPlaying);
              if (isPlaying) window.open(instagramUrl, "_blank", "noopener noreferrer");
            });
        } else {
          audio.pause();
          setUI(false);
        }
      });

      progWrap.addEventListener("click", e => {
        if (!audio || !audio.duration) return;
        const r = progWrap.getBoundingClientRect();
        audio.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * audio.duration;
      });
    }

    // Legacy sound button (posts without music_url → opens Instagram directly)
    const soundBtn = instagramPost.querySelector("[data-instagram-sound-toggle]");
    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        setPlaying(!isPlaying);
        soundBtn.classList.toggle("is-playing", isPlaying);
        if (isPlaying) window.open(instagramUrl, "_blank", "noopener noreferrer");
      });
    }
  }


  /* =======================
  // Zoom Image
  ======================= */
  const lightense = document.querySelector(".page__content img, .post__content img, .project-content img, .gallery__image img"),
  imageLink = document.querySelectorAll(".page__content a img, .post__content a img, .project-content a img, .gallery__image a img");

  if (imageLink) {
    for (var i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
    for (var i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
  }

  if (lightense) {
    Lightense(".page__content img:not(.no-lightense), .post__content img:not(.no-lightense), .project-content img:not(.no-lightense), .gallery__image img:not(.no-lightense)", {
    padding: 60,
    offset: 30
    });
  }


  /* ============================
  // Testimonials Slider
  ============================ */
  if (document.querySelector(".my-slider")) {
    var slider = tns({
      container: ".my-slider",
      items: 3,
      slideBy: 1,
      gutter: 32,
      nav: true,
      mouseDrag: true,
      autoplay: false,
      controls: false,
      speed: 500,
      responsive: {
        1024: {
          items: 3,
        },
        768: {
          items: 2,
        },
        0: {
          items: 1,
        }
      }
    });
  }


  /* =================================
  // Smooth scroll to the tags page
  ================================= */
  document.querySelectorAll(".tag__link, .top__link").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth"
      });
    });
  });


  /* =======================
  // Scroll Top Button
  ======================= */
  btnScrollToTop.addEventListener("click", function () {
    if (window.scrollY != 0) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      })
    }
  });

});
