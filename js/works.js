
document.addEventListener("DOMContentLoaded", () => {
  if (typeof seedIfEmpty === "function") seedIfEmpty();
  if (typeof normalizeWorksCards === "function") normalizeWorksCards();

  const box = document.getElementById("worksContainer");
  if (!box) return;

  const works = getWorks();

  if (!works.length) {
    box.innerHTML = "<p class='dark-text'>目前沒有作品，請到後台新增。</p>";
    return;
  }

  box.innerHTML = works.map((w, i) => `
    <a class="dark-work-card dark-fade-in" href="work-detail.html?id=${i}">
      <img src="${firstImage(w)}" alt="${w.title}">
      <div class="dark-work-card-info">
        <h2>${w.title}</h2>
        <p>${(w.categories || ["未分類"]).join(" ")}｜${w.year || "年份未填"}</p>
      </div>
    </a>
  `).join("");
});
