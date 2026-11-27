/**
 * OffGrid Music — Interactive Showcase Controller
 * Handles Dark/Light theme, Sticky 3D UI Studio, 16-Question FAQ,
 * Support Email Copy, Viewport-aware Video Playback, 3D Pointer Tilt,
 * Back-to-Top control, Bidirectional Scroll-Driven / IntersectionObserver
 * 3D Reveal & Auto-Hide System, and live GitHub Releases APK sync.
 */
const SITE_CONFIG = {
  GITHUB_REPO: "Paul00755/OffGrid-Music",
  RELEASES_FALLBACK: "https://github.com/Paul00755/OffGrid-Music/releases/latest",
  BUY_ME_A_COFFEE_URL: "https://buymeacoffee.com/paulrajmes9",
  SUPPORT_EMAIL: "offgridmusicsupport@gmail.com"
};

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initConfigLinks();
  initNavbar();
  initBackToTop();
  initUIStudio();
  initFAQ();
  initCopyEmail();
  initVideoPlayback();
  init3DTilt();
  initScrollAnimations();
  fetchLatestGitHubRelease();
});

/* 1. Dark / Light Mode Toggle (persists in localStorage + syncs color-scheme) */
function initThemeToggle() {
  const root = document.documentElement;
  const saved = localStorage.getItem("offgrid-theme");
  const initialTheme = saved === "light" || saved === "dark" ? saved : "dark";
  root.setAttribute("data-theme", initialTheme);
  root.style.colorScheme = initialTheme;

  const toggleBtns = document.querySelectorAll("[data-theme-toggle]");
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      root.style.colorScheme = next;
      localStorage.setItem("offgrid-theme", next);
    });
  });
}

/* 2. Apply Buy Me a Coffee URL everywhere */
function initConfigLinks() {
  document.querySelectorAll("[data-bmc-link]").forEach((el) => {
    el.setAttribute("href", SITE_CONFIG.BUY_ME_A_COFFEE_URL);
  });
}

/* 3. Sticky Nav, Active Section Tracking & Mobile Drawer */
function initNavbar() {
  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");
  const drawer = document.getElementById("mobile-drawer");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && drawer) {
    const closeDrawer = () => {
      drawer.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("open")) {
        closeDrawer();
        toggle.focus();
      }
    });
  }

  if (navLinks.length && "IntersectionObserver" in window) {
    const linkById = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (section) linkById.set(section, link);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const activeLink = linkById.get(entry.target);
          if (!activeLink) continue;
          navLinks.forEach((l) => l.classList.toggle("active", l === activeLink));
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    linkById.forEach((_, section) => sectionObserver.observe(section));
  }
}

/* 4. Floating Back-to-Top Control */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  const updateVisibility = () => {
    btn.classList.toggle("visible", window.scrollY > 480);
  };
  window.addEventListener("scroll", updateVisibility, { passive: true });
  updateVisibility();

  btn.addEventListener("click", () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });
}

/* Helper: Arrow / Home / End keyboard navigation for ARIA tablists */
function bindTablistKeyboard(tabs, onSelect) {
  if (!tabs.length) return;
  tabs.forEach((tab, index) => {
    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;

      if (nextIndex === null) return;
      event.preventDefault();
      const targetTab = tabs[nextIndex];
      onSelect(targetTab);
      targetTab.focus();
    });
  });
}

