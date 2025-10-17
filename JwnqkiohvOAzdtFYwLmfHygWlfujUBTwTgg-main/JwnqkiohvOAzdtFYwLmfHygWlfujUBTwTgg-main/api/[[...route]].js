import cookie from "cookie";

let state = global.__STATE__ || {
  status: {},
  code: {},
  script_ids: {},
};

function gen_scriptid() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getusernames() {
  const env_data = process.env.MVZWK6DPOV2HA5LU || "";
  const lines = env_data.split(/\r?\n/).filter(Boolean);
  const users = {};
  for (const line of lines) {
    const [username, password] = line.split(":");
    if (username && password) users[username.trim()] = password.trim();
  }
  return users;
}

let lscript_id = null;

export default function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "https://8967.vercel.app");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const path = pathname.toLowerCase();
    const { user, password, value, code } = req.query;
    const users = getusernames();

    if (path.endsWith("/login")) {
      if (!user || !password || !users[user] || password !== users[user]) {
        return res.status(403).json({ error: "wrong key" });
      }
      const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
      res.setHeader(
        "Set-Cookie",
        cookie.serialize(
          "auth",
          encodeURIComponent(JSON.stringify({ user, password })),
          {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            expires,
          }
        )
      );
      return res.status(200).json({ redirect: "/editor" });
    }

    if (path.endsWith("/register")) {
      if (!user || !password) {
        return res.status(400).json({ error: "missing username or password" });
      }
      const users = getusernames();
      if (users[user]) {
        return res.status(409).json({ error: "user already exists" });
      }
      users[user] = password;
      state.status[user] = { value: false, lastUpdate: Date.now() };
      state.code[user] = "";
      state.script_ids[user] = "";
      global.__STATE__ = state;
      return res.status(200).json({ message: "account created", user });
    }

    if (path.endsWith("/logout")) {
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("auth", "", {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          expires: new Date(0),
        })
      );
      res.writeHead(302, { Location: "/" });
      return res.end();
    }

    let auth_user = null;
    if (req.headers.cookie) {
      try {
        const cookies = cookie.parse(req.headers.cookie || "");
        if (cookies.auth) {
          const parsed = JSON.parse(decodeURIComponent(cookies.auth));
          if (users[parsed.user] && parsed.password === users[parsed.user]) {
            auth_user = parsed.user;
          }
        }
      } catch (err) {}
    }

    if (!auth_user && user && password && users[user] && password === users[user]) {
      auth_user = user;
    }
    if (!auth_user) {
      return res.status(403).json({ error: "not authenticated" });
    }

    if (path.endsWith("/getstatus")) {
      const user_status = state.status[auth_user];
      let isctd = false;
      if (user_status) {
        isctd = user_status.value;
        if (Date.now() - user_status.lastUpdate > 15000) {
          state.status[auth_user].value = false;
          isctd = false;
        }
      }
      return res.status(200).json({ user: auth_user, status: isctd });
    }

    if (path.endsWith("/cstatus")) {
      const new_status =
        value !== undefined ? value === "true" : !state.status[auth_user]?.value;
      state.status[auth_user] = { value: new_status, lastUpdate: Date.now() };
      setTimeout(() => {
        const current = state.status[auth_user];
        if (current && Date.now() - current.lastUpdate >= 15000) {
          state.status[auth_user].value = false;
          state.code[auth_user] = "";
          state.script_id[auth_user] = "";
          global.__STATE__ = state;
        }
      }, 15000);
      global.__STATE__ = state;
      return res.status(200).json({ user: auth_user, status: state.status[auth_user].value });
    }

    if (path.endsWith("/getcode")) {
      const message = state.code[auth_user] ?? "";
      const script_id = state.script_ids[auth_user] ?? "";
      return res.status(200).json({
        user: auth_user,
        code: message,
        "script-id": script_id,
      });
    }

    if (path.endsWith("/ccode")) {
      if (!code) return res.status(400).json({ error: "missing code" });
      state.code[auth_user] = code;
      const n_scid = gen_scriptid();
      state.script_ids[auth_user] = n_scid;
      global.__STATE__ = state;
      return res.status(200).json({ user: auth_user, code: code, "script-id": n_scid });
    }

    return res.status(404).json({ error: "not found" });
  } catch (err) {
    return res.status(500).json({ error: "internal server error" });
  }
}