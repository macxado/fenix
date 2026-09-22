(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------------- Splash / loading screen ---------------- */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    document.body.style.overflow = "hidden";
    var done = false;
    var hide = function () {
      if (done) return;
      done = true;
      splash.classList.add("is-out");
      document.body.style.overflow = "";
      setTimeout(function () {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
      }, 750);
    };
    var minDelay = reduced ? 700 : 2100;
    setTimeout(hide, minDelay);
    setTimeout(hide, 4000);
  }

  /* ---------------- Nav scroll state + mobile menu ---------------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $("[data-nav-toggle]");
    var menu = $("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });
      $$("a", menu).forEach(function (a) {
        a.addEventListener("click", function () {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ---------------- Smooth-scroll anchors (native) ---------------- */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 84;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.02, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ---------------- Hero embers (subtle, capped, gated by reduced-motion) ---------------- */
  function initEmbers() {
    var host = $("[data-embers]");
    if (!host || reduced) return;
    var COUNT = window.innerWidth < 720 ? 10 : 18;
    for (var i = 0; i < COUNT; i++) {
      var e = document.createElement("span");
      e.className = "ember";
      var left = Math.random() * 100;
      var delay = Math.random() * 8;
      var duration = 6 + Math.random() * 5;
      var drift = (Math.random() * 60 - 30).toFixed(0) + "px";
      e.style.left = left + "%";
      e.style.animationDelay = delay + "s";
      e.style.animationDuration = duration + "s";
      e.style.setProperty("--drift", drift);
      host.appendChild(e);
    }
  }

  /* ---------------- Main gallery carousel ---------------- */
  function initCarousel() {
    var root = $("[data-carousel]");
    if (!root) return;
    var track = $("[data-carousel-track]", root);
    var slides = $$(".carousel-slide", track);
    var dotsHost = $("[data-carousel-dots]", root);
    var prev = $("[data-carousel-prev]", root);
    var next = $("[data-carousel-next]", root);
    if (!track || !slides.length) return;

    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Aller à la photo " + (i + 1));
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", function () { scrollToSlide(i); });
      dotsHost.appendChild(b);
    });
    var dots = $$("button", dotsHost);

    function scrollToSlide(i) {
      var s = slides[i];
      if (!s) return;
      track.scrollTo({ left: s.offsetLeft, behavior: reduced ? "auto" : "smooth" });
    }
    function currentIndex() {
      var scrollLeft = track.scrollLeft;
      var closest = 0, min = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft - scrollLeft);
        if (d < min) { min = d; closest = i; }
      });
      return closest;
    }
    function updateDots() {
      var idx = currentIndex();
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
    }
    var raf = null;
    track.addEventListener("scroll", function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateDots);
    }, { passive: true });

    if (prev) prev.addEventListener("click", function () { scrollToSlide(Math.max(0, currentIndex() - 1)); });
    if (next) next.addEventListener("click", function () { scrollToSlide(Math.min(slides.length - 1, currentIndex() + 1)); });

    slides.forEach(function (s) {
      var imgs = $$("img", s);
      imgs.forEach(function (img) {
        img.addEventListener("click", function (e) {
          e.stopPropagation();
          openLightbox(img.src, img.alt);
        });
      });
    });
  }

  /* ---------------- Masonry lightbox ---------------- */
  function openLightbox(src, alt) {
    var lb = $("[data-lightbox]");
    if (!lb) return;
    var img = $("[data-lightbox-img]", lb);
    img.src = src;
    img.alt = alt || "";
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    var lb = $("[data-lightbox]");
    if (!lb) return;
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function initLightbox() {
    var lb = $("[data-lightbox]");
    if (!lb) return;
    var closeBtn = $("[data-lightbox-close]", lb);
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });

    $$(".masonry-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var img = $("img", item);
        if (img) openLightbox(img.src, img.alt);
      });
    });
  }

  /* ---------------- Contact form (front-end only) ---------------- */
  function initContactForm() {
    var form = $("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var success = $("[data-form-success]");
      if (success) success.classList.add("is-visible");
      form.reset();
    });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals, "initReveals");
    safe(initEmbers, "initEmbers");
    safe(initCarousel, "initCarousel");
    safe(initLightbox, "initLightbox");
    safe(initContactForm, "initContactForm");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
