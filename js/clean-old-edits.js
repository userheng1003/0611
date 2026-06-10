(function(){
const k="cleanOldPageEdits_20260610_v2";
if(localStorage.getItem(k)==="true")return;
["pageEdits_v5","pageEdits_v6","pageEdits_v8_stable"].forEach(x=>localStorage.removeItem(x));
localStorage.setItem(k,"true");
})();