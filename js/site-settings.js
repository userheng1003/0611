
(function () {
  const SETTINGS_KEY = "siteSettings_v1";

  const defaultSettings = {
    logoText: "SUN LI-HENG",
    facebookUrl: "https://www.facebook.com/sun.li.heng.512210",
    instagramUrl: "https://www.instagram.com/sun_art1003/",
    email: "sliheng987@gmail.com"
  };

  window.getSiteSettings = function () {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    return Object.assign({}, defaultSettings, saved);
  };

  window.saveSiteSettings = function (settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(Object.assign({}, defaultSettings, settings)));
  };

  window.applySiteSettings = function () {
    const s = window.getSiteSettings();

    document.querySelectorAll(".logo").forEach(el => {
      el.textContent = s.logoText || "SUN LI-HENG";
    });

    document.querySelectorAll("[data-social='facebook']").forEach(el => {
      el.href = s.facebookUrl;
    });

    document.querySelectorAll("[data-social='instagram']").forEach(el => {
      el.href = s.instagramUrl;
    });

    document.querySelectorAll("[data-social='email']").forEach(el => {
      el.href = "mailto:" + s.email;
      if (el.dataset.showEmail === "true") el.textContent = s.email;
    });
  };

  document.addEventListener("DOMContentLoaded", () => { window.applySiteSettings(); setTimeout(window.applySiteSettings, 800); });
})();

// Keep logo/social values consistent even after editor scripts run.
document.addEventListener("DOMContentLoaded", () => {
  let count = 0;
  const timer = setInterval(() => {
    if (typeof window.applySiteSettings === "function") window.applySiteSettings();
    count++;
    if (count > 5) clearInterval(timer);
  }, 600);
});
