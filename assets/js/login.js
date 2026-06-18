/* ============================================================
   Login page behaviour.
   UI-only for now. API wiring lives in ONE place — see api.login().
   ============================================================ */

/* ---- API integration point (wire this up after UI approval) ----
   The backend contract (from the existing portal):
     POST {API_BASE}/Login   body: { UserId, Password }
     → returns { sStatus: "Success" | "...", tokenid, UserName, ... }
   Replace the body of api.login()/api.forgotPassword() with real fetch()
   calls when the UI is approved. Nothing else needs to change. */
const API_BASE = "https://uatplus.amizone.net/dubaiapi/api/Student";

const api = {
    async login({ UserId, Password }) {
        // TODO: replace with real call:
        // const r = await fetch(`${API_BASE}/Login`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ UserId, Password })
        // });
        // return await r.json();
        await wait(700);
        return { sStatus: "DEMO", message: "UI preview only — API not wired yet." };
    },
    async forgotPassword(email) {
        // TODO: POST {API_BASE}/Login/ForgotPassword  { UserId: 999, UserEmail: email }
        await wait(600);
        return { ok: false, demo: true };
    }
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (sel) => document.querySelector(sel);

document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();

    /* Password visibility toggle */
    const pw = $("#Password"), pwIcon = $("#pwToggleIcon"), pwBtn = $("#pwToggle");
    pwBtn.addEventListener("click", () => {
        const show = pw.type === "password";
        pw.type = show ? "text" : "password";
        pwIcon.className = show ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
        pwBtn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });

    /* Login submit */
    const form = $("#loginForm"), btn = $("#loginBtn"), btnText = $("#loginBtnText"), alertBox = $("#loginAlert");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hide(alertBox);
        const UserId = $("#UserId").value.trim();
        const Password = $("#Password").value;
        if (!UserId || !Password) {
            return showAlert(alertBox, "Please enter both username and password.", "danger");
        }
        setLoading(btn, btnText, true);
        try {
            const res = await api.login({ UserId, Password });
            if (res.sStatus === "Success") {
                window.location.href = "dashboard.html";   // built next
            } else {
                showAlert(alertBox, res.message || "Invalid username or password.", "danger");
            }
        } catch (err) {
            showAlert(alertBox, "Could not reach the server. Please try again.", "danger");
        } finally {
            setLoading(btn, btnText, false);
        }
    });

    /* Forgot-password modal */
    const modal = $("#forgotModal");
    $("#forgotLink").addEventListener("click", (e) => { e.preventDefault(); modal.classList.add("open"); });
    modal.querySelectorAll("[data-close]").forEach((el) =>
        el.addEventListener("click", () => modal.classList.remove("open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.classList.remove("open"); });

    $("#forgotSend").addEventListener("click", async () => {
        const email = $("#forgotEmail").value.trim();
        const fa = $("#forgotAlert");
        hide(fa);
        if (!email) return showAlert(fa, "Please enter your email.", "danger");
        const res = await api.forgotPassword(email);
        if (res.ok) showAlert(fa, "Recovery link sent! Check your inbox.", "success");
        else showAlert(fa, res.demo ? "UI preview — sending not wired yet." : "Email not registered.", "danger");
    });
});

/* ---- helpers ---- */
function showAlert(el, msg, kind) {
    el.textContent = msg;
    el.className = `alert alert-${kind}`;
}
function hide(el) { el.classList.add("hide"); }
function setLoading(btn, textEl, on) {
    btn.disabled = on;
    textEl.innerHTML = on
        ? '<i class="fa-solid fa-spinner spin"></i> Signing in…'
        : '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
}
