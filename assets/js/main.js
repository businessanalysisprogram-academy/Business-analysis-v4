/* ============================================================
   businessanalysis.in — interactions
   ⚙️ CONFIG — swap these two values to go live
   ============================================================ */
const WHATSAPP_NUMBER = "918088434442";           // intl format, no "+"
const CONTACT_EMAIL   = "hello@businessanalysis.in";
// ⚙️ Paste your Google Apps Script web-app URL here to save leads to a Google Sheet.
// Leave "" until deployed — the form still works (WhatsApp/email) without it. See apps-script.gs.
const LEADS_ENDPOINT  = "https://script.google.com/macros/s/AKfycbyG4p-dfOfJP7aT78Rb-8dgTXgQX8CTgp8kCFfFeg7HDLZq0sbTFpYFwRiF6IrLjm5I9g/exec";

(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.prototype.slice.call(c.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const fine   = matchMedia("(pointer:fine)").matches;

  /* ---------- analytics (GA4, safe no-op if gtag absent) ---------- */
  const track = (name, params) => {
    try { if (typeof gtag === "function") gtag("event", name, params || {}); } catch (e) {}
  };

  /* ---------- year ---------- */
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- nav scrolled state (also slides the top ribbon) ---------- */
  const nav = $("#nav");
  const navState = () => {
    const s = scrollY > 24;
    nav.classList.toggle("scrolled", s);
    document.body.classList.toggle("scrolled", s);
  };
  navState();
  addEventListener("scroll", navState, { passive: true });

  /* ---------- gentle parallax on images ---------- */
  const pxEls = $$(".parallax");
  if (pxEls.length && !reduce) {
    let ticking = false;
    const update = () => {
      const vh = innerHeight;
      pxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const off = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-off * 26).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ---------- success-stories carousel (continuous auto-scroll) ---------- */
  const tscroll = $("#tscroll");
  if (tscroll) {
    const step = () => {
      const c = tscroll.querySelector(".tcard");
      return c ? c.getBoundingClientRect().width + 16 : 300;
    };
    const prev = $(".tnav-prev"), next = $(".tnav-next");
    if (prev) prev.addEventListener("click", () => tscroll.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => tscroll.scrollBy({ left: step(), behavior: "smooth" }));
    const pauseBtn = $("#tPause");
    if (!reduce) {
      // duplicate the cards once for a seamless looping scroll
      $$(".tcard", tscroll).forEach((c) => {
        const clone = c.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a,button,input").forEach((el) => { el.tabIndex = -1; });
        tscroll.appendChild(clone);
      });
      let paused = false, userPaused = false;
      ["pointerenter", "pointerdown", "touchstart", "focusin"].forEach((e) =>
        tscroll.addEventListener(e, () => { paused = true; }, { passive: true }));
      tscroll.addEventListener("pointerleave", () => { paused = false; });
      const tick = () => {
        if (!paused && !userPaused && !document.hidden) {
          tscroll.scrollLeft += 2.4;
          const half = tscroll.scrollWidth / 2;
          if (tscroll.scrollLeft >= half) tscroll.scrollLeft -= half;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      if (pauseBtn) pauseBtn.addEventListener("click", () => {
        userPaused = !userPaused;
        pauseBtn.setAttribute("aria-pressed", String(userPaused));
        pauseBtn.setAttribute("aria-label", userPaused ? "Play auto-scrolling stories" : "Pause auto-scrolling stories");
        const t = $(".tp-text", pauseBtn);
        if (t) t.textContent = userPaused ? "Play" : "Pause";
      });
    } else if (pauseBtn) {
      pauseBtn.hidden = true;   // no auto-scroll under reduced motion → no control needed
    }
  }

  /* ---------- hero background: minimal particle network ---------- */
  const heroCanvas = $("#heroCanvas");
  if (heroCanvas && heroCanvas.getContext) {
    const ctx = heroCanvas.getContext("2d");
    const host = heroCanvas.parentElement;
    let w = 0, h = 0, dpr = 1, dots = [], mouse = { x: -999, y: -999 };
    const lowPower = false;   // animate on all devices (density is reduced on small screens; reduced-motion is still honoured below)

    const make = () => {
      const n = Math.max(80, Math.min(190, Math.floor(w / 5.5)));
      dots = [];
      for (let i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.72, vy: (Math.random() - 0.5) * 0.72,
          r: Math.random() * 1.8 + 0.9
        });
      }
    };
    const resize = () => {
      const rect = host.getBoundingClientRect();
      w = rect.width; h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      heroCanvas.width = Math.round(w * dpr);
      heroCanvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      make();
    };
    const LINK = 124, LINK2 = LINK * LINK;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            ctx.strokeStyle = "rgba(196,205,234," + (1 - d2 / LINK2) * 0.38 + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const mdx = a.x - mouse.x, mdy = a.y - mouse.y, md2 = mdx * mdx + mdy * mdy;
        if (md2 < 26000) {
          ctx.strokeStyle = "rgba(205,212,236," + (1 - md2 / 26000) * 0.28 + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      for (const p of dots) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(224,230,248,0.98)";
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
      if (!reduce && !lowPower) rafId = requestAnimationFrame(draw);
    };
    let rafId;
    resize();
    addEventListener("resize", resize, { passive: true });
    host.closest(".hero").addEventListener("pointermove", (e) => {
      const r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    host.closest(".hero").addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
    draw(); // draws once for reduced-motion, animates otherwise
  }

  /* ---------- countdown to applications close ---------- */
  const cd = $("#countdown");
  if (cd) {
    const target = new Date("2026-06-20T23:59:59").getTime();
    const dEl = $("#cd-days"), hEl = $("#cd-hours"), mEl = $("#cd-mins"), sEl = $("#cd-secs");
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      let diff = target - Date.now();
      if (diff < 0) diff = 0;
      dEl.textContent = pad(Math.floor(diff / 86400000));
      hEl.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      mEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
      sEl.textContent = pad(Math.floor((diff % 60000) / 1000));
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- mobile drawer ---------- */
  const drawer = $("#drawer"), burger = $("#burger");
  const setDrawer = (open) => {
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("open")));
  $$(".js-drawer").forEach(a => a.addEventListener("click", () => setDrawer(false)));

  /* ---------- cursor glow + magnetic buttons + dash tilt ---------- */
  if (fine && !reduce) {
    const glow = $("#glow");
    addEventListener("pointermove", (e) => {
      glow.style.opacity = "1";
      glow.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    }, { passive: true });

    $$(".btn-primary").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.16}px,${my * 0.26}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });

    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- ripple on buttons ---------- */
  $$(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (reduce) return;
      const r = document.createElement("span");
      r.className = "ripple";
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size + "px";
      r.style.left = (e.clientX - rect.left - size / 2) + "px";
      r.style.top  = (e.clientY - rect.top  - size / 2) + "px";
      btn.appendChild(r);
      setTimeout(() => r.remove(), 620);
    });
  });

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- animated counters ---------- */
  const counted = new WeakSet();
  const cIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting || counted.has(en.target)) return;
      counted.add(en.target);
      const el = en.target, to = +el.dataset.to, suf = el.dataset.suffix || "";
      if (reduce) { el.textContent = to.toLocaleString("en-IN") + suf; return; }
      const dur = 1400, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased).toLocaleString("en-IN") + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$(".count").forEach((el) => cIO.observe(el));

  /* ---------- marquee seamless loop ---------- */
  const marquee = $("#marquee");
  if (marquee) marquee.innerHTML += marquee.innerHTML;

  /* ---------- AI tools render (first 10, real marks) ---------- */
  const tools = [
    { n: "ChatGPT", s: "Research & analysis", bg: "#10A37F",
      ic: `<path d="M20 8V32M8 20H32M11.5 11.5L28.5 28.5M28.5 11.5L11.5 28.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>` },
    { n: "Claude", s: "Long-doc reasoning", bg: "#D97757",
      ic: `<g stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M20 7V33"/><path d="M9 13.5L31 26.5"/><path d="M9 26.5L31 13.5"/></g>` },
    { n: "Gemini", s: "Multimodal insight", bg: "linear-gradient(135deg,#4285F4,#9B72CB)",
      ic: `<path d="M20 6c1 7.5 5 11.5 12 12-7 .5-11 5-12 12-1-7.5-5-11.5-12-12 7-.5 11-5 12-12z" fill="#fff"/>` },
    { n: "NotebookLM", s: "Source synthesis", bg: "#1A73E8",
      ic: `<path d="M20 7l2.6 8.4L31 18l-8.4 2.6L20 29l-2.6-8.4L9 18l8.4-2.6z" fill="#fff"/>` },
    { n: "Gamma", s: "Instant decks", bg: "linear-gradient(135deg,#7C3AED,#EC4899)",
      ic: `<circle cx="20" cy="20" r="9" fill="none" stroke="#fff" stroke-width="2.6"/><circle cx="20" cy="20" r="3" fill="#fff"/>` },
    { n: "n8n", s: "Workflow automation", bg: "#EA4B71",
      ic: `<path d="M13 20L27 13M13 20L27 27" stroke="#fff" stroke-width="2.4"/><circle cx="13" cy="20" r="3.4" fill="#fff"/><circle cx="27" cy="13" r="3.4" fill="#fff"/><circle cx="27" cy="27" r="3.4" fill="#fff"/>` },
    { n: "Napkin AI", s: "Visual thinking", bg: "#11141F",
      ic: `<path d="M13 9h10l5 5v17H13z" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><path d="M23 9v5h5" fill="none" stroke="#fff" stroke-width="2.2"/>` },
    { n: "ElevenLabs", s: "AI voiceovers", bg: "#0B0B0B",
      ic: `<rect x="14" y="12" width="4" height="16" rx="1.6" fill="#fff"/><rect x="22" y="12" width="4" height="16" rx="1.6" fill="#fff"/>` },
    { n: "InVideo AI", s: "Video creation", bg: "linear-gradient(135deg,#E11D48,#F43F8E)",
      ic: `<path d="M16 13l12 7-12 7z" fill="#fff"/>` },
    { n: "Perplexity", s: "AI research", bg: "#20808D",
      ic: `<path d="M20 10v20M20 14a6 6 0 0 0-6 6 6 6 0 0 0 6 6M20 14a6 6 0 0 1 6 6 6 6 0 0 1-6 6" fill="none" stroke="#fff" stroke-width="2.4"/>` }
  ];
  const grid = $("#toolsGrid");
  if (grid) {
    grid.innerHTML = tools.map((t) =>
      `<div class="tool reveal"><span class="t-ico" style="background:${t.bg}"><svg viewBox="0 0 40 40" fill="none">${t.ic}</svg></span><b>${t.n}</b><small>${t.s}</small></div>`
    ).join("") +
      `<div class="tool tool-more reveal"><span class="t-ico tm">+</span><b>Many more</b><small>Added every cohort</small></div>`;
    $$(".tool.reveal", grid).forEach((el) => io.observe(el));
  }

  /* ============================================================
     LEAD CAPTURE — Google Sheets storage + form states
     ============================================================ */
  const enc = encodeURIComponent;

  // each form → which Sheet tab, the Source label, and its GA4 conversion event
  const FORM_CONFIG = {
    leadForm:    { type: "consultation", source: "Book Free Consultation", event: "consultation_form_submit" },
    contactForm: { type: "consultation", source: "Book Free Consultation", event: "consultation_form_submit" },
    applyForm:   { type: "application",  source: "Apply Now",              event: "application_form_submit" }
  };
  const FIELD_LABELS = { name: "Name", email: "Email", phone: "Phone", background: "Background",
    qualification: "Qualification", status: "Current Status", city: "City" };

  // "Email us instead" fallback link
  const mailLink = (d, subject) => {
    const order = ["name", "email", "phone", "qualification", "status", "city", "background"];
    const lines = order.filter((k) => d[k]).map((k) => `${FIELD_LABELS[k]}: ${d[k]}`);
    const body = `Hi businessanalysis.in,\n\n${subject || "New lead"}\n\n${lines.join("\n")}`;
    return `mailto:${CONTACT_EMAIL}?subject=${enc(subject || "New lead")}&body=${enc(body)}`;
  };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^[+\d][\d\s-]{7,}$/;

  // respects the `required` attribute, so optional fields (e.g. City) may be left empty
  const validate = (form) => {
    let ok = true;
    $$(".field", form).forEach((f) => {
      const inp = $("input,select", f);
      if (!inp) return;
      const empty = !inp.value.trim();
      let bad = inp.required && empty;
      if (inp.value && inp.type === "email" && !emailRe.test(inp.value)) bad = true;
      if (inp.value && inp.type === "tel" && !phoneRe.test(inp.value)) bad = true;
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    return ok;
  };

  // read every named field generically (works for both consultation & application forms)
  const getData = (form) => {
    const d = {};
    $$("input[name],select[name],textarea[name]", form).forEach((inp) => { d[inp.name] = inp.value.trim(); });
    return d;
  };

  // POST to the Apps Script web app and read the JSON result, so we can show real success/error states
  const sendLead = async (payload) => {
    if (!LEADS_ENDPOINT) return { ok: true, skipped: true };   // not deployed yet → don't block the UX
    const res = await fetch(LEADS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // simple request → no CORS preflight
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Save failed");
    return json;
  };

  /* ---- submit-button loading + inline error states ---- */
  const setLoading = (btn, on) => {
    if (!btn) return;
    if (on) {
      btn.dataset.label = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add("is-loading");
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Submitting…</span>';
    } else {
      btn.disabled = false;
      btn.classList.remove("is-loading");
      if (btn.dataset.label != null) { btn.innerHTML = btn.dataset.label; delete btn.dataset.label; }
    }
  };
  const showFormError = (form, msg) => {
    let el = $(".form-error", form);
    if (!el) {
      el = document.createElement("div");
      el.className = "form-error";
      el.setAttribute("role", "alert");
      const body = $(".form-body", form);
      if (body) body.insertBefore(el, body.firstChild);
    }
    el.textContent = "⚠️ " + msg;
    el.hidden = false;
  };
  const clearFormError = (form) => { const el = $(".form-error", form); if (el) el.hidden = true; };

  const handleSubmit = async (form, okEl) => {
    if (!validate(form)) {
      const firstBad = $(".field.invalid input,.field.invalid select", form);
      if (firstBad) firstBad.focus();
      return;
    }
    const cfg = FORM_CONFIG[form.id] || { type: "consultation", source: "Lead", event: "generate_lead" };
    const payload = Object.assign(getData(form), {
      type: cfg.type, source: cfg.source, page: location.href, ts: new Date().toISOString()
    });
    const btn = $("button[type=submit]", form);

    clearFormError(form);
    setLoading(btn, true);
    try {
      await sendLead(payload);                 // store in the Google Sheet
      setLoading(btn, false);
      const body = $(".form-body", form);
      if (body) body.style.display = "none";
      okEl.classList.add("show");              // success state
      track(cfg.event, { source: cfg.source }); // GA4 conversion event
    } catch (err) {
      setLoading(btn, false);
      showFormError(form, "Sorry — we couldn’t submit your details. Please check your connection and try again.");
      track("lead_submit_error", { source: cfg.source, message: String((err && err.message) || err) });
    }
  };

  // clear invalid state on input
  $$("form .field input, form .field select").forEach((inp) => {
    inp.addEventListener("input", () => inp.closest(".field").classList.remove("invalid"));
  });

  const contactForm = $("#contactForm");
  if (contactForm) contactForm.addEventListener("submit", (e) => { e.preventDefault(); handleSubmit(contactForm, $("#contactOk")); });

  const leadForm = $("#leadForm");
  if (leadForm) leadForm.addEventListener("submit", (e) => { e.preventDefault(); handleSubmit(leadForm, $("#leadOk")); });

  const applyForm = $("#applyForm");
  if (applyForm) applyForm.addEventListener("submit", (e) => { e.preventDefault(); handleSubmit(applyForm, $("#applyOk")); });

  // mail fallback links — prefill mailto if the form is valid
  $$(".js-mail").forEach((a) => {
    a.addEventListener("click", (e) => {
      const form = a.closest("form");
      if (!validate(form)) { e.preventDefault(); return; }
      const cfg = FORM_CONFIG[form.id] || {};
      a.setAttribute("href", mailLink(getData(form), cfg.source || "New lead"));
    });
  });

  /* ============================================================
     MODALS (lead + exit) with focus trap
     ============================================================ */
  let lastFocus = null;
  const openOverlay = (ov) => {
    lastFocus = document.activeElement;
    ov.hidden = false;
    void ov.offsetWidth;               // force reflow so the open transition reliably plays
    ov.classList.add("open");
    document.body.style.overflow = "hidden";
    const f = ov.querySelector("input,select,textarea") || ov.querySelector("button");
    if (f) setTimeout(() => f.focus(), 80);
    document.addEventListener("keydown", onKey);
  };
  const closeOverlay = (ov) => {
    ov.classList.remove("open");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => { ov.hidden = true; }, 320);
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  const onKey = (e) => {
    const ov = $(".overlay.open");
    if (!ov) return;
    if (e.key === "Escape") { closeOverlay(ov); return; }
    if (e.key !== "Tab") return;
    const f = $$('a[href],button,input,select,textarea', ov).filter(el => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const leadOv = $("#leadOverlay"), exitOv = $("#exitOverlay"), applyOv = $("#applyOverlay");

  // Book Free Consultation → consultation form (Sheet tab: Consultations)
  $$(".js-consult").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    setDrawer(false);
    if (exitOv && exitOv.classList.contains("open")) closeOverlay(exitOv);
    openOverlay(leadOv);
    track("consult_open", { cta: b.textContent.trim().slice(0, 40) });
  }));

  // Apply Now / Enroll Now → application form (Sheet tab: Applications)
  $$(".js-apply").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    setDrawer(false);
    if (exitOv && exitOv.classList.contains("open")) closeOverlay(exitOv);
    openOverlay(applyOv);
    track("apply_open", { cta: b.textContent.trim().slice(0, 40) });
  }));

  $$("[data-close]").forEach((b) => b.addEventListener("click", () => {
    const ov = b.closest(".overlay");
    if (ov) closeOverlay(ov);
  }));
  [leadOv, exitOv, applyOv].forEach((ov) => {
    if (!ov) return;
    ov.addEventListener("click", (e) => { if (e.target === ov) closeOverlay(ov); });
  });

  /* ---------- sticky CTA — appears after scrolling (~3rd section) ---------- */
  const sticky = $("#stickyCta");
  if (sticky) {
    const toggleSticky = () => sticky.classList.toggle("show", scrollY > innerHeight * 1.5);
    toggleSticky();
    addEventListener("scroll", toggleSticky, { passive: true });
  }

  /* ---------- exit intent — once per session ---------- */
  const showExit = (trigger) => {
    if (!exitOv || sessionStorage.getItem("baExit") || $(".overlay.open")) return;
    sessionStorage.setItem("baExit", "1");
    openOverlay(exitOv);
    track("exit_intent_shown", { trigger });
  };

  // Desktop: cursor leaves the top of the viewport
  if (fine && exitOv) {
    document.addEventListener("mouseout", (e) => {
      if (e.clientY <= 0) showExit("desktop");
    });
  }

  // Mobile/touch: no mouseout — trigger when the user scrolls back toward the
  // top after engaging (a "leaving" signal), with a time fallback.
  if (!fine && exitOv) {
    let armed = false;
    addEventListener("scroll", () => {
      if (scrollY > 800) armed = true;
      else if (armed && scrollY < 200) showExit("mobile-scrollup");
    }, { passive: true });
  }

  // Primary trigger (all devices): show the offer shortly after open, once per session.
  if (exitOv) setTimeout(() => showExit("auto-6s"), 6000);
})();
