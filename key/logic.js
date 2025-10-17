window.addEventListener("DOMContentLoaded", () => {
  async function checktsout() {
    try {
      const resp = await fetch("/api/getstatus", { credentials: "include" });
      if (resp.status === 403) return;
      const data = await resp.json();
      if (data && typeof data.status !== "undefined") {
        window.location.href = "/editor";
      }
    } catch (err) {}
  }

  checktsout();

  document.getElementById("login-btn").addEventListener("click", async function () {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    if (!user || !pass) {
      notify("Enter password/username!", "error", 3500);
      return;
    }
    try {
      const resp = await fetch(
        `/api/login?user=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await resp.json();
      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        notify("Wrong password or username!", "error", 3500);
      }
    } catch (err) {
      notify("Wrong password or username!", "error", 3500);
    }
  });

  document.getElementById("register-btn").addEventListener("click", async function () {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    if (!user || !pass) {
      notify("Enter password/username!", "error", 3500);
      return;
    }
    try {
      const resp = await fetch(
        `/api/register?user=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await resp.json();
      if (resp.status === 200) {
        notify("Account created! You can now log in.", "success", 3000);
      } else {
        notify(data.error || "Failed to create account.", "error", 3500);
      }
    } catch (err) {
      notify("Error creating account!", "error", 3500);
    }
  });
});
