/* Dashboard: mobile sidebar drawer + animated stat counters. */
/* ---- Theme: apply saved preference ASAP (before paint) ---- */
(function () {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
})();

document.addEventListener("DOMContentLoaded", () => {
    /* ---- Render any Lucide icons (data-lucide="...") ---- */
    if (window.lucide) lucide.createIcons();

    /* ---- Light / dark theme toggle ---- */
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const syncTheme = () => {
        const dark = document.documentElement.getAttribute("data-theme") === "dark";
        // light theme → moon (dark icon); dark theme → sun (light icon)
        if (themeIcon) themeIcon.className = dark ? "ph-bold ph-sun" : "ph-bold ph-moon";
        if (themeToggle) themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    };
    syncTheme();
    themeToggle?.addEventListener("click", () => {
        const dark = document.documentElement.getAttribute("data-theme") === "dark";
        if (dark) { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("theme", "light"); }
        else { document.documentElement.setAttribute("data-theme", "dark"); localStorage.setItem("theme", "dark"); }
        syncTheme();
    });

    /* ---- Sidebar: drawer on mobile, collapse on desktop ---- */
    const app = document.querySelector(".app");
    const sidebar = document.getElementById("sidebar");
    const scrim = document.getElementById("scrim");
    const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

    const openDrawer = () => { sidebar.classList.add("open"); scrim.classList.add("show"); };
    const closeDrawer = () => { sidebar.classList.remove("open"); scrim.classList.remove("show"); };

    // restore collapsed preference
    if (localStorage.getItem("sb-collapsed") === "1") app.classList.add("is-collapsed");

    document.getElementById("hamburger")?.addEventListener("click", () => {
        if (isDesktop()) {
            app.classList.toggle("is-collapsed");
            localStorage.setItem("sb-collapsed", app.classList.contains("is-collapsed") ? "1" : "0");
        } else {
            openDrawer();
        }
    });
    document.getElementById("sidebarClose")?.addEventListener("click", closeDrawer);
    document.getElementById("drawerBtn")?.addEventListener("click", openDrawer);   // mobile avatar opens full menu
    scrim?.addEventListener("click", closeDrawer);

    // sidebar chevron (beside logo) — collapse on desktop
    document.getElementById("sbToggle")?.addEventListener("click", () => {
        app.classList.toggle("is-collapsed");
        localStorage.setItem("sb-collapsed", app.classList.contains("is-collapsed") ? "1" : "0");
    });
    // top-bar button — expand when the sidebar is collapsed
    document.getElementById("sbExpand")?.addEventListener("click", () => {
        app.classList.remove("is-collapsed");
        localStorage.setItem("sb-collapsed", "0");
    });

    /* ---- Collapsed-rail hover tooltips ---- */
    const tip = document.getElementById("sbTip");
    if (tip) {
        document.querySelectorAll(".nav__link, .sb-search, .sb-user").forEach((el) => {
            el.addEventListener("mouseenter", () => {
                if (!app.classList.contains("is-collapsed") || !isDesktop()) return;
                const label = el.dataset.tip || el.querySelector(".nav__text")?.textContent
                    || (el.classList.contains("sb-search") ? "Search" : el.textContent.trim());
                const r = el.getBoundingClientRect();
                tip.textContent = label;
                tip.style.top = (r.top + r.height / 2) + "px";
                tip.style.left = (r.right + 14) + "px";
                tip.classList.add("show");
            });
            el.addEventListener("mouseleave", () => tip.classList.remove("show"));
        });
    }

    /* ---- Profile dropdown (header) ---- */
    const profile = document.getElementById("profile");
    const profileBtn = document.getElementById("profileBtn");
    if (profile && profileBtn) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = profile.classList.toggle("open");
            profileBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
        document.addEventListener("click", (e) => {
            if (!profile.contains(e.target)) {
                profile.classList.remove("open");
                profileBtn.setAttribute("aria-expanded", "false");
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") { profile.classList.remove("open"); profileBtn.setAttribute("aria-expanded", "false"); }
        });
    }

    /* ---- Animated counters ---- */
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("[data-count]").forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const decimals = (el.dataset.decimals | 0);
        const suffix = el.dataset.suffix || "";
        const fmt = (n) => n.toFixed(decimals) + suffix;
        if (reduce) { el.textContent = fmt(target); return; }
        const dur = 1100, start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(target * eased);
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
});
