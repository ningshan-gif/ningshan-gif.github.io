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


  /* =======================
  // Instagram 3D posts
  ======================= */
  const instagramPost = document.querySelector("[data-instagram-post]");

  if (instagramPost) {
    const gallery = instagramPost.querySelector(".gallery");
    const galleryImages = gallery ? Array.from(gallery.querySelectorAll("img")) : [];
    const postContent = instagramPost.querySelector(".post__content");

    galleryImages.forEach((image, index) => {
      const count = Math.max(galleryImages.length, 1);
      const angle = (index / count) * Math.PI * 2;
      const ring = index % 2 === 0 ? 260 : 155;
      const lift = ((index % 5) - 2) * 34;
      const depth = ((index % 6) - 2.5) * 44;
      const rotate = ((index % 7) - 3) * 4;

      image.classList.add("no-lightense");
      image.setAttribute("tabindex", "0");
      image.style.setProperty("--ig-x", `${Math.cos(angle) * ring}px`);
      image.style.setProperty("--ig-y", `${Math.sin(angle) * (ring * .58) + lift}px`);
      image.style.setProperty("--ig-z", `${depth}px`);
      image.style.setProperty("--ig-r", `${rotate}deg`);
    });

    if (gallery) {
      let isDragging = false;

      const moveSpace = (event) => {
        const rect = gallery.getBoundingClientRect();
        const point = event.touches ? event.touches[0] : event;
        const x = ((point.clientX - rect.left) / rect.width) - .5;
        const y = ((point.clientY - rect.top) / rect.height) - .5;

        gallery.style.setProperty("--ig-rotate-y", `${x * 18}deg`);
        gallery.style.setProperty("--ig-rotate-x", `${y * -12}deg`);
      };

      gallery.addEventListener("mousemove", moveSpace);
      gallery.addEventListener("touchmove", moveSpace, { passive: true });
      gallery.addEventListener("pointerdown", (event) => {
        isDragging = true;
        moveSpace(event);
      });
      window.addEventListener("pointermove", (event) => {
        if (isDragging) moveSpace(event);
      });
      window.addEventListener("pointerup", () => {
        isDragging = false;
      });
      gallery.addEventListener("mouseleave", () => {
        if (!isDragging) {
          gallery.style.setProperty("--ig-rotate-y", "0deg");
          gallery.style.setProperty("--ig-rotate-x", "0deg");
        }
      });
    }

    if (postContent) {
      const cloud = document.createElement("div");
      const rawWords = postContent.textContent
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[@#][^\s]+/g, "")
        .split(/\s+/)
        .map((word) => word.replace(/[.,!?;:"'()[\]{}]/g, "").trim())
        .filter((word) => word.length > 3)
        .slice(0, 18);
      const words = rawWords.length ? rawWords : ["sleepychunk", "memory", "image", "song"];

      words.forEach((word, index) => {
        const chip = document.createElement("span");
        chip.textContent = word;
        chip.style.setProperty("--word-x", `${8 + ((index * 29) % 84)}%`);
        chip.style.setProperty("--word-y", `${18 + ((index * 17) % 64)}%`);
        chip.style.setProperty("--word-r", `${((index % 7) - 3) * 5}deg`);
        cloud.appendChild(chip);
      });

      cloud.className = "instagram-word-cloud";
      postContent.appendChild(cloud);
    }

    const musicUrl = instagramPost.dataset.musicUrl;
    const instagramUrl = instagramPost.dataset.instagramUrl;

    // --- Rich interactive player (when music_url is set) ---
    const player = instagramPost.querySelector("[data-instagram-player]");
    if (player) {
      const playBtn = player.querySelector("[data-instagram-play-toggle]");
      const playIcon = player.querySelector("[data-play-icon]");
      const waveform = player.querySelector("[data-instagram-waveform]");
      const progressWrap = player.querySelector("[data-instagram-progress-wrap]");
      const progressBar = player.querySelector("[data-instagram-progress]");
      const thumb = player.querySelector("[data-instagram-thumb]");
      const timeEl = player.querySelector("[data-instagram-time]");
      let audio = null;
      let rafId = null;

      function fmt(s) {
        const m = Math.floor(s / 60);
        const ss = String(Math.floor(s % 60)).padStart(2, "0");
        return `${m}:${ss}`;
      }

      function tick() {
        if (!audio) return;
        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progressBar.style.width = pct + "%";
        thumb.style.left = pct + "%";
        timeEl.textContent = fmt(audio.currentTime) + (audio.duration ? " / " + fmt(audio.duration) : "");
        rafId = requestAnimationFrame(tick);
      }

      function setPlaying(playing) {
        playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
        playBtn.classList.toggle("is-playing", playing);
        playIcon.className = playing ? "ion ion-ios-pause" : "ion ion-ios-play";
        waveform.classList.toggle("is-playing", playing);
        if (playing) { rafId = requestAnimationFrame(tick); }
        else { cancelAnimationFrame(rafId); }
      }

      playBtn.addEventListener("click", () => {
        if (!audio) {
          audio = new Audio(musicUrl);
          audio.addEventListener("ended", () => setPlaying(false));
          audio.addEventListener("error", () => {
            setPlaying(false);
            window.open(instagramUrl, "_blank", "noopener");
          });
        }
        if (audio.paused) {
          audio.play().then(() => setPlaying(true)).catch(() => {
            window.open(instagramUrl, "_blank", "noopener");
          });
        } else {
          audio.pause();
          setPlaying(false);
        }
      });

      progressWrap.addEventListener("click", (e) => {
        if (!audio || !audio.duration) return;
        const rect = progressWrap.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = pct * audio.duration;
      });
    }

    // --- Legacy play button (no music_url — opens Instagram) ---
    const soundButton = instagramPost.querySelector("[data-instagram-sound-toggle]");
    if (soundButton) {
      soundButton.addEventListener("click", () => {
        window.open(instagramUrl, "_blank", "noopener");
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
