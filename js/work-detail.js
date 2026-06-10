
document.addEventListener("DOMContentLoaded",()=>{
  seedIfEmpty();
  const id=new URLSearchParams(location.search).get("id");
  const works=getWorks();
  const work=works[id];
  const title=document.getElementById("detailTitle");
  const cat=document.getElementById("detailCategory");
  const meta=document.getElementById("detailMeta");
  const box=document.getElementById("detailBlocks");
  if(!work){title.textContent="找不到作品";box.innerHTML="<p>作品不存在。</p>";return;}
  document.title=work.title;
  title.textContent=work.title;
  cat.textContent=(work.categories||["未分類"]).join(" ");
  meta.textContent=`${work.year||"年份未填"} | ${work.medium||"媒材未填"}`;
  if (work.useFreeLayout === true && work.layoutData && work.layoutData.length) {
    renderFree(work.layoutData);
  } else {
    renderBlocks(work.blocks || []);
  }
  function renderFree(items){
    const canvas=document.createElement("div");
    canvas.className="free-layout-canvas";
    items.forEach(item=>{
      const el=document.createElement("div");
      el.className=item.className || "v-item";
      el.innerHTML=item.html || "";
      el.style.left=item.left || "100px";
      el.style.top=item.top || "100px";
      el.style.width=item.width || "";
      el.style.height=item.height || "";
      el.style.transform=item.transform || "";
      el.style.color=item.color || "";
      el.style.fontSize=item.fontSize || "";
      el.classList.remove("editable");
      el.contentEditable=false;
      canvas.appendChild(el);
    });
    box.appendChild(canvas);
  }
  function renderBlocks(blocks){
    blocks.forEach(b=>{
      const el=document.createElement("div");
      el.className="detail-block";
      if(b.type==="text") el.innerHTML=`<p class="detail-text">${b.content}</p>`;
      if(b.type==="image") el.innerHTML=`<img class="detail-image" src="${b.content}" alt="${work.title}">`;
      if(b.type==="video") el.innerHTML=videoHTML(b.content);
      box.appendChild(el);
    });
  }
  function videoHTML(url){
    if(!url) return "";
    if(url.includes("youtube.com") || url.includes("youtu.be")){
      return `<div class="detail-video-wrapper"><iframe src="${toEmbed(url)}" allowfullscreen></iframe></div>`;
    }
    return `<video class="detail-video" controls><source src="${url}"></video>`;
  }
  function toEmbed(url){
    if(url.includes("watch?v=")) return url.replace("watch?v=","embed/");
    if(url.includes("youtu.be/")) return "https://www.youtube.com/embed/"+url.split("youtu.be/")[1].split("?")[0];
    return url;
  }
});
