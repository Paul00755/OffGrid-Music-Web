/**
 * OffGrid Music — Interactive Showcase Controller
 * Handles Dark/Light theme, Category-Filtered UI Studio, 14-Question FAQ,
 * Support Email Copy, GSAP ScrollTrigger animations, and live GitHub Releases APK sync.
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

/* 3. Sticky Nav & Mobile Drawer */
function initNavbar() {
  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");
  const drawer = document.getElementById("mobile-drawer");

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        drawer.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
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

  let activeCat = "nowplaying";

  function activateLayout(id) {
    const targetStep = steps.find((s) => s.dataset.layout === id);
    if (!targetStep) return;

    steps.forEach((s) => s.classList.toggle("active", s.dataset.layout === id));
    slides.forEach((img) => img.classList.toggle("active", img.dataset.layout === id));

    if (capCat) capCat.textContent = targetStep.dataset.category || "";
    if (capName) capName.textContent = targetStep.dataset.title || "";
  }

  function selectCategory(catKey) {
    activeCat = catKey;

    // Update top category tabs
    catBtns.forEach((btn) => {
      const isActive = btn.dataset.cat === catKey;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
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

  // Click any visible step card to preview immediately
  steps.forEach((step) => {
    step.addEventListener("click", () => {
      activateLayout(step.dataset.layout);
    });
  });

  // Category filter buttons
  catBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectCategory(btn.dataset.cat);
    });
  });

  if (nextCatBtn) {
    nextCatBtn.addEventListener("click", () => {
      const nextKey = nextCatBtn.dataset.nextCat || "home";
      selectCategory(nextKey);
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
      btn.classList.toggle("active", btn.dataset.faqFilter === cat);
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyFilter(btn.dataset.faqFilter);
    });
  });

  if (expandBtn) {
    expandBtn.addEventListener("click", () => {
      allExpanded = !allExpanded;
      items.forEach((item) => {
        if (!item.classList.contains("hidden-faq")) {
          item.open = allExpanded;
        }
      });
      expandBtn.textContent = allExpanded ? "Collapse all" : "Expand all";
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

/* 7. GSAP ScrollTrigger Animations */
function initScrollAnimations() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    return;
  }

  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  const mm = gsap.matchMedia();

  gsap.from(".hero-animate", {
    y: 26,
    opacity: 0,
    duration: 0.8,
    stagger: 0.09,
    ease: "power3.out"
  });

  mm.add("(min-width: 821px)", () => {
    gsap.to(".hero-phone-left", {
      y: -34,
      rotation: -8,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
    });
    gsap.to(".hero-phone-right", {
      y: -34,
      rotation: 8,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
    });
    gsap.to(".hero-phone-main", {
      y: -16,
      scale: 1.03,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
    });
  });

  gsap.utils.toArray(".reveal-up").forEach((el) => {
    gsap.from(el, {
      y: 34,
      opacity: 0,
      duration: 0.72,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  gsap.utils.toArray(".chapter-banner h2").forEach((heading) => {
    gsap.fromTo(
      heading,
      { scale: 0.9, opacity: 0.35 },
      {
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: heading, start: "top 86%", end: "center 46%", scrub: 0.8 }
      }
    );
  });
}

/* 8. Live GitHub Releases API — Auto-syncs Latest APK & Version Tag */
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
