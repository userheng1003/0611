
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof window.loadRemoteSiteData === "function") await window.loadRemoteSiteData();
  updateLoginNav();
  seedIfEmpty();
  normalizeWorksCards();
  renderFeaturedWorks();
  runFadeIn();
});

function isAdminLoggedIn() {
  return localStorage.getItem("isLoggedIn_v6") === "true";
}

function updateLoginNav() {
  const loggedIn = isAdminLoggedIn();

  document.querySelectorAll(".nav-links a").forEach(a => {
    const text = a.textContent.trim();
    const href = a.getAttribute("href");

    if (
      text === "登入" ||
      text === "管理" ||
      href === "login.html" ||
      href === "admin.html"
    ) {
      if (loggedIn) {
        a.textContent = "管理";
        a.setAttribute("href", "admin.html");
      } else {
        a.textContent = "登入";
        a.setAttribute("href", "login.html");
      }
    }
  });
}

function runFadeIn() {
  document.querySelectorAll(".fade-in").forEach(el => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold: 0.12 });

    io.observe(el);
  });

  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
}

function getWorks() {
  return JSON.parse(localStorage.getItem("works_v2")) || [];
}

function setWorks(works) {
  localStorage.setItem("works_v2", JSON.stringify(works));
}

function seedIfEmpty() {
  if (getWorks().length) return;

  const seed = [
    {
      title: "OFF DUTY",
      year: "2026",
      medium: "錄像 / 裝置 / 行為藝術",
      categories: ["互動", "裝置"],
      cover: "images/0.jpeg",
      blocks: [
        {
          type: "text",
          content: "以感測器資料作為聲音與影像的生長條件，讓展場成為一座由訊號組成的花園。"
        },
        {
          type: "image",
          content: "images/0.jpeg"
        }
      ],
      exhibitions: "New Media Lab Open Studio",
      useFreeLayout: false
    },
    {
      title: "阿公 拜給你了",
      year: "2026",
      medium: "裝置藝術 / 互動作品",
      categories: ["裝置", "錄像"],
      cover: "images/work1.jpg",
      blocks: [
        { type: "text", content: "關於家庭記憶、祭祀文化與世代關係的裝置作品。" },
        { type: "image", content: "images/work1.jpg" }
      ],
      exhibitions: "",
      useFreeLayout: false
    },
    {
      title: "這個是天線寶寶",
      year: "2026",
      medium: "角色設計 / 3D",
      categories: ["3D", "角色"],
      cover: "images/work2.jpg",
      blocks: [
        { type: "text", content: "以流行文化角色進行再詮釋與轉譯的實驗作品。" },
        { type: "image", content: "images/work2.jpg" }
      ],
      exhibitions: "",
      useFreeLayout: false
    }
  ];

  setWorks(seed);
}


function normalizeWorksCards() {
  const works = getWorks();
  const defaults = [
    {
      title: "OFF DUTY",
      year: "2026",
      medium: "錄像 / 裝置 / 行為藝術",
      categories: ["錄像", "裝置", "行為藝術"],
      cover: "images/0.jpeg"
    },
    {
      title: "阿公 拜給你了",
      year: "2026",
      medium: "裝置 / 祭祀 / 家庭記憶",
      categories: ["裝置", "錄像"],
      cover: "images/work1.jpg"
    },
    {
      title: "這個是天線寶寶",
      year: "2026",
      medium: "角色設計 / 3D",
      categories: ["3D", "角色"],
      cover: "images/work2.jpg"
    }
  ];

  let changed = false;

  for (let i = 0; i < 3; i++) {
    const original = works[i] || {};
    works[i] = Object.assign({}, original, defaults[i]);

    if (!Array.isArray(works[i].blocks) || !works[i].blocks.length) {
      works[i].blocks = [
        { type: "text", content: i === 0 ? "以神像離開原本位置作為事件，重新思考信仰、城市與日常秩序。" : "作品資料待補。" },
        { type: "image", content: defaults[i].cover }
      ];
    }

    changed = true;
  }

  if (changed) setWorks(works);
}

function firstImage(work) {
  if (work.cover) return work.cover;

  const img = (work.blocks || []).find(b => b.type === "image" && b.content);
  return img ? img.content : "images/0.jpeg";
}

function firstText(work) {
  const t = (work.blocks || []).find(b => b.type === "text" && b.content);
  return t ? t.content : "尚未填寫作品論述。";
}

function renderFeaturedWorks() {
  const box = document.getElementById("featuredWorks");
  if (!box) return;

  const works = getWorks().slice(0, 3);

  box.innerHTML = works.map((w, i) => `
    <article class="work-card fade-in">
      <img src="${firstImage(w)}" alt="${w.title}">
      <div class="work-content">
        <p class="work-category">${(w.categories || ["未分類"]).join(" ")}</p>
        <h3>${w.title}</h3>
        <p>${firstText(w).slice(0, 90)}</p>
        <a class="detail-btn" href="work-detail.html?id=${i}">查看作品</a>
      </div>
    </article>
  `).join("");
}