/* 5. Interactive Sticky 3D UI Studio */
function initUIStudio() {
  const studioSection = document.getElementById("ui-studio");
  const steps = Array.from(document.querySelectorAll(".studio-step"));
  const slides = Array.from(document.querySelectorAll(".studio-slide-img"));
  const catBtns = Array.from(document.querySelectorAll(".cat-btn"));
  const capCat = document.getElementById("studio-caption-cat");
  const capName = document.getElementById("studio-caption-name");
  const nextCatBtn = document.getElementById("studio-next-cat");
  const catCountLabel = document.getElementById("studio-cat-count");

  if (!steps.length || !slides.length) return;

  const categoryOrder = ["nowplaying", "home", "lyrics", "playlists"];
  const categoryLabels = {
    nowplaying: "Now Playing (4 layouts)",
    home: "Home Screens (4 layouts)",
    lyrics: "Lyrics UI (3 layouts)",
    playlists: "Playlists UI (4 layouts)"
  };

  function activateLayout(id) {
    const targetStep = steps.find((s) => s.dataset.layout === id);
    if (!targetStep) return;

    steps.forEach((s) => s.classList.toggle("active", s.dataset.layout === id));
    slides.forEach((img) => img.classList.toggle("active", img.dataset.layout === id));

    if (capCat) capCat.textContent = targetStep.dataset.category || "";
    if (capName) capName.textContent = targetStep.dataset.title || "";
  }

  function selectCategory(catKey, scrollTabIntoView = false) {
    if (studioSection) {
      studioSection.setAttribute("data-studio-cat", catKey);
    }

    catBtns.forEach((btn) => {
      const isActive = btn.dataset.cat === catKey;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
      if (isActive && scrollTabIntoView) {
        btn.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    });

    const matchingSteps = [];
    steps.forEach((step) => {
      const match = step.dataset.catKey === catKey;
      step.classList.toggle("hidden-step", !match);
      if (match) matchingSteps.push(step);
    });

    if (catCountLabel) {
      catCountLabel.textContent = `Showing ${categoryLabels[catKey]}`;
    }

    if (nextCatBtn) {
      const nextIdx = (categoryOrder.indexOf(catKey) + 1) % categoryOrder.length;
      const nextKey = categoryOrder[nextIdx];
      nextCatBtn.dataset.nextCat = nextKey;
      nextCatBtn.textContent = `Next: ${categoryLabels[nextKey].split(" (")[0]} →`;
    }

    if (matchingSteps.length) {
      activateLayout(matchingSteps[0].dataset.layout);
    }
  }

  steps.forEach((step) => {
    step.setAttribute("tabindex", "0");
    step.setAttribute("role", "button");
    step.addEventListener("click", () => activateLayout(step.dataset.layout));
    step.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateLayout(step.dataset.layout);
      }
    });
  });

  catBtns.forEach((btn) => {
    btn.addEventListener("click", () => selectCategory(btn.dataset.cat, true));
  });

  bindTablistKeyboard(catBtns, (tab) => selectCategory(tab.dataset.cat, true));

  if (nextCatBtn) {
    nextCatBtn.addEventListener("click", () => {
      const nextKey = nextCatBtn.dataset.nextCat || "home";
      selectCategory(nextKey, true);
    });
  }

  selectCategory("nowplaying");
}

/* 6. Categorized 16-Question FAQ + Expand/Collapse All */
function initFAQ() {
  const filterBtns = Array.from(document.querySelectorAll(".faq-filter-btn"));
  const items = Array.from(document.querySelectorAll(".faq-item"));
  const countEl = document.getElementById("faq-count");
  const expandBtn = document.getElementById("faq-expand-all");

  if (!items.length) return;

  function syncExpandBtnState() {
    if (!expandBtn) return;
    const visibleItems = items.filter((item) => !item.classList.contains("hidden-faq"));
    const allOpen = visibleItems.length > 0 && visibleItems.every((item) => item.open);
    expandBtn.textContent = allOpen ? "Collapse all" : "Expand all";
    expandBtn.setAttribute("aria-expanded", String(allOpen));
  }

  function applyFilter(cat) {
    let visible = 0;
    items.forEach((item) => {
      const match = cat === "all" || item.dataset.faqCat === cat;
      item.classList.toggle("hidden-faq", !match);
      if (match) visible++;
    });
    if (countEl) {
      countEl.textContent = `${visible} ${visible === 1 ? "question" : "questions"}`;
    }
    filterBtns.forEach((btn) => {
      const isActive = btn.dataset.faqFilter === cat;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
    });
    syncExpandBtnState();
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.faqFilter));
  });

  bindTablistKeyboard(filterBtns, (tab) => applyFilter(tab.dataset.faqFilter));

  items.forEach((item) => item.addEventListener("toggle", syncExpandBtnState));

  if (expandBtn) {
    expandBtn.addEventListener("click", () => {
      const visibleItems = items.filter((item) => !item.classList.contains("hidden-faq"));
      const shouldOpen = !visibleItems.every((item) => item.open);
      visibleItems.forEach((item) => { item.open = shouldOpen; });
      syncExpandBtnState();
    });
  }

  applyFilter("all");
}

