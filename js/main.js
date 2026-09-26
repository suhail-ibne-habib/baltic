/* Baltic Control (BD) Ltd. — main.js */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-compact", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav-item[data-menu]"));

  function closeAll(except) {
    navItems.forEach(function (item) {
      if (item !== except) {
        item.classList.remove("is-open");
        var btn = item.querySelector(".nav-toplink");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  navItems.forEach(function (item) {
    var btn = item.querySelector(".nav-toplink");
    var panel = item.querySelector(".dropdown, .mega");
    if (!btn || !panel) return;

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = item.classList.contains("is-open");
      closeAll(item);
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });

    item.addEventListener("mouseenter", function () {
      closeAll(item);
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    });
    item.addEventListener("mouseleave", function () {
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    });

    item.addEventListener("keydown", function (e) {
      var links = Array.prototype.slice.call(panel.querySelectorAll("a"));
      var idx = links.indexOf(document.activeElement);
      if (e.key === "Escape") {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      } else if (e.key === "ArrowDown" && links.length) {
        e.preventDefault();
        links[Math.min(idx + 1, links.length - 1)].focus();
      } else if (e.key === "ArrowUp" && links.length) {
        e.preventDefault();
        if (idx <= 0) {
          btn.focus();
        } else {
          links[idx - 1].focus();
        }
      }
    });
  });

  document.addEventListener("click", function () {
    closeAll(null);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll(null);
  });

  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var closeBtn = document.querySelector(".mobile-nav__close");
  var lastFocused = null;

  function openMobile() {
    lastFocused = document.activeElement;
    mobileNav.classList.add("is-open");
    document.body.classList.add("nav-locked");
    toggle.setAttribute("aria-expanded", "true");
    if (closeBtn) closeBtn.focus();
  }
  function closeMobile() {
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("nav-locked");
    toggle.setAttribute("aria-expanded", "false");
    if (lastFocused) lastFocused.focus();
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", openMobile);
    if (closeBtn) closeBtn.addEventListener("click", closeMobile);
    mobileNav.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobile();
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll(".acc-btn"), function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.classList.toggle("is-open", !expanded);
    });
  });

  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  var statEls = document.querySelectorAll("[data-count]");

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (prefersReduced || !target) {
      el.textContent = target + suffix;
      return;
    }
    var start = null;
    var dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            Array.prototype.forEach.call(entry.target.querySelectorAll("[data-count]"), function (el) {
              if (!el.dataset.counted) {
                el.dataset.counted = "1";
                countUp(el);
              }
            });
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    Array.prototype.forEach.call(revealEls, function (el) {
      io.observe(el);
    });
    Array.prototype.forEach.call(statEls, function (el) {
      var wrap = el.closest(".reveal, .reveal-stagger");
      if (!wrap) io.observe(el.parentElement || el);
    });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) {
      el.classList.add("is-visible");
    });
    Array.prototype.forEach.call(statEls, function (el) {
      countUp(el);
    });
  }

  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".form-status");

    function setInvalid(field, invalid) {
      field.closest(".field").classList.toggle("is-invalid", invalid);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (input) {
        var bad = !input.value.trim();
        if (input.type === "email" && !bad) {
          bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        }
        setInvalid(input, bad);
        if (bad) valid = false;
      });

      if (!valid) return;

      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var phone = (form.querySelector('[name="phone"]') || {}).value || "";
      var service = (form.querySelector('[name="service"]') || {}).value || "";
      var message = form.querySelector('[name="message"]').value.trim();
      var subject = encodeURIComponent("Inspection request — " + (service || "Baltic Control BD"));
      var body = encodeURIComponent(
        "Name: " + name + "\nEmail: " + email + "\nPhone: " + phone + "\nService: " + service + "\n\n" + message
      );
      window.location.href = "mailto:ric.bd@live.com?subject=" + subject + "&body=" + body;
      status.textContent = "Your email app should open with the request. If it does not, write to ric.bd@live.com.";
      status.className = "form-status is-success";
    });

    Array.prototype.forEach.call(form.querySelectorAll("input, textarea, select"), function (input) {
      input.addEventListener("input", function () {
        setInvalid(input, false);
      });
    });
  }
})();
