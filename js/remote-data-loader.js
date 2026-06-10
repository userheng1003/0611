(function () {
  window.loadRemoteSiteData = async function loadRemoteSiteData() {
    try {
      const res = await fetch("data/site-data.json?t=" + Date.now(), { cache: "no-store" });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data || !data.localStorage) return false;
      Object.entries(data.localStorage).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      });
      return true;
    } catch (err) {
      console.warn("Remote data not loaded", err);
      return false;
    }
  };
})();