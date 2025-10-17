let last_status = null;

function updstatus(status) {
  const dot = document.querySelector(".status-dot");
  const statustxt = document.querySelector(".status-text");

  if (!dot || !statustxt) return;

  if (status) {
    dot.style.backgroundColor = "#64F575";
    statustxt.textContent = "Connected";
  } else {
    dot.style.backgroundColor = "#e93f40";
    statustxt.textContent = "Not Connected";
  }
}

async function upd_pfp(username) {
  const pimg = document.querySelector("#pfp_frame img.logo");
  if (!pimg) return;

  if (!username) {
    pimg.src = "/imgs/default_pfp.png";
    return;
  }

  const pfp_url = `/imgs/pfps/${username}.png`;

  try {
    const resp = await fetch(pfp_url, { method: "HEAD" });
    if (resp.ok) {pimg.src = pfp_url;} else {pimg.src = "/default_pfp.png";
    }
  } catch (err) {console.error("error fetching:", err); pimg.src = "/default_pfp.png";}
}

function upd_username(username) {
  const un_span = document.querySelector(".top-right-bar .username");
  if (un_span && username) { un_span.textContent = username; }
  upd_pfp(username);
}

async function poll_status() {
  try {
    const resp = await fetch("/api/getstatus", { credentials: "include" });

    if (resp.status === 403) {
      window.location.href = "/";
      return;
    }

    const data = await resp.json();
    upd_username(data.user);
    if (data.status !== last_status) {
      last_status = data.status;
      updstatus(last_status);
    }
  } catch (err) {
    console.error("failed to fetch status:", err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  poll_status();
  setInterval(poll_status, 2000);

  document.getElementById("clear-btn")?.addEventListener("click", () => {
    window.editor.setValue("");
  });

  document.getElementById("execute-btn")?.addEventListener("click", async () => {
    if (!last_status) {
      notify("You're not connected!", "info", 4000);
      return;
    }

    const code = window.editor.getValue();
    try {
      const resp = await fetch(`/api/ccode?code=${encodeURIComponent(code)}`, {
        credentials: "include",
      });

      if (!resp.ok) {
        console.error("error..", resp.status);
        return;
      }

      const result = await resp.json();
      console.log(result);
    } catch (err) {
      console.error("failed to exec; ", err);
    }
  });
});

//////////////////////////////////////////////////////////////////////////////

window.addEventListener("DOMContentLoaded", () => {
  const pfp_frame = document.getElementById("pfp_frame");
  const lo_btn = document.getElementById("lu-btn");
  let ttip_active = false;

  if (!pfp_frame || !lo_btn) return;

  pfp_frame.addEventListener("mouseenter", () => {
    if (!ttip_active) pfp_frame.classList.add("hover");
  });
  pfp_frame.addEventListener("mouseleave", () => {
    if (!ttip_active) pfp_frame.classList.remove("hover");
  });

  pfp_frame.addEventListener("click", (e) => {
    e.stopPropagation();
    if (ttip_active) {
      ttip_active = false;
      pfp_frame.classList.remove("active");
      pfp_frame.classList.add("hover");
    } else {
      ttip_active = true;
      pfp_frame.classList.add("active");
      pfp_frame.classList.remove("hover");
    }
  });

  document.addEventListener("click", () => {
    if (ttip_active) {
      ttip_active = false;
      pfp_frame.classList.remove("active");
      pfp_frame.classList.remove("hover");
    }
  });

  lo_btn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.location.href = "/api/logout";
  });
});

notify("Loaded!", "info", 3500);
