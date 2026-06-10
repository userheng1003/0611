
(function () {
  const LOGIN_KEY = "isLoggedIn_v6";
  const STORAGE_KEY = "pageEdits_v8_stable";
  const MOVEABLE_SRC = "https://daybrush.com/moveable/release/latest/dist/moveable.min.js";

  const PUBLIC_EXCLUDE = [
    "login.html",
    "admin.html",
    "visual-editor.html",
    "layout-editor.html",
    "splash.html"
  ];

  const fileName = location.pathname.split("/").pop() || "index.html";
  if (PUBLIC_EXCLUDE.includes(fileName)) return;

  function isLoggedIn() {
    return localStorage.getItem(LOGIN_KEY) === "true";
  }

  function removeEditorUI() {
    document.body.classList.remove("front-edit-mode");

    document.querySelectorAll(
      ".front-edit-entry, .front-editor-toolbar, .front-editor-hint, .front-angle-display, .moveable-control-box"
    ).forEach(el => el.remove());

    document.querySelectorAll("[data-front-editable='true']").forEach(el => {
      el.removeAttribute("data-front-editable");
      el.removeAttribute("contenteditable");
      el.classList.remove("front-edit-selected");
    });
  }

  if (!isLoggedIn()) {
    document.addEventListener("DOMContentLoaded", removeEditorUI);
    return;
  }

  function loadMoveable(callback) {
    if (window.Moveable) {
      callback();
      return;
    }

    const script = document.createElement("script");
    script.src = MOVEABLE_SRC;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function pageKey() {
    return fileName;
  }

  function getStore() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  }

  function setStore(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getPageStore() {
    const all = getStore();
    return all[pageKey()] || null;
  }

  function setPageStore(data) {
    const all = getStore();
    all[pageKey()] = data;
    setStore(all);
  }

  function getMain() {
    return document.querySelector("main");
  }

  function isEditorElement(el) {
    return Boolean(
      el.closest(".front-editor-toolbar") ||
      el.closest(".front-edit-entry") ||
      el.closest(".front-editor-hint") ||
      el.closest(".front-angle-display") ||
      el.closest(".moveable-control-box")
    );
  }

  function editableElements() {
    const main = getMain();
    if (!main) return [];

    return Array.from(main.querySelectorAll("*")).filter(el => {
      if (isEditorElement(el)) return false;
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return false;
      return true;
    });
  }

  function markEditableElements() {
    editableElements().forEach(el => {
      el.dataset.frontEditable = "true";
    });

    document.querySelectorAll(".front-added-item").forEach(el => {
      el.dataset.frontEditable = "true";
    });
  }

  function snapshotDOM() {
    const main = getMain();

    const added = Array.from(document.querySelectorAll(".front-added-item")).map(el => {
      el.classList.remove("front-edit-selected");
      return el.outerHTML;
    });

    return {
      mainHTML: main ? main.innerHTML : "",
      addedHTML: added
    };
  }

  function restoreDOM(snapshot) {
    if (!snapshot) return;

    if (moveable) {
      moveable.destroy();
      moveable = null;
    }

    if (selected) {
      selected.classList.remove("front-edit-selected");
      selected = null;
    }

    document.querySelectorAll(".front-added-item").forEach(el => el.remove());

    const main = getMain();
    if (main) {
      main.innerHTML = snapshot.mainHTML || "";
    }

    (snapshot.addedHTML || []).forEach(html => {
      const wrap = document.createElement("div");
      wrap.innerHTML = html.trim();
      const el = wrap.firstElementChild;
      if (el) document.body.appendChild(el);
    });

    markEditableElements();
  }

  function applySavedPage() {
    const saved = getPageStore();
    if (!saved) return;
    restoreDOM(saved);
    removeEditorUI();
  }

  let entryButton;
  let toolbar;
  let hint;
  let angleDisplay;
  let fileInput;

  let editMode = false;
  let selected = null;
  let moveable = null;

  let initialSnapshot = null;
  let undoStack = [];
  let isRestoring = false;

  function pushUndo() {
    if (!editMode || isRestoring) return;
    undoStack.push(JSON.stringify(snapshotDOM()));
    if (undoStack.length > 60) undoStack.shift();
  }

  function undoLastStep() {
    if (undoStack.length === 0) {
      alert("已經沒有上一步了");
      return;
    }

    isRestoring = true;
    const previous = JSON.parse(undoStack.pop());
    restoreDOM(previous);
    isRestoring = false;
  }

  function buildUI() {
    if (document.querySelector(".front-edit-entry")) return;

    entryButton = document.createElement("button");
    entryButton.className = "front-edit-entry";
    entryButton.textContent = "編輯";
    document.body.appendChild(entryButton);

    toolbar = document.createElement("div");
    toolbar.className = "front-editor-toolbar";
    toolbar.innerHTML = `
      <button type="button" id="frontUndoBtn">返回上一步</button>
      <button type="button" id="frontPlaceTextBtn">放置文字</button>
      <button type="button" id="frontPlaceImageBtn">放置圖片</button>
      <button type="button" id="frontPlaceButtonBtn">放置按鈕</button>
      <button type="button" id="frontPlaceVideoBtn">放置影片</button>
      <button type="button" id="frontChangeMediaBtn">換圖/影片</button>
      <button type="button" id="frontDuplicateBtn">複製</button>
      <button type="button" class="danger" id="frontDeleteBtn">刪除方塊</button>
      <button type="button" id="frontSaveBtn">儲存頁面</button>
      <button type="button" id="frontCancelBtn">取消編輯</button>
      <button type="button" id="frontExitBtn">離開編輯</button>
      <label>顏色 <input type="color" id="frontColorInput" value="#111111"></label>
      <label>背景 <input type="color" id="frontBgInput" value="#ffffff"></label>
      <label>字級 <input type="number" id="frontFontSizeInput" min="8" max="220" value="24"></label>
      <label>透明 <input type="range" id="frontOpacityInput" min="0" max="1" step="0.05" value="1"></label>
      <label>圓角 <input type="number" id="frontRadiusInput" min="0" max="120" value="0"></label>
      <label>旋轉
        <select id="frontRotateSelect">
          <option value="">自動</option>
          <option value="0">0°</option>
          <option value="90">90°</option>
          <option value="180">180°</option>
          <option value="270">270°</option>
        </select>
      </label>
    `;
    document.body.appendChild(toolbar);

    hint = document.createElement("div");
    hint.className = "front-editor-hint";
    hint.textContent = "點選物件後可拖曳 / 縮放 / 旋轉。返回上一步會還原上一個操作；取消編輯會回到剛開始編輯的狀態。";
    document.body.appendChild(hint);

    angleDisplay = document.createElement("div");
    angleDisplay.className = "front-angle-display";
    angleDisplay.textContent = "0°";
    document.body.appendChild(angleDisplay);

    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,video/mp4,video/webm";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    entryButton.addEventListener("click", enterEditMode);
    toolbar.querySelector("#frontUndoBtn").addEventListener("click", undoLastStep);
    toolbar.querySelector("#frontExitBtn").addEventListener("click", exitEditMode);
    toolbar.querySelector("#frontCancelBtn").addEventListener("click", cancelEditMode);
    toolbar.querySelector("#frontSaveBtn").addEventListener("click", savePage);
    toolbar.querySelector("#frontDeleteBtn").addEventListener("click", deleteSelected);
    toolbar.querySelector("#frontDuplicateBtn").addEventListener("click", duplicateSelected);

    toolbar.querySelector("#frontPlaceTextBtn").addEventListener("click", () => {
      pushUndo();
      addItem({
        type: "text",
        className: "front-added-item front-added-text",
        html: "輸入文字",
        left: "120px",
        top: window.scrollY + 160 + "px",
        style: {
          color: "#111",
          fontSize: "40px"
        }
      });
    });

    toolbar.querySelector("#frontPlaceButtonBtn").addEventListener("click", () => {
      pushUndo();
      addItem({
        type: "button",
        className: "front-added-item front-added-button",
        html: "按鈕文字",
        left: "160px",
        top: window.scrollY + 220 + "px",
        style: {
          color: "#fff",
          backgroundColor: "#111",
          fontSize: "18px",
          borderRadius: "14px"
        }
      });
    });

    toolbar.querySelector("#frontPlaceImageBtn").addEventListener("click", () => {
      fileInput.dataset.mode = "addImage";
      fileInput.accept = "image/*";
      fileInput.click();
    });

    toolbar.querySelector("#frontPlaceVideoBtn").addEventListener("click", () => {
      const url = prompt("請貼上 YouTube / Vimeo / MP4 網址，或取消後用本機影片：");

      if (url) {
        pushUndo();
        addVideoFromUrl(url);
      } else {
        fileInput.dataset.mode = "addVideo";
        fileInput.accept = "video/mp4,video/webm";
        fileInput.click();
      }
    });

    toolbar.querySelector("#frontChangeMediaBtn").addEventListener("click", () => {
      if (!selected) {
        alert("請先選擇圖片或影片");
        return;
      }

      fileInput.dataset.mode = "replaceMedia";
      fileInput.accept = "image/*,video/mp4,video/webm";
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        pushUndo();

        if (fileInput.dataset.mode === "addImage") {
          addItem({
            type: "image",
            className: "front-added-item front-added-image",
            html: `<img src="${reader.result}" alt="新增圖片">`,
            left: "180px",
            top: window.scrollY + 180 + "px",
            style: { width: "300px" }
          });
        }

        if (fileInput.dataset.mode === "addVideo") {
          addItem({
            type: "video",
            className: "front-added-item front-added-video",
            html: `<video controls src="${reader.result}"></video>`,
            left: "180px",
            top: window.scrollY + 220 + "px",
            style: { width: "520px" }
          });
        }

        if (fileInput.dataset.mode === "replaceMedia" && selected) {
          replaceSelectedMedia(reader.result, file.type);
        }

        fileInput.value = "";
      };

      reader.readAsDataURL(file);
    });

    toolbar.querySelector("#frontColorInput").addEventListener("change", e => {
      if (!selected) return;
      pushUndo();
      selected.style.setProperty("color", e.target.value, "important");
      selected.querySelectorAll("*").forEach(child => child.style.setProperty("color", e.target.value, "important"));
    });

    toolbar.querySelector("#frontBgInput").addEventListener("change", e => {
      if (!selected) return;
      pushUndo();
      selected.style.setProperty("background-color", e.target.value, "important");
    });

    toolbar.querySelector("#frontFontSizeInput").addEventListener("change", e => {
      if (!selected) return;
      pushUndo();
      selected.style.setProperty("font-size", e.target.value + "px", "important");
      selected.querySelectorAll("*").forEach(child => child.style.setProperty("font-size", e.target.value + "px", "important"));
    });

    toolbar.querySelector("#frontOpacityInput").addEventListener("change", e => {
      if (!selected) return;
      pushUndo();
      selected.style.setProperty("opacity", e.target.value, "important");
    });

    toolbar.querySelector("#frontRadiusInput").addEventListener("change", e => {
      if (!selected) return;
      pushUndo();
      selected.style.setProperty("border-radius", e.target.value + "px", "important");
      selected.querySelectorAll("img,video,iframe").forEach(child => child.style.setProperty("border-radius", e.target.value + "px", "important"));
    });

    toolbar.querySelector("#frontRotateSelect").addEventListener("change", e => {
      if (!selected || e.target.value === "") return;
      pushUndo();
      setRotation(selected, Number(e.target.value));
      if (moveable) moveable.updateRect();
    });
  }

  function enterEditMode() {
    loadMoveable(() => {
      editMode = true;
      markEditableElements();

      initialSnapshot = snapshotDOM();
      undoStack = [];

      document.body.classList.add("front-edit-mode");
      toolbar.classList.add("active");
      hint.classList.add("active");
      entryButton.style.display = "none";

      document.addEventListener("click", editorClickHandler, true);
      document.addEventListener("beforeinput", beforeInputHandler, true);
    });
  }

  function exitEditMode() {
    editMode = false;

    document.body.classList.remove("front-edit-mode");
    toolbar.classList.remove("active");
    hint.classList.remove("active");
    entryButton.style.display = "block";

    document.removeEventListener("click", editorClickHandler, true);
    document.removeEventListener("beforeinput", beforeInputHandler, true);

    if (moveable) {
      moveable.destroy();
      moveable = null;
    }

    if (selected) {
      selected.classList.remove("front-edit-selected");
      selected = null;
    }

    document.querySelectorAll("[contenteditable='true']").forEach(el => {
      el.removeAttribute("contenteditable");
    });
  }

  function cancelEditMode() {
    if (!confirm("確定取消編輯？目前未儲存的修改會全部還原。")) return;

    restoreDOM(initialSnapshot);
    exitEditMode();
  }

  function editorClickHandler(e) {
    if (!editMode) return;
    if (isEditorElement(e.target)) return;

    const target = e.target.closest("[data-front-editable='true'], .front-added-item");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    selectElement(target);
  }

  function beforeInputHandler(e) {
    if (!editMode) return;
    if (!selected) return;
    if (!selected.isContentEditable) return;

    pushUndo();
  }

  function selectElement(el) {
    if (!editMode) return;

    if (selected) selected.classList.remove("front-edit-selected");

    selected = el;
    selected.classList.add("front-edit-selected");

    if (!["IMG", "IFRAME", "VIDEO"].includes(el.tagName)) {
      selected.contentEditable = "true";
    }

    const size = parseInt(getComputedStyle(el).fontSize) || 24;
    const fontInput = toolbar.querySelector("#frontFontSizeInput");
    if (fontInput) fontInput.value = size;

    if (moveable) moveable.destroy();

    moveable = new Moveable(document.body, {
      target: selected,
      draggable: true,
      resizable: true,
      rotatable: true,
      origin: false,
      throttleRotate: 1,
      keepRatio: false
    });

    moveable.on("dragStart", () => pushUndo());
    moveable.on("resizeStart", () => pushUndo());
    moveable.on("rotateStart", () => {
      pushUndo();
      angleDisplay.style.display = "block";
    });

    moveable.on("drag", e => {
      e.target.style.transform = e.transform;
    });

    moveable.on("resize", e => {
      e.target.style.width = e.width + "px";
      e.target.style.height = e.height + "px";
      e.target.style.transform = e.drag.transform;
    });

    moveable.on("rotate", e => {
      let angle = Math.round(e.beforeRotate);
      [0, 90, 180, 270, 360].forEach(snap => {
        if (Math.abs(angle - snap) < 5) angle = snap;
      });

      const base = e.drag.transform.replace(/rotate\([^)]*\)/g, "");
      e.target.style.transform = base + ` rotate(${angle}deg)`;
      e.target.dataset.rotate = angle;
      angleDisplay.textContent = angle + "°";
    });

    moveable.on("rotateEnd", () => {
      setTimeout(() => angleDisplay.style.display = "none", 600);
    });
  }

  function addItem(config) {
    const el = document.createElement("div");
    el.className = config.className || "front-added-item";
    el.innerHTML = config.html || "新增物件";
    el.dataset.added = "true";
    el.dataset.addedType = config.type || "box";
    el.dataset.frontEditable = "true";
    el.style.position = "absolute";
    el.style.left = config.left || "120px";
    el.style.top = config.top || "120px";
    el.style.width = config.width || "";
    el.style.height = config.height || "";

    if (config.style) {
      Object.entries(config.style).forEach(([key, value]) => {
        const cssKey = key.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
        el.style.setProperty(cssKey, value, "important");
      });
    }

    if (el.classList.contains("front-added-text") || el.classList.contains("front-added-button")) {
      el.contentEditable = "true";
    }

    document.body.appendChild(el);
    selectElement(el);
  }

  function addVideoFromUrl(url) {
    let html = "";

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      html = `<iframe src="${toEmbed(url)}" allowfullscreen></iframe>`;
    } else if (url.includes("vimeo.com")) {
      const id = url.split("/").filter(Boolean).pop();
      html = `<iframe src="https://player.vimeo.com/video/${id}" allowfullscreen></iframe>`;
    } else {
      html = `<video controls src="${url}"></video>`;
    }

    addItem({
      type: "video",
      className: "front-added-item front-added-video",
      html,
      left: "180px",
      top: window.scrollY + 220 + "px",
      style: { width: "520px" }
    });
  }

  function toEmbed(url) {
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return "https://www.youtube.com/embed/" + url.split("youtu.be/")[1].split("?")[0];
    return url;
  }

  function replaceSelectedMedia(src, type) {
    if (!selected) return;

    if (type.startsWith("image/")) {
      const img = selected.tagName === "IMG" ? selected : selected.querySelector("img");
      if (img) img.src = src;
      else selected.innerHTML = `<img src="${src}" alt="替換圖片">`;
    }

    if (type.startsWith("video/")) {
      const video = selected.tagName === "VIDEO" ? selected : selected.querySelector("video");
      if (video) video.src = src;
      else selected.innerHTML = `<video controls src="${src}"></video>`;
    }
  }

  function setRotation(el, angle) {
    const current = el.style.transform || "";
    const withoutRotate = current.replace(/rotate\([^)]*\)/g, "");
    el.style.transform = `${withoutRotate} rotate(${angle}deg)`;
    el.dataset.rotate = String(angle);
    angleDisplay.textContent = angle + "°";
  }

  function deleteSelected() {
    if (!selected) {
      alert("請先選擇一個物件");
      return;
    }

    if (!confirm("確定刪除這個方塊？")) return;

    pushUndo();

    if (moveable) {
      moveable.destroy();
      moveable = null;
    }

    selected.remove();
    selected = null;
  }

  function duplicateSelected() {
    if (!selected) {
      alert("請先選擇一個物件");
      return;
    }

    pushUndo();

    const clone = selected.cloneNode(true);
    clone.classList.remove("front-edit-selected");
    clone.dataset.added = "true";
    clone.dataset.frontEditable = "true";

    if (!clone.classList.contains("front-added-item")) {
      clone.classList.add("front-added-item");
    }

    clone.style.position = "absolute";
    clone.style.left = (parseFloat(selected.style.left || 120) + 30) + "px";
    clone.style.top = (parseFloat(selected.style.top || (window.scrollY + 120)) + 30) + "px";

    document.body.appendChild(clone);
    selectElement(clone);
  }

  function savePage() {
    setPageStore(snapshotDOM());
    initialSnapshot = snapshotDOM();
    undoStack = [];
    alert("此頁已儲存。");
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      // // applySavedPage();
      buildUI();
    }, 500);
  });
})();
