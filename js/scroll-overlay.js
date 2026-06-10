
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".dark-hero");
  const heroContent = document.querySelector(".dark-hero-content");
  const artwork = document.querySelector("#artwork");
  const list = document.querySelector(".dark-work-list");

  if (list && typeof getWorks === "function" && typeof firstImage === "function") {
    const works = getWorks();
    const links = Array.from(list.querySelectorAll("a"));

    links.forEach((link, index) => {
      const work = works[index];
      const imgSrc = work ? firstImage(work) : "images/0.jpeg";
      const title = work ? work.title : "work";
      link.innerHTML = `<img src="${imgSrc}" alt="${title}">`;
      if (work) link.href = `work-detail.html?id=${index}`;
    });
  }

  if (!hero || !heroContent || !artwork) return;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function updateOverlay() {
    const scrollY = window.scrollY || window.pageYOffset;
    const start = hero.offsetHeight * 0.16;
    const end = hero.offsetHeight * 0.82;
    const progress = clamp((scrollY - start) / (end - start), 0, 1);

    const opacity = 1 - progress * 0.88;
    const translate = -progress * 72;
    const blur = progress * 4;

    heroContent.style.opacity = opacity;
    heroContent.style.transform = `translateY(${translate}px) scale(${1 - progress * 0.035})`;
    heroContent.style.filter = `blur(${blur}px)`;
    hero.classList.toggle("hero-covered", progress > 0.18);
  }

  updateOverlay();
  window.addEventListener("scroll", updateOverlay, { passive: true });
});
