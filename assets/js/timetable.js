/* ============================================================
   Timetable calendar
     • Day   — agenda list (day switcher)
     • Week  — day-by-day timeline list (week switcher)
     • Month — month calendar (left) + selected-day list (right)
   Demo data is a weekly recurring schedule; wire to the API by
   replacing eventsForDate().
   ============================================================ */
(function () {
    const COURSE_COLOR = {
        "Design Studio III": "#7c4dff",
        "History of Architecture": "#0ea5e9",
        "Materials & Methods": "#16a34a",
        "Digital Visualization": "#f59e0b",
        "Principles of Management": "#ec4899",
        "Financial Accounting II": "#0e7490",
    };
    const color = (t) => COURSE_COLOR[t] || "#1565c0";

    const WEEKLY = [
        { dow: 0, s: "09:00", e: "10:50", t: "Design Studio III", g: "BIDES-4 · Studio", loc: "Block A / 2nd Floor / Studio B-204", fac: "Dr. Layla Hassan", type: "Studio" },
        { dow: 0, s: "13:00", e: "14:30", t: "Digital Visualization", g: "BIDES-4", loc: "Block C / Computer Lab 2", fac: "Mr. Adil Khan", type: "Lab" },
        { dow: 1, s: "11:00", e: "12:30", t: "History of Architecture", g: "BIDES-4", loc: "Block A / 1st Floor / Room A-110", fac: "Prof. Omar Said", type: "Lecture" },
        { dow: 1, s: "14:00", e: "15:30", t: "Materials & Methods", g: "BIDES-4", loc: "Block C / Lab C-3", fac: "Dr. Mariam Noor", type: "Lab" },
        { dow: 2, s: "10:00", e: "12:00", t: "Design Studio III", g: "BIDES-4 · Studio", loc: "Block A / 2nd Floor / Studio B-204", fac: "Dr. Layla Hassan", type: "Studio" },
        { dow: 2, s: "15:10", e: "17:20", t: "Principles of Management", g: "Principles of Management Evening", loc: "Block / Second Floor / LR220", fac: "Haniyeh Hafezniya", type: "Lecture" },
        { dow: 3, s: "09:00", e: "10:30", t: "Materials & Methods", g: "BIDES-4", loc: "Block C / Lab C-3", fac: "Dr. Mariam Noor", type: "Lab" },
        { dow: 3, s: "18:00", e: "21:00", t: "Financial Accounting II", g: "Financial Accounting II Evening", loc: "Block / First Floor / LR110", fac: "Ganga Bhavani Maddula", type: "Lecture" },
        { dow: 4, s: "11:00", e: "12:30", t: "History of Architecture", g: "BIDES-4", loc: "Block A / 1st Floor / Room A-110", fac: "Prof. Omar Said", type: "Lecture" },
        { dow: 4, s: "13:00", e: "15:00", t: "Digital Visualization", g: "BIDES-4", loc: "Block C / Computer Lab 2", fac: "Mr. Adil Khan", type: "Lab" },
    ];
    const eventsForDate = (d) => WEEKLY.filter((w) => w.dow === d.getDay()).slice().sort((a, b) => toMin(a.s) - toMin(b.s));

    /* ---- helpers ---- */
    const pad = (n) => String(n).padStart(2, "0");
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const parseYmd = (s) => { const [y, m, dd] = s.split("-").map(Number); return new Date(y, m - 1, dd); };
    const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
    const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
    const startOfWeek = (d) => addDays(d, -d.getDay());
    const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const fmt12 = (t) => { let [h, m] = t.split(":").map(Number); const p = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${pad(m)} ${p}`; };
    const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const fullDate = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const durStr = (s, e) => { const m = toMin(e) - toMin(s); const h = Math.floor(m / 60), mm = m % 60; return (h ? h + "h" : "") + (mm ? (h ? " " : "") + mm + "m" : "") || "0m"; };

    const TODAY = new Date();
    let view = window.matchMedia("(max-width: 920px)").matches ? "day" : "week";
    let cur = new Date(TODAY);        // reference date for the active view
    let selected = new Date(TODAY);   // selected day (month view)

    const $ = (s) => document.querySelector(s);
    let ROWS = [];   // click registry: data-id -> { ev, date }

    /* ---- shared agenda list (flat, hairline-separated rows) ---- */
    function agendaList(d) {
        const evs = eventsForDate(d);
        if (!evs.length) return `<div class="agenda__empty"><i class="ph ph-coffee"></i>No classes scheduled.</div>`;
        return `<div class="agenda__list">` + evs.map((ev) => {
            const c = color(ev.t);
            const id = ROWS.push({ ev, date: new Date(d) }) - 1;
            return `<div class="aitem" data-id="${id}" role="button" tabindex="0">
                <div class="aitem__time"><b>${fmt12(ev.s)}</b><span>${fmt12(ev.e)}</span></div>
                <div class="aitem__main" style="--ac:${c}">
                    <div class="aitem__title">${esc(ev.t)}<span class="aitem__tag" style="color:${c};background:${c}1f">${esc(ev.type)}</span></div>
                    <div class="aitem__meta">
                        <span><i class="ph ph-users-three"></i>${esc(ev.g)}</span>
                        <span><i class="ph ph-map-pin"></i>${esc(ev.loc)}</span>
                        <span><i class="ph ph-chalkboard-teacher"></i>${esc(ev.fac)}</span>
                    </div>
                </div>
            </div>`;
        }).join("") + `</div>`;
    }

    /* ---- DAY ---- */
    function renderDay() {
        return `<div class="agenda"><div class="agenda__date">${cur.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>${agendaList(cur)}</div>`;
    }

    /* ---- WEEK (day-by-day list; full-line date header per day) ---- */
    function renderWeek() {
        const ws = startOfWeek(cur);
        let h = `<div class="wlist">`;
        for (let i = 0; i < 7; i++) {
            const d = addDays(ws, i), today = sameDay(d, TODAY);
            h += `<div class="wsec ${today ? "is-today" : ""}">
                <div class="wsec__head">
                    <span class="wsec__date">${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                    ${today ? `<span class="wsec__tag">Today</span>` : ""}
                </div>
                ${agendaList(d)}
            </div>`;
        }
        return h + `</div>`;
    }

    /* ---- MONTH (calendar + selected-day list) ---- */
    function monthCal() {
        const y = cur.getFullYear(), m = cur.getMonth();
        const start = addDays(new Date(y, m, 1), -new Date(y, m, 1).getDay());
        let h = `<div class="mcal"><div class="mcal__head">${DOW.map((d) => `<span>${d[0]}</span>`).join("")}</div><div class="mcal__grid">`;
        for (let i = 0; i < 42; i++) {
            const d = addDays(start, i), out = d.getMonth() !== m, today = sameDay(d, TODAY), sel = sameDay(d, selected), n = eventsForDate(d).length;
            h += `<button class="mcell ${out ? "is-out" : ""} ${today ? "is-today" : ""} ${sel ? "is-sel" : ""}" data-date="${ymd(d)}">
                <span class="mcell__n">${d.getDate()}</span>${n ? `<i class="mcell__dot"></i>` : ""}</button>`;
        }
        return h + `</div></div>`;
    }
    function renderMonth() {
        return `<div class="msplit">
            <div class="msplit__cal">${monthCal()}</div>
            <div class="msplit__day"><div class="agenda"><div class="agenda__date">${selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>${agendaList(selected)}</div></div>
        </div>`;
    }

    function title() {
        // Day view: the list already shows the day + date, so no toolbar title.
        if (view === "day") return "";
        if (view === "month") return `${MON[cur.getMonth()]} ${cur.getFullYear()}`;
        const ws = startOfWeek(cur), we = addDays(ws, 6);
        return sameMonth(ws, we)
            ? `${MON[ws.getMonth()].slice(0, 3)} ${ws.getDate()} – ${we.getDate()}, ${we.getFullYear()}`
            : `${MON[ws.getMonth()].slice(0, 3)} ${ws.getDate()} – ${MON[we.getMonth()].slice(0, 3)} ${we.getDate()}, ${we.getFullYear()}`;
    }

    function render() {
        const lbl = $("#viewLabel"); if (lbl) lbl.textContent = view[0].toUpperCase() + view.slice(1);
        document.querySelectorAll(".cal__menu-item").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
        $("#calTitle").textContent = title();
        const body = $("#calBody");
        ROWS = [];
        body.innerHTML = view === "month" ? renderMonth() : view === "week" ? renderWeek() : renderDay();
        if (view === "month") {
            body.querySelectorAll(".mcell").forEach((el) => el.addEventListener("click", () => { selected = parseYmd(el.dataset.date); if (!sameMonth(selected, cur)) cur = new Date(selected); render(); }));
        }
    }

    function step(dir) {
        if (view === "day") cur = addDays(cur, dir);
        else if (view === "week") cur = addDays(cur, dir * 7);
        else { cur = new Date(cur.getFullYear(), cur.getMonth() + dir, 1); selected = sameMonth(TODAY, cur) ? new Date(TODAY) : new Date(cur); }
        render();
    }

    function setView(v) {
        view = v;
        if (v === "month" && !sameMonth(selected, cur)) selected = sameMonth(TODAY, cur) ? new Date(TODAY) : new Date(cur);
        render();
    }

    /* ---- event details drawer / bottom sheet ---- */
    const drawer = () => $("#evDrawer");
    function closeDetail() { drawer()?.classList.remove("is-open", "is-expanded"); drawer()?.setAttribute("aria-hidden", "true"); }
    function openDetail(ev, date) {
        const c = color(ev.t);
        $("#evBody").innerHTML = `
            <header class="evd__head" style="--ac:${c}">
                <span class="evd__type">${esc(ev.type)}</span>
                <h3 class="evd__title">${esc(ev.t)}</h3>
                <div class="evd__when"><i class="ph-bold ph-calendar-blank"></i>${fullDate(date)}</div>
            </header>
            <div class="evd__rows">
                <div class="evd__row"><i class="ph-bold ph-clock"></i><div><span>Time</span><b>${fmt12(ev.s)} – ${fmt12(ev.e)} · ${durStr(ev.s, ev.e)}</b></div></div>
                <div class="evd__row"><i class="ph-bold ph-users-three"></i><div><span>Group / Batch</span><b>${esc(ev.g)}</b></div></div>
                <div class="evd__row"><i class="ph-bold ph-map-pin"></i><div><span>Location</span><b>${esc(ev.loc)}</b></div></div>
                <div class="evd__row"><i class="ph-bold ph-chalkboard-teacher"></i><div><span>Faculty</span><b>${esc(ev.fac)}</b></div></div>
            </div>
            <footer class="evd__actions">
                <button class="evd__btn evd__btn--primary"><i class="ph-bold ph-bell-ringing"></i>Set reminder</button>
                <button class="evd__btn"><i class="ph-bold ph-map-trifold"></i>Directions</button>
            </footer>`;
        drawer()?.classList.add("is-open");
        drawer()?.setAttribute("aria-hidden", "false");
    }

    document.addEventListener("DOMContentLoaded", () => {
        $("#calPrev")?.addEventListener("click", () => step(-1));
        $("#calNext")?.addEventListener("click", () => step(1));

        /* single control: view dropdown (desktop) / bottom sheet (mobile),
           with a "Jump to today" action folded into the same menu */
        const dd = $("#viewDd"), btn = $("#viewBtn");
        const closeDd = () => { dd?.classList.remove("is-open"); btn?.setAttribute("aria-expanded", "false"); };
        const openDd = () => { dd?.classList.add("is-open"); btn?.setAttribute("aria-expanded", "true"); };
        btn?.addEventListener("click", (e) => { e.stopPropagation(); dd.classList.contains("is-open") ? closeDd() : openDd(); });
        $("#calToday")?.addEventListener("click", () => { cur = new Date(TODAY); selected = new Date(TODAY); render(); closeDd(); });
        document.querySelectorAll(".cal__menu-item[data-view]").forEach((b) => b.addEventListener("click", () => { setView(b.dataset.view); closeDd(); }));
        $("#viewScrim")?.addEventListener("click", closeDd);
        document.addEventListener("click", (e) => { if (dd && !dd.contains(e.target)) closeDd(); });

        /* open the details panel when a class row is clicked */
        const openRow = (it) => { const row = ROWS[+it.dataset.id]; if (row) openDetail(row.ev, row.date); };
        $("#calBody")?.addEventListener("click", (e) => { const it = e.target.closest(".aitem"); if (it) openRow(it); });
        $("#calBody")?.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.closest(".aitem")) { e.preventDefault(); openRow(e.target.closest(".aitem")); } });
        $("#evClose")?.addEventListener("click", closeDetail);
        $("#evScrim")?.addEventListener("click", closeDetail);
        $("#evHandle")?.addEventListener("click", () => drawer()?.classList.toggle("is-expanded"));

        document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDd(); closeDetail(); } });

        render();
    });
})();
