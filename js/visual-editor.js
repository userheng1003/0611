
document.addEventListener("DOMContentLoaded",()=>{
  if(localStorage.getItem("isLoggedIn_v6")!=="true"){location.href="login.html";return;}
  seedIfEmpty();
  const id=Number(localStorage.getItem("editingWorkId")||0);
  const works=getWorks();
  const work=works[id];
  if(!work){alert("找不到作品");location.href="admin.html";return;}
  const canvas=document.getElementById("canvas");
  const titleInput=document.getElementById("titleInput");
  const metaInput=document.getElementById("metaInput");
  const mediumInput=document.getElementById("mediumInput");
  const categoryInput=document.getElementById("categoryInput");
  const colorPicker=document.getElementById("colorPicker");
  const fontSizeInput=document.getElementById("fontSizeInput");
  const angleDisplay=document.getElementById("angleDisplay");
  let selected=null, moveable=null;

  titleInput.value=work.title||"";
  metaInput.value=work.year||"";
  mediumInput.value=work.medium||"";
  categoryInput.value=(work.categories||["未分類"]).join(" / ");

  function select(el){
    selected=el;
    if(moveable) moveable.destroy();
    moveable=new Moveable(canvas,{target:el,draggable:true,resizable:true,rotatable:true,origin:false,throttleRotate:1});
    moveable.on("drag",e=>{e.target.style.transform=e.transform});
    moveable.on("resize",e=>{e.target.style.width=e.width+"px";e.target.style.height=e.height+"px";e.target.style.transform=e.drag.transform});
    moveable.on("rotateStart",()=>angleDisplay.style.display="block");
    moveable.on("rotate",e=>{
      let angle=Math.round(e.beforeRotate);
      [0,90,180,270,360].forEach(s=>{if(Math.abs(angle-s)<5)angle=s});
      angleDisplay.textContent=angle+"°";
      const base=e.drag.transform.replace(/rotate\([^)]*\)/,"");
      e.target.style.transform=base+` rotate(${angle}deg)`;
      e.target.dataset.rotate=angle;
    });
    moveable.on("rotateEnd",()=>setTimeout(()=>angleDisplay.style.display="none",600));
  }
  function addItem(el){
    el.classList.add("v-item");
    el.addEventListener("click",()=>select(el));
    canvas.appendChild(el);
    select(el);
  }
  document.getElementById("addText").onclick=()=>{
    const el=document.createElement("div");
    el.className="v-text";
    el.contentEditable=true;
    el.innerText="輸入文字";
    addItem(el);
  };
  document.getElementById("addImage").onclick=()=>{
    const input=document.createElement("input");
    input.type="file"; input.accept="image/*";
    input.onchange=()=>{
      const file=input.files[0]; if(!file)return;
      const reader=new FileReader();
      reader.onload=()=>{
        const box=document.createElement("div");
        const img=document.createElement("img");
        img.src=reader.result; box.appendChild(img); addItem(box);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
  colorPicker.oninput=()=>{ if(selected) selected.style.color=colorPicker.value; };
  fontSizeInput.oninput=()=>{ if(selected) selected.style.fontSize=fontSizeInput.value+"px"; };

  function load(){
    const items=work.layoutData && work.layoutData.length ? work.layoutData : makeFromBlocks(work);
    items.forEach(item=>{
      const el=document.createElement("div");
      el.className=item.className||"v-item";
      el.innerHTML=item.html||"";
      el.style.left=item.left||"100px";
      el.style.top=item.top||"100px";
      el.style.width=item.width||"";
      el.style.height=item.height||"";
      el.style.transform=item.transform||"";
      el.style.color=item.color||"";
      el.style.fontSize=item.fontSize||"";
      if(el.classList.contains("v-text")) el.contentEditable=true;
      el.addEventListener("click",()=>select(el));
      canvas.appendChild(el);
    });
  }
  function makeFromBlocks(w){
    const arr=[];
    let y=80;
    (w.blocks||[]).forEach(b=>{
      if(b.type==="text") arr.push({className:"v-item v-text",html:b.content,left:"90px",top:y+"px",fontSize:"36px"});
      if(b.type==="image") arr.push({className:"v-item",html:`<img src="${b.content}">`,left:"460px",top:y+"px",width:"360px"});
      y+=160;
    });
    return arr;
  }
  document.getElementById("saveBtn").onclick=()=>{
    const items=[];
    document.querySelectorAll(".v-item").forEach(el=>{
      items.push({className:el.className,html:el.innerHTML,left:el.style.left||"100px",top:el.style.top||"100px",width:el.style.width||"",height:el.style.height||"",transform:el.style.transform||"",color:el.style.color||"",fontSize:el.style.fontSize||""});
    });
    const updated=getWorks();
    updated[id].title=titleInput.value.trim()||"未命名作品";
    updated[id].year=metaInput.value.trim()||"年份未填";
    updated[id].medium=mediumInput.value.trim()||"媒材未填";
    updated[id].categories=categoryInput.value.trim()?categoryInput.value.split(/[/、,，]/).map(s=>s.trim()).filter(Boolean):["未分類"];
    updated[id].layoutData=items;
    updated[id].useFreeLayout=true;
    const firstImg=items.find(it=>it.html.includes("<img"));
    if(firstImg){
      const m=firstImg.html.match(/src="([^"]+)"/);
      if(m) updated[id].cover=m[1];
    }
    setWorks(updated);
    alert("已儲存作品頁面！");
  };
  load();
});
