
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn_v6") !== "true") {
    alert("請先登入");
    location.href = "login.html";
    return;
  }

  if (typeof seedIfEmpty === "function") seedIfEmpty();

  document.querySelectorAll(".admin-menu button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-menu button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".admin-panel").forEach(p => p.style.display = "none");
      document.getElementById(btn.dataset.panel).style.display = "block";
    });
  });

  const saveIntroVideoBtn = document.getElementById("saveIntroVideoBtn");
  const clearIntroVideoBtn = document.getElementById("clearIntroVideoBtn");
  const introVideoUpload = document.getElementById("introVideoUpload");

  if (saveIntroVideoBtn) {
    saveIntroVideoBtn.addEventListener("click", () => {
      const file = introVideoUpload.files[0];

      if (!file) {
        alert("請先選擇影片");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem("introVideo_v5", reader.result);
        alert("開場影片已暫存。請開 splash.html 測試。");
      };
      reader.readAsDataURL(file);
    });
  }

  if (clearIntroVideoBtn) {
    clearIntroVideoBtn.addEventListener("click", () => {
      localStorage.removeItem("introVideo_v5");
      alert("已清除暫存開場影片。");
    });
  }

  const newWorkBtn = document.getElementById("newWorkBtn");
  if (newWorkBtn) {
    newWorkBtn.addEventListener("click", () => {
      const works = getWorks();

      works.push({
        title: "新作品",
        year: "年份未填",
        medium: "媒材未填",
        categories: ["未分類"],
        cover: "images/0.jpeg",
        blocks: [
          {
            type: "text",
            content: "輸入作品文字"
          },
          {
            type: "image",
            content: "images/0.jpeg"
          }
        ],

        // 重要：新增作品預設使用一般作品詳情頁，不使用舊自由版面模板。
        layoutData: [],
        useFreeLayout: false
      });

      setWorks(works);

      const newId = works.length - 1;
      window.location.href = "work-detail.html?id=" + newId;
    });
  }

  renderList();
});

function renderList() {
  const list = document.getElementById("savedWorksList");
  if (!list) return;

  const works = getWorks();

  if (!works.length) {
    list.innerHTML = "<p style='color:rgba(255,255,255,.6)'>目前沒有作品。</p>";
    return;
  }

  list.innerHTML = works.map((w, i) => `
    <div class="cms-work-item">
      <img src="${firstImage(w)}" alt="">
      <div>
        <h3>${w.title}</h3>
        <p>${(w.categories || ["未分類"]).join(" ")}｜${w.year || "年份未填"}</p>
      </div>
      <div class="cms-work-actions">
        <button class="cms-small-btn" onclick="editWork(${i})">編輯</button>
        <button class="cms-small-btn" onclick="freeLayout(${i})">自由版面</button>
        <button class="cms-small-btn danger" onclick="deleteWork(${i})">刪除</button>
      </div>
    </div>
  `).join("");
}

function editWork(i) {
  // 一般編輯：直接進入正常作品詳情頁，登入後頁面底部會有「編輯」按鈕。
  window.location.href = "work-detail.html?id=" + i;
}

function freeLayout(i) {
  // 只有按「自由版面」時，才進入舊的自由畫布編輯器。
  const works = getWorks();
  if (works[i]) {
    works[i].useFreeLayout = true;
    setWorks(works);
  }
  localStorage.setItem("editingWorkId", i);
  location.href = "visual-editor.html";
}

function deleteWork(i) {
  if (!confirm("確定刪除？")) return;
  const works = getWorks();
  works.splice(i, 1);
  setWorks(works);
  renderList();
}


function initSiteSettingsForm() {
  if (typeof getSiteSettings !== "function") return;

  const logo = document.getElementById("siteLogoInput");
  const fb = document.getElementById("siteFacebookInput");
  const ig = document.getElementById("siteInstagramInput");
  const email = document.getElementById("siteEmailInput");
  const saveBtn = document.getElementById("saveSiteSettingsBtn");

  if (!logo || !fb || !ig || !email || !saveBtn) return;

  const s = getSiteSettings();
  logo.value = s.logoText || "SUN LI-HENG";
  fb.value = s.facebookUrl || "";
  ig.value = s.instagramUrl || "";
  email.value = s.email || "";

  saveBtn.addEventListener("click", () => {
    saveSiteSettings({
      logoText: logo.value.trim() || "SUN LI-HENG",
      facebookUrl: fb.value.trim(),
      instagramUrl: ig.value.trim(),
      email: email.value.trim()
    });

    applySiteSettings();
    alert("網站基本資料已儲存。");
  });
}

document.addEventListener("DOMContentLoaded", initSiteSettingsForm);
