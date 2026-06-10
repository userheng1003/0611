(function () {
  const DATA_PATH = "data/site-data.json";
  const STORAGE_KEYS = ["works_v2", "siteSettings_v1", "pageEdits_v8_stable"];

  function $(id) { return document.getElementById(id); }

  function readLocalData() {
    const data = {};
    STORAGE_KEYS.forEach(key => data[key] = localStorage.getItem(key));
    return { version: 1, updatedAt: new Date().toISOString(), localStorage: data };
  }

  function b64EncodeUnicode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function b64DecodeUnicode(str) {
    return decodeURIComponent(escape(atob(str)));
  }

  function saveConfig() {
    const cfg = {
      repo: $("ghRepo") ? $("ghRepo").value.trim() : "",
      branch: $("ghBranch") ? $("ghBranch").value.trim() : "main",
      token: $("ghToken") ? $("ghToken").value.trim() : ""
    };
    localStorage.setItem("githubSyncConfig_v1", JSON.stringify(cfg));
  }

  function loadConfig() {
    try {
      const cfg = JSON.parse(localStorage.getItem("githubSyncConfig_v1") || "{}");
      if ($("ghRepo")) $("ghRepo").value = cfg.repo || "";
      if ($("ghBranch")) $("ghBranch").value = cfg.branch || "main";
      if ($("ghToken")) $("ghToken").value = cfg.token || "";
    } catch {}
  }

  async function githubFetch(url, options = {}) {
    const token = $("ghToken").value.trim();
    if (!token) throw new Error("請先輸入 GitHub fine-grained token。");

    const res = await fetch(url, {
      ...options,
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.headers || {})
      }
    });

    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    if (!res.ok) throw new Error(data.message || "GitHub API error");
    return data;
  }

  async function pullFromGitHub() {
    saveConfig();
    const repo = $("ghRepo").value.trim();
    const branch = $("ghBranch").value.trim() || "main";
    if (!repo) throw new Error("請輸入 Repo，例如 userheng1003/TEST。");

    const url = `https://api.github.com/repos/${repo}/contents/${DATA_PATH}?ref=${encodeURIComponent(branch)}`;
    const file = await githubFetch(url);
    const jsonText = b64DecodeUnicode((file.content || "").replace(/\n/g, ""));
    const data = JSON.parse(jsonText);

    Object.entries(data.localStorage || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    });

    $("ghStatus").textContent = "已從 GitHub 讀取並套用資料，請重新整理頁面。";
  }

  async function pushToGitHub() {
    saveConfig();
    const repo = $("ghRepo").value.trim();
    const branch = $("ghBranch").value.trim() || "main";
    if (!repo) throw new Error("請輸入 Repo，例如 userheng1003/TEST。");

    const content = JSON.stringify(readLocalData(), null, 2);
    const url = `https://api.github.com/repos/${repo}/contents/${DATA_PATH}`;

    let sha = null;
    try {
      const current = await githubFetch(url + `?ref=${encodeURIComponent(branch)}`);
      sha = current.sha;
    } catch (err) {
      if (!String(err.message).includes("Not Found")) throw err;
    }

    const payload = {
      message: "Sync website edits from browser editor",
      content: b64EncodeUnicode(content),
      branch
    };
    if (sha) payload.sha = sha;

    await githubFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    $("ghStatus").textContent = "已推送到 GitHub。等 Pages 部署完成後，其他電腦也會看到更新。";
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(readLocalData(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!$("githubSyncPanel")) return;
    loadConfig();

    $("ghSaveConfig").addEventListener("click", () => {
      saveConfig();
      $("ghStatus").textContent = "設定已儲存在這台瀏覽器。";
    });

    $("ghPull").addEventListener("click", async () => {
      $("ghStatus").textContent = "讀取中...";
      try { await pullFromGitHub(); }
      catch (err) { $("ghStatus").textContent = "讀取失敗：" + err.message; }
    });

    $("ghPush").addEventListener("click", async () => {
      $("ghStatus").textContent = "推送中...";
      try { await pushToGitHub(); }
      catch (err) { $("ghStatus").textContent = "推送失敗：" + err.message; }
    });

    $("ghExport").addEventListener("click", exportJSON);
  });
})();