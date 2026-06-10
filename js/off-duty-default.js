
(function(){
  const key = "works_v2";
  let works = [];
  try { works = JSON.parse(localStorage.getItem(key)) || []; } catch(e) {}
  if (!works.length || works[0].title !== "OFF DUTY") {
    const first = {
      title: "OFF DUTY",
      year: "2026",
      medium: "行為錄像／裝置",
      category: "錄像 行為藝術",
      cover: "images/0.jpeg",
      images: ["images/0.jpeg", "images/user-2.jpg", "images/user.jpg", "images/work1.jpg"],
      statement: `「土地公」作為掌管土地與地方的神明，通常固定存在於神壇與廟宇之中，與特定地域緊密連結。然而，當土地公離開原本的位置，被裝載於四驅車上並開始移動時，是否也代表著祂暫時離開了自己的職責？某種程度上，這樣的狀態或許像是一種「翹班」。

本作品以「土地公翹班」作為發想，透過神明在城市中的移動與遊走，試圖建構一系列可能發生的故事與情境，並以不同畫面回應當代都市中的社會現況與生活狀態，重新思考地方信仰、土地，以及人與城市之間的關係。`
    };
    works[0] = Object.assign({}, works[0] || {}, first);
    localStorage.setItem(key, JSON.stringify(works));
  }
})();
