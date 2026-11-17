(() => {
  const PASSWORD = "3dspace";
  const STORAGE_KEY = "viceos_emea_cleared";

  const gate = document.getElementById("gate");
  const invite = document.getElementById("invite");
  const form = document.getElementById("gate-form");
  const input = document.getElementById("access-code");
  const status = document.getElementById("gate-status");
  const overlay = document.getElementById("unlock-overlay");

  const cfg = window.PARTY || {};

  function hydrateInvite() {
    const title = document.querySelector(".hero__title");
    const sub = document.querySelector(".hero__sub");
    const tag = document.querySelector(".hero__tagline");

    if (title) {
      title.textContent = cfg.title || "GTA VI";
      title.setAttribute("data-text", cfg.title || "GTA VI");
    }
    if (sub) sub.textContent = cfg.subtitle || "PS5 GAMEPLAY";
    if (tag) tag.textContent = cfg.tagline || "Saturday. Just show up.";

    const when = document.getElementById("brief-when");
    const where = document.getElementById("brief-where");
    const host = document.getElementById("brief-host");
    const what = document.getElementById("brief-what");

    if (when) {
      when.textContent = [cfg.dateLabel, cfg.timeLabel].filter(Boolean).join(" · ");
    }
    if (where) {
      const label = cfg.placeLabel || "TBA";
      if (cfg.mapsUrl) {
        where.innerHTML = `<a class="meta__link" href="${escapeHtml(cfg.mapsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
      } else {
        where.textContent = label;
      }
    }
    if (host) host.textContent = cfg.host || "Host";
    if (what) what.textContent = cfg.what || "";

    const list = document.getElementById("loadout-list");
    if (list && Array.isArray(cfg.loadout)) {
      list.innerHTML = cfg.loadout.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }

    const rsvpLink = document.getElementById("rsvp-link");
    if (rsvpLink && cfg.rsvpWhatsApp) {
      const msg = encodeURIComponent(cfg.rsvpMessage || "I'm in!");
      rsvpLink.href = `https://wa.me/${cfg.rsvpWhatsApp.replace(/\D/g, "")}?text=${msg}`;
      rsvpLink.hidden = false;
    }

    startCountdown(cfg.startISO);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showInvite({ animate }) {
    gate.hidden = true;
    invite.hidden = false;
    document.title = `${cfg.title || "GTA VI"} · PS5 Party`;
    hydrateInvite();

    if (!animate) {
      invite.style.animation = "none";
    }
  }

  async function unlock() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    status.textContent = "";
    gate.classList.add("is-unlocking");
    overlay.hidden = false;

    await wait(1200);

    overlay.hidden = true;
    gate.classList.remove("is-unlocking");
    showInvite({ animate: true });
  }

  function deny() {
    status.textContent = "ACCESS DENIED";
    gate.classList.remove("is-denied");
    // reflow to restart shake
    void gate.offsetWidth;
    gate.classList.add("is-denied");
    input.select();

    setTimeout(() => gate.classList.remove("is-denied"), 500);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function startCountdown(iso) {
    const root = document.getElementById("countdown");
    if (!root || !iso) return;

    const target = new Date(iso).getTime();
    if (Number.isNaN(target)) return;

    const daysEl = root.querySelector('[data-unit="days"]');
    const hoursEl = root.querySelector('[data-unit="hours"]');
    const minsEl = root.querySelector('[data-unit="mins"]');
    const secsEl = root.querySelector('[data-unit="secs"]');

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      daysEl.textContent = String(days).padStart(2, "0");
      hoursEl.textContent = String(hours).padStart(2, "0");
      minsEl.textContent = String(mins).padStart(2, "0");
      secsEl.textContent = String(secs).padStart(2, "0");
    };

    tick();
    setInterval(tick, 1000);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = (input.value || "").trim().toLowerCase();
    if (value === PASSWORD) {
      unlock();
    } else {
      deny();
    }
  });

  document.getElementById("rsvp-copy")?.addEventListener("click", async () => {
    const text = cfg.rsvpMessage || "I'm in for the GTA VI PS5 party this Saturday!";
    const toast = document.getElementById("rsvp-toast");
    try {
      await navigator.clipboard.writeText(text);
      if (toast) toast.textContent = "COPIED — PASTE IN THE GROUP CHAT";
    } catch {
      if (toast) toast.textContent = text;
    }
  });

  function startPosterCycle() {
    const posters = [...document.querySelectorAll(".hero__poster")];
    if (posters.length < 2) return;

    let index = posters.findIndex((el) => el.classList.contains("is-on"));
    if (index < 0) index = 0;

    setInterval(() => {
      posters[index].classList.remove("is-on");
      index = (index + 1) % posters.length;
      posters[index].classList.add("is-on");
    }, 4500);
  }

  // Boot
  if (sessionStorage.getItem(STORAGE_KEY) === "1") {
    showInvite({ animate: false });
  } else {
    // Autofocus without scrolling weirdly on iOS
    requestAnimationFrame(() => input?.focus({ preventScroll: true }));
  }

  startPosterCycle();
})();