/* 7. Copy Support Email Button */
function initCopyEmail() {
  const copyBtn = document.getElementById("copy-email-btn");
  if (!copyBtn) return;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(SITE_CONFIG.SUPPORT_EMAIL);
      const original = copyBtn.textContent;
      copyBtn.textContent = "✓ Copied!";
      setTimeout(() => { copyBtn.textContent = original; }, 2000);
    } catch (_) {
      window.location.href = `mailto:${SITE_CONFIG.SUPPORT_EMAIL}`;
    }
  });
}

/* 8. Viewport-Aware Video Playback */
function initVideoPlayback() {
  const videos = Array.from(document.querySelectorAll(".widget-video-wrap video"));
  if (!videos.length) return;

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncReducedMotion = (prefersReduced) => {
    videos.forEach((video) => {
      if (prefersReduced) {
        video.removeAttribute("autoplay");
        video.pause();
      }
    });
  };
  syncReducedMotion(reducedMotionQuery.matches);
  reducedMotionQuery.addEventListener("change", (event) => syncReducedMotion(event.matches));

  if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) return;

  const userPaused = new WeakSet();
  videos.forEach((video) => {
    video.addEventListener("pause", () => {
      if (video.dataset.autoPaused !== "true") userPaused.add(video);
    });
    video.addEventListener("play", () => {
      userPaused.delete(video);
      delete video.dataset.autoPaused;
    });
  });

  const videoObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (!reducedMotionQuery.matches && !userPaused.has(video) && video.paused) {
            delete video.dataset.autoPaused;
            video.play().catch(() => {});
          }
        } else if (!video.paused) {
          video.dataset.autoPaused = "true";
          video.pause();
        }
      }
    },
    { threshold: 0.15 }
  );

  videos.forEach((video) => videoObserver.observe(video));
}

/* 9. Subtle 3D Pointer Tilt & Specular Spotlight (Fine Pointer Only) */
function init3DTilt() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (prefersReduced || !finePointer) return;

  const targets = Array.from(document.querySelectorAll(".tilt-3d"));
  if (!targets.length) return;

  targets.forEach((el) => {
    let rafId = null;
    let lastEvent = null;
    const maxTilt = el.classList.contains("phone-frame") ? 5.5 : 3;

    const applyTilt = () => {
      rafId = null;
      if (!lastEvent) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const px = Math.min(1, Math.max(0, (lastEvent.clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (lastEvent.clientY - rect.top) / rect.height));
      const rx = (0.5 - py) * 2 * maxTilt;
      const ry = (px - 0.5) * 2 * maxTilt;

      el.style.setProperty("--tilt-x", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    };

    el.addEventListener("pointermove", (event) => {
      lastEvent = event;
      if (rafId === null) rafId = requestAnimationFrame(applyTilt);
    });

    el.addEventListener("pointerleave", () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastEvent = null;
      el.style.removeProperty("--tilt-x");
      el.style.removeProperty("--tilt-y");
    });
  });
}

