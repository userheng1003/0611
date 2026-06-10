
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "admin" && password === "1234") {
      localStorage.setItem("isLoggedIn_v6", "true");
      localStorage.setItem("siteRole_v6", "管理者");

      // 舊版錯誤登入狀態不再使用，順便清掉避免干擾。
      localStorage.removeItem("isLoggedIn_v2");
      localStorage.removeItem("siteRole_v2");

      alert("登入成功");
      window.location.href = "admin.html";
    } else {
      alert("帳號或密碼錯誤");
    }
  });
});
