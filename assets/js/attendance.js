/* ============================================================
   Attendance
     • Overall summary (ring + figures)
     • Per-course list (code, name, faculty, held/attended, %)
     • Per-course detail drawer (desktop) / bottom sheet (mobile)
       with the session-by-session log (Date · Timing · Group · status)
   Demo data mirrors the live portal's data points. Wire to the API
   by replacing COURSES / its sessions.
   ============================================================ */
(function () {
    const COURSES = [
        { code: "ACCT120", name: "Financial Accounting II", fac: "Ganga Bhavani Maddula", held: 14, attended: 14, time: "6:00 PM – 9:00 PM", group: "Financial Accounting II Evening" },
        { code: "MGMT120", name: "Principles of Management", fac: "Haniyeh Hafezniya", held: 16, attended: 15, time: "3:10 PM – 5:20 PM", group: "Principles of Management Evening" },
        { code: "MRKT120", name: "Principles of Marketing", fac: "Shahzia Khan", held: 14, attended: 12, time: "1:00 PM – 3:00 PM", group: "Principles of Marketing" },
        { code: "ARCH210", name: "History of Architecture", fac: "Prof. Omar Said", held: 13, attended: 9, time: "11:00 AM – 12:30 PM", group: "BIDES-4" },
        { code: "DSGN230", name: "Design Studio III", fac: "Dr. Layla Hassan", held: 22, attended: 18, time: "9:00 AM – 10:50 AM", group: "BIDES-4 · Studio" },
    ];

    /* ---- helpers ---- */
    const pct = (c) => Math.round((c.attended / c.held) * 100);
    const standing = (p) => (p >= 85 ? "good" : p >= 75 ? "warn" : "low");
    const standingLabel = { good: "On track", warn: "Watch", low: "At risk" };
    const pad = (n) => String(n).padStart(2, "0");
    const fmtDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
    const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const $ = (s) => document.querySelector(s);

    // build a deterministic session log; the most recent (held-attended) are marked absent
    function sessions(c) {
        const out = []; let d = new Date(2026, 1, 4); // 04 Feb 2026
        for (let i = 0; i < c.held; i++) { out.push({ date: fmtDate(d), time: c.time, group: c.group, present: true }); d = addDays(d, 7); }
        for (let i = 0; i < c.held - c.attended; i++) out[out.length - 1 - i].present = false;
        return out;
    }

    /* ---- overall summary ---- */
    function renderSummary() {
        const held = COURSES.reduce((s, c) => s + c.held, 0);
        const att = COURSES.reduce((s, c) => s + c.attended, 0);
        const p = Math.round((att / held) * 100);
        const risk = COURSES.filter((c) => pct(c) < 75).length;
        const st = standing(p);
        const col = { good: "#16a34a", warn: "#d97706", low: "#dc2626" }[st];
        $("#attSum").innerHTML = `
            <div class="att-ring" style="--p:${p};--ac:${col}">
                <div class="att-ring__in"><span class="att-ring__pct">${p}%</span><span class="att-ring__lbl">Overall</span></div>
            </div>
            <div class="att-sum__info">
                <div class="att-sum__status" style="color:${col}"><i class="ph-bold ph-seal-check"></i>${standingLabel[st]}</div>
                <p class="att-sum__note">${risk ? `${risk} course${risk > 1 ? "s" : ""} below the 75% threshold — keep an eye on these.` : "You're above the 75% requirement in every course."}</p>
                <div class="att-facts">
                    <div class="att-fact"><b>${COURSES.length}</b><span>Courses</span></div>
                    <div class="att-fact"><b>${held}</b><span>Lectures held</span></div>
                    <div class="att-fact"><b>${att}</b><span>Attended</span></div>
                    <div class="att-fact"><b>${held - att}</b><span>Missed</span></div>
                </div>
            </div>`;
    }

    /* ---- course list ---- */
    function renderList() {
        $("#attList").innerHTML = COURSES.map((c, i) => {
            const p = pct(c), st = standing(p);
            return `<div class="acard" data-id="${i}" role="button" tabindex="0">
                <span class="acard__code">${esc(c.code)}</span>
                <div class="acard__main">
                    <div class="acard__name">${esc(c.name)}</div>
                    <div class="acard__fac"><i class="ph ph-chalkboard-teacher"></i>${esc(c.fac)}</div>
                    <div class="acard__bar ${st}"><span style="width:${p}%"></span></div>
                </div>
                <div class="acard__right">
                    <span class="acard__pct ${st}">${p}%</span>
                    <span class="acard__count">${c.attended}/${c.held}</span>
                </div>
                <i class="acard__chev ph-bold ph-caret-right"></i>
            </div>`;
        }).join("");
    }

    /* ---- detail drawer / bottom sheet ---- */
    const sheet = () => $("#detSheet");
    let curSes = [], curFilter = "all";
    function closeDetail() { sheet()?.classList.remove("is-open", "is-expanded"); sheet()?.setAttribute("aria-hidden", "true"); }

    function sessionRows(ses, filter) {
        const f = filter === "all" ? ses : ses.filter((s) => (filter === "present" ? s.present : !s.present));
        if (!f.length) return `<div class="dses__empty"><i class="ph ph-tray"></i>No ${esc(filter)} sessions.</div>`;
        return f.map((s) => `<div class="dses">
            <div class="dses__l">
                <div class="dses__date">${esc(s.date)}</div>
                <div class="dses__sub">${esc(s.time)} · ${esc(s.group)}</div>
            </div>
            <span class="dses__pill ${s.present ? "present" : "absent"}"><i class="ph-bold ${s.present ? "ph-check" : "ph-x"}"></i>${s.present ? "Present" : "Absent"}</span>
        </div>`).join("");
    }

    function openDetail(c) {
        const p = pct(c), st = standing(p);
        const col = { good: "#16a34a", warn: "#d97706", low: "#dc2626" }[st];
        const ses = sessions(c); curSes = ses; curFilter = "all";
        const present = ses.filter((s) => s.present).length, absent = ses.length - present;
        $("#detBody").innerHTML = `
            <header class="dsheet__head">
                <span class="dsheet__code">${esc(c.code)}</span>
                <h3 class="dsheet__title">${esc(c.name)}</h3>
                <div class="dsheet__fac"><i class="ph-bold ph-chalkboard-teacher"></i>${esc(c.fac)}</div>
                <div class="dsheet__pct" style="--ac:${col}">${p}<small>%</small></div>
            </header>
            <div class="dsum">
                <div class="dsum__item"><b>${c.held}</b><span>Held</span></div>
                <div class="dsum__item"><b class="good">${c.attended}</b><span>Attended</span></div>
                <div class="dsum__item"><b class="low">${c.held - c.attended}</b><span>Missed</span></div>
            </div>
            <div class="dfilter" role="tablist" aria-label="Filter sessions">
                <button class="dfilter__chip is-active" data-f="all" role="tab">All <span>${ses.length}</span></button>
                <button class="dfilter__chip" data-f="present" role="tab">Present <span>${present}</span></button>
                <button class="dfilter__chip" data-f="absent" role="tab">Absent <span>${absent}</span></button>
            </div>
            <div class="dses__list" id="dsesList">${sessionRows(ses, "all")}</div>`;

        $("#detBody").querySelectorAll(".dfilter__chip").forEach((ch) => ch.addEventListener("click", () => {
            curFilter = ch.dataset.f;
            $("#detBody").querySelectorAll(".dfilter__chip").forEach((x) => x.classList.toggle("is-active", x === ch));
            $("#dsesList").innerHTML = sessionRows(curSes, curFilter);
        }));

        sheet()?.classList.add("is-open");
        sheet()?.setAttribute("aria-hidden", "false");
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderSummary();
        renderList();

        const open = (el) => { const c = COURSES[+el.dataset.id]; if (c) openDetail(c); };
        $("#attList")?.addEventListener("click", (e) => { const el = e.target.closest(".acard"); if (el) open(el); });
        $("#attList")?.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.closest(".acard")) { e.preventDefault(); open(e.target.closest(".acard")); } });
        $("#detClose")?.addEventListener("click", closeDetail);
        $("#detScrim")?.addEventListener("click", closeDetail);
        $("#detHandle")?.addEventListener("click", () => sheet()?.classList.toggle("is-expanded"));
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });
    });
})();
