/**
 * OffGrid Music — Interactive Showcase Controller
 * Handles Dark/Light theme, Category-Filtered UI Studio, 14-Question FAQ,
 * Support Email Copy, Viewport-aware Video Playback, Native Scroll-Driven /
 * IntersectionObserver Reveal System, and live GitHub Releases APK sync.
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
  initUIStudio();
  initFAQ();
  initCopyEmail();
  initVideoPlayback();
  initScrollAnimations();
  fetchLatestGitHubRelease();
});

/* 1. Dark / Light Mode Toggle (persists in localStorage) */
function initThemeToggle() {
  const root = document.documentElement;
  const saved = localStorage.getItem("offgrid-theme");
  const initialTheme = saved === "light" || saved === "dark" ? saved : "dark";
  root.setAttribute("data-theme", initialTheme);

  const toggleBtns = document.querySelectorAll("[data-theme-toggle]");
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
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

  // Highlight active section in top nav
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

/* 4. Interactive Category-Filtered UI Studio (shows ONLY 4 / 4 / 3 / 4 options for selected tab) */
function initUIStudio() {
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
    // Update top category tabs
    catBtns.forEach((btn) => {
      const isActive = btn.dataset.cat === catKey;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
      if (isActive && scrollTabIntoView) {
        btn.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    });

    // Show ONLY the 3 or 4 cards belonging to this category
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

    // Activate the first layout of the selected category
    if (matchingSteps.length) {
      activateLayout(matchingSteps[0].dataset.layout);
    }
  }

  // Click or keyboard activate any visible step card to preview immediately
  steps.forEach((step) => {
    step.setAttribute("tabindex", "0");
    step.setAttribute("role", "button");
    step.addEventListener("click", () => {
      activateLayout(step.dataset.layout);
    });
    step.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateLayout(step.dataset.layout);
      }
    });
  });

  // Category filter buttons
  catBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectCategory(btn.dataset.cat, true);
    });
  });

  bindTablistKeyboard(catBtns, (tab) => {
    selectCategory(tab.dataset.cat, true);
  });

  if (nextCatBtn) {
    nextCatBtn.addEventListener("click", () => {
      const nextKey = nextCatBtn.dataset.nextCat || "home";
      selectCategory(nextKey, true);
    });
  }

  // Default to Now Playing (4 options)
  selectCategory("nowplaying");
}

/* 5. Categorized 14-Question FAQ + Expand/Collapse All */
function initFAQ() {
  const filterBtns = Array.from(document.querySelectorAll(".faq-filter-btn"));
  const items = Array.from(document.querySelectorAll(".faq-item"));
  const countEl = document.getElementById("faq-count");
  const expandBtn = document.getElementById("faq-expand-all");

  if (!items.length) return;

  let allExpanded = false;

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
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyFilter(btn.dataset.faqFilter);
    });
  });

  bindTablistKeyboard(filterBtns, (tab) => {
    applyFilter(tab.dataset.faqFilter);
  });

  if (expandBtn) {
    expandBtn.setAttribute("aria-expanded", "false");
    expandBtn.addEventListener("click", () => {
      allExpanded = !allExpanded;
      items.forEach((item) => {
        if (!item.classList.contains("hidden-faq")) {
          item.open = allExpanded;
        }
      });
      expandBtn.textContent = allExpanded ? "Collapse all" : "Expand all";
      expandBtn.setAttribute("aria-expanded", String(allExpanded));
    });
  }

  applyFilter("all");
}

/* 6. Copy Support Email Button */
function initCopyEmail() {
  const copyBtn = document.getElementById("copy-email-btn");
  if (!copyBtn) return;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(SITE_CONFIG.SUPPORT_EMAIL);
      const original = copyBtn.textContent;
      copyBtn.textContent = "✓ Copied!";
      setTimeout(() => {
        copyBtn.textContent = original;
      }, 2000);
    } catch (_) {
      window.location.href = `mailto:${SITE_CONFIG.SUPPORT_EMAIL}`;
    }
  });
}

