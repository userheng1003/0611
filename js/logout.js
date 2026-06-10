
function logoutSite() {
  localStorage.removeItem("isLoggedIn_v6");
  localStorage.removeItem("siteRole_v6");
  localStorage.removeItem("isLoggedIn_v2");
  localStorage.removeItem("siteRole_v2");
  alert("已登出");
  window.location.href = "login.html";
}