/* 10. Bidirectional 3D Scroll-Driven Choreography + Fallback */
function initScrollAnimations() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || !("IntersectionObserver" in window)) return;

  const vh = window.innerHeight || document.documentElement.clientHeight;
  const supportsViewTimeline = CSS.supports("(animation-timeline: view()) and (animation-range: entry)");
  const supportsScrollTimeline = CSS.supports("(animation-timeline: scroll()) and (animation-range: 0% 100%)");

  // A. One-shot reveal for FAQ / Support / CTA elements that stay permanently visible while reading
  const revealNodes = Array.from(document.querySelectorAll(".reveal-up"));
  const revealMeasurements = revealNodes.map((el) => ({ el, rect: el.getBoundingClientRect() }));

  const pendingNodes = [];
  revealMeasurements.forEach(({ el, rect }) => {
    if (rect.top < vh * 0.96) {
      el.classList.remove("reveal-pending");
    } else {
      el.classList.add("reveal-pending");
      pendingNodes.push(el);
    }
  });

  const revealElement = (el, delayMs = 0, animate = true) => {
    if (!el.classList.contains("reveal-pending")) return;
    el.classList.remove("reveal-pending");
    if (animate) {
      el.style.setProperty("--reveal-delay", `${delayMs}ms`);
      el.classList.add("is-revealed");
    }
  };

  if (pendingNodes.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        const currentVh = window.innerHeight || document.documentElement.clientHeight;
        const visibleBatch = [];

        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleBatch.push(entry);
          } else if (entry.boundingClientRect.top < currentVh) {
            revealElement(entry.target, 0, false);
            revealObserver.unobserve(entry.target);
          }
        }

        visibleBatch.sort((a, b) => {
          const topDiff = a.boundingClientRect.top - b.boundingClientRect.top;
          return Math.abs(topDiff) > 24 ? topDiff : a.boundingClientRect.left - b.boundingClientRect.left;
        });

        visibleBatch.forEach((entry, idx) => {
          revealElement(entry.target, Math.min(idx, 3) * 65, true);
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -24px 0px" }
    );

    pendingNodes.forEach((el) => revealObserver.observe(el));

    const sweepVisibleAndPassed = () => {
      const currentVh = window.innerHeight || document.documentElement.clientHeight;
      const remaining = pendingNodes.filter((el) => el.classList.contains("reveal-pending"));
      if (!remaining.length) {
        window.removeEventListener("scrollend", sweepVisibleAndPassed);
        return;
      }
      const rects = remaining.map((el) => ({ el, rect: el.getBoundingClientRect() }));
      rects.forEach(({ el, rect }) => {
        if (rect.top < currentVh * 0.98) {
          revealElement(el, 0, rect.bottom > 0);
          revealObserver.unobserve(el);
        }
      });
    };
    window.addEventListener("scrollend", sweepVisibleAndPassed, { passive: true });
  }

  // B. Bidirectional Reveal & 3D Device Pitch/Yaw Fallback when native view() is unsupported
  const stageNodes = Array.from(document.querySelectorAll(".scroll-stage"));
  const bannerNodes = Array.from(document.querySelectorAll(".chapter-banner h2, .chapter-banner p"));

  if (!supportsViewTimeline) {
    document.documentElement.classList.add("scroll-fallback-enabled");

    const stageMeasurements = stageNodes.map((el) => ({ el, rect: el.getBoundingClientRect() }));
    stageMeasurements.forEach(({ el, rect }) => {
      const inView = rect.top < vh * 0.94 && rect.bottom > vh * 0.06;
      el.classList.toggle("stage-visible", inView);
      el.classList.toggle("stage-exit-top", rect.bottom <= vh * 0.06);
    });

    if (stageNodes.length) {
      const stageObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("stage-visible");
              entry.target.classList.remove("stage-exit-top");
            } else {
              entry.target.classList.remove("stage-visible");
              entry.target.classList.toggle("stage-exit-top", entry.boundingClientRect.top < 0);
            }
          }
        },
        { threshold: 0.06, rootMargin: "-4% 0px -6% 0px" }
      );
      stageNodes.forEach((el) => stageObserver.observe(el));
    }

    if (bannerNodes.length) {
      bannerNodes.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.classList.toggle("banner-visible", rect.top < vh * 0.94 && rect.bottom > vh * 0.06);
      });

      const bannerObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            entry.target.classList.toggle("banner-visible", entry.isIntersecting);
          }
        },
        { threshold: 0.12, rootMargin: "-6% 0px -8% 0px" }
      );
      bannerNodes.forEach((el) => bannerObserver.observe(el));
    }
  }

  // Anchor jump safety
  const revealAtAnchor = (hash) => {
    if (!hash || hash === "#") return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    target.querySelectorAll(".reveal-pending").forEach((el) => revealElement(el, 0, false));
    if (target.classList.contains("reveal-pending")) revealElement(target, 0, false);

    if (!supportsViewTimeline) {
      target.querySelectorAll(".scroll-stage").forEach((el) => {
        el.classList.add("stage-visible");
        el.classList.remove("stage-exit-top");
      });
    }

    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const remaining = pendingNodes.filter((el) => el.classList.contains("reveal-pending"));
    remaining
      .map((el) => ({ el, top: el.getBoundingClientRect().top + window.scrollY }))
      .forEach(({ el, top }) => {
        if (top <= targetTop + (window.innerHeight || 900)) revealElement(el, 0, false);
      });
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", () => revealAtAnchor(anchor.getAttribute("href")));
  });
  window.addEventListener("hashchange", () => revealAtAnchor(window.location.hash));

  // C. Fallback for browsers without native scroll() timelines (Hero 3D Fan + Progress Bar)
  if (!supportsScrollTimeline) {
    const hero = document.querySelector(".hero");
    const heroCopy = document.querySelector(".hero-copy");
    const slots = Array.from(document.querySelectorAll(".hero-phone-slot"));
    const progressBar = document.querySelector(".scroll-progress-bar");
    const desktopMq = window.matchMedia("(min-width: 681px)");
    let rafPending = false;

    const updateScrollFallback = () => {
      rafPending = false;
      const scrollY = window.scrollY;

      if (progressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
        progressBar.style.transform = `scaleX(${pct.toFixed(4)})`;
      }

      if (hero && scrollY < hero.offsetHeight + 120) {
        const p = Math.min(1, Math.max(0, (scrollY - 30) / 600));
        if (heroCopy) {
          heroCopy.style.opacity = String(Math.max(0, 1 - p * 1.15).toFixed(3));
          heroCopy.style.transform = `perspective(1200px) translate3d(0px, ${(-48 * p).toFixed(1)}px, ${(-70 * p).toFixed(1)}px) rotateX(${(10 * p).toFixed(1)}deg) scale(${(1 - 0.08 * p).toFixed(3)})`;
        }
        if (desktopMq.matches) {
          slots.forEach((slot) => {
            const isOuter = slot.classList.contains("hero-slot-outer-left") || slot.classList.contains("hero-slot-outer-right");
            const isLeft = slot.classList.contains("hero-slot-outer-left") || slot.classList.contains("hero-slot-inner-left");
            const x = (isOuter ? 54 : 16) * (isLeft ? -1 : 1) * p;
            const y = (isOuter ? -64 : -34) * p;
            const tz = (isOuter ? -110 : -36) * p;
            const ry = (isOuter ? 28 : 12) * (isLeft ? 1 : -1) * p;
            const rx = (isOuter ? 13 : 9) * p;
            const sc = 1 - 0.16 * p;
            slot.style.transform = `perspective(1600px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
            slot.style.opacity = String(Math.max(0.12, 1 - p * 0.88).toFixed(3));
          });
        } else {
          slots.forEach((slot) => {
            slot.style.transform = "";
            slot.style.opacity = "";
          });
        }
      }
    };

    window.addEventListener("scroll", () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateScrollFallback);
      }
    }, { passive: true });
    updateScrollFallback();
  }
}

/* 11. Live GitHub Releases API — Auto-syncs Latest APK & Version Tag */
async function fetchLatestGitHubRelease() {
  const versionEls = document.querySelectorAll("[data-apk-version]");
  const downloadBtns = document.querySelectorAll("[data-apk-download]");
  const noteEl = document.getElementById("release-note-text");

  try {
    const res = await fetch(`https://api.github.com/repos/${SITE_CONFIG.GITHUB_REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!res.ok) return;
    const data = await res.json();
    const tag = data.tag_name || "";
    const apkAsset = Array.isArray(data.assets)
      ? data.assets.find((a) => a.name && a.name.toLowerCase().endsWith(".apk"))
      : null;

    if (tag) {
      versionEls.forEach((el) => { el.textContent = `Latest ${tag}`; });
    }

    if (apkAsset && apkAsset.browser_download_url) {
      downloadBtns.forEach((btn) => { btn.setAttribute("href", apkAsset.browser_download_url); });
      if (noteEl && apkAsset.size) {
        const mb = (apkAsset.size / (1024 * 1024)).toFixed(1);
        noteEl.textContent = `${tag} · ${mb} MB APK · Install directly over your existing OffGrid Music app without losing playlists or stats.`;
      }
    }
  } catch (_) {
    // Silent fallback to GitHub Releases Latest page
  }
}