/* 7. Viewport-Aware Video Playback & Reduced Motion Handling */
function initVideoPlayback() {
  const videos = Array.from(document.querySelectorAll(".widget-video-wrap video"));
  if (!videos.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    videos.forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause();
    });
    return;
  }

  if (!("IntersectionObserver" in window)) return;

  const userPaused = new WeakSet();
  videos.forEach((video) => {
    video.addEventListener("pause", () => {
      if (video.dataset.autoPaused !== "true") {
        userPaused.add(video);
      }
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
          if (!userPaused.has(video) && video.paused) {
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

/* 8. Compositor-First Scroll Animations & IntersectionObserver Reveal System */
function initScrollAnimations() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || !("IntersectionObserver" in window)) {
    return;
  }

  const revealNodes = Array.from(document.querySelectorAll(".reveal-up"));
  const vh = window.innerHeight || document.documentElement.clientHeight;

  // Batch DOM reads first to prevent layout thrashing
  const measurements = revealNodes.map((el) => ({
    el,
    rect: el.getBoundingClientRect()
  }));

  const pendingNodes = [];
  measurements.forEach(({ el, rect }) => {
    // Anything already inside or scrolled above the viewport stays immediately visible
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
            // Element was scrolled past rapidly (e.g. anchor jump / scrollbar drag)
            revealElement(entry.target, 0, false);
            revealObserver.unobserve(entry.target);
          }
        }

        // Order left-to-right / top-to-bottom within a single viewport reveal batch
        visibleBatch.sort((a, b) => {
          const topDiff = a.boundingClientRect.top - b.boundingClientRect.top;
          if (Math.abs(topDiff) > 24) return topDiff;
          return a.boundingClientRect.left - b.boundingClientRect.left;
        });

        visibleBatch.forEach((entry, idx) => {
          const staggerMs = Math.min(idx, 3) * 70;
          revealElement(entry.target, staggerMs, true);
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -32px 0px" }
    );

    pendingNodes.forEach((el) => revealObserver.observe(el));

    // Ensure anchor jumps (#audio-engine, #insights, #faq) reveal target & preceding sections cleanly
    const revealAtAnchor = (hash) => {
      if (!hash || hash === "#") return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      // Immediately reveal everything inside the target section itself (e.g. stacked mobile cards)
      target.querySelectorAll(".reveal-pending").forEach((el) => {
        revealElement(el, 0, false);
        revealObserver.unobserve(el);
      });
      if (target.classList.contains("reveal-pending")) {
        revealElement(target, 0, false);
        revealObserver.unobserve(target);
      }

      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      const remaining = pendingNodes.filter((el) => el.classList.contains("reveal-pending"));
      const positions = remaining.map((el) => ({
        el,
        top: el.getBoundingClientRect().top + window.scrollY
      }));
      positions.forEach(({ el, top }) => {
        if (top <= targetTop + (window.innerHeight || 900)) {
          revealElement(el, 0, false);
          revealObserver.unobserve(el);
        }
      });
    };

    // Safety sweep after smooth scrolling / scrollbar drags finish
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

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", () => {
        revealAtAnchor(anchor.getAttribute("href"));
      });
    });

    window.addEventListener("hashchange", () => {
      revealAtAnchor(window.location.hash);
    });
  }

  // Fallback for browsers without native CSS Scroll-Driven View Timelines
  const supportsViewTimeline = CSS.supports("(animation-timeline: view()) and (animation-range: entry)");
  if (!supportsViewTimeline) {
    const bannerTargets = Array.from(document.querySelectorAll(".chapter-banner h2, .chapter-banner p"));
    const bannerRects = bannerTargets.map((el) => ({ el, top: el.getBoundingClientRect().top }));
    const pendingBanners = [];

    bannerRects.forEach(({ el, top }) => {
      if (top >= vh * 0.96) {
        el.classList.add("banner-pending");
        pendingBanners.push(el);
      }
    });

    if (pendingBanners.length) {
      const bannerObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting || entry.boundingClientRect.top < (window.innerHeight || vh)) {
              entry.target.classList.remove("banner-pending");
              entry.target.classList.add("banner-visible");
              bannerObserver.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.1 }
      );
      pendingBanners.forEach((el) => bannerObserver.observe(el));
    }
  }

  // Fallback for browsers without native CSS Scroll-Driven Hero Parallax
  const supportsScrollTimeline = CSS.supports("(animation-timeline: scroll()) and (animation-range: 0% 100%)");
  if (!supportsScrollTimeline) {
    const hero = document.querySelector(".hero");
    const phones = Array.from(document.querySelectorAll(".hero-phone"));
    const desktopMq = window.matchMedia("(min-width: 761px)");
    if (hero && phones.length) {
      let rafPending = false;
      let isHeroVisible = true;

      const updateParallax = () => {
        rafPending = false;
        if (!desktopMq.matches) {
          phones.forEach((p) => { p.style.translate = ""; });
          return;
        }
        const progress = Math.min(1, Math.max(0, window.scrollY / 640));
        phones.forEach((phone) => {
          const isOuter = phone.classList.contains("hero-phone-outer-left") || phone.classList.contains("hero-phone-outer-right");
          const restY = isOuter ? 24 : 0;
          const endY = isOuter ? -18 : -8;
          const currentY = restY + (endY - restY) * progress;
          phone.style.translate = `0px ${currentY.toFixed(1)}px`;
        });
      };

      const onHeroScroll = () => {
        if (!isHeroVisible || rafPending) return;
        rafPending = true;
        requestAnimationFrame(updateParallax);
      };

      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible) {
              window.addEventListener("scroll", onHeroScroll, { passive: true });
              updateParallax();
            } else {
              window.removeEventListener("scroll", onHeroScroll);
            }
          });
        },
        { threshold: 0 }
      );

      heroObserver.observe(hero);
    }
  }
}

/* 9. Live GitHub Releases API — Auto-syncs Latest APK & Version Tag */
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
