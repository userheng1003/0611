
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("darkWorkList");
  if (!list) return;

  if (typeof getWorks !== "function") return;

  const works = getWorks();
  if (!works.length) return;

  list.innerHTML = works.slice(0, 9).map((work, index) => {
    return `<a href="work-detail.html?id=${index}">${work.title || "Untitled"}</a>`;
  }).join("");
});
