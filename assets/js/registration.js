/* ============================================================
   Registration — multi-step wizard controller
     • step navigation + stepper / mobile progress
     • per-step required-field validation
     • file upload display, email verify, OTP, family Edit toggle
   Wire to the API by POSTing the collected form data on submit.
   ============================================================ */
(function () {
    const STEPS = ["Basic Information", "Family & Other Information", "Qualification Information", "Work Experience", "Documents"];
    const TOTAL = STEPS.length;
    let cur = 0;

    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));
    const panels = $$(".reg-step");
    const stepEls = $$(".wiz-step");
    const vstepEls = $$(".wiz-vstep");

    function showPanel(key) {
        panels.forEach((p) => p.classList.toggle("is-active", p.dataset.step === String(key)));
    }

    // update a set of step indicators (top or side)
    function paint(list, numSel) {
        list.forEach((el, i) => {
            el.classList.toggle("is-active", i === cur);
            el.classList.toggle("is-done", i < cur);
            const num = el.querySelector(numSel);
            if (num) num.innerHTML = i < cur ? '<i class="ph-bold ph-check"></i>' : (i + 1);
        });
    }

    function render() {
        showPanel(cur);
        paint(stepEls, ".wiz-step__num");
        paint(vstepEls, ".wiz-vstep__num");
        // mobile progress
        $("#miniTitle").textContent = STEPS[cur];
        $("#miniCount").textContent = `Step ${cur + 1} of ${TOTAL}`;
        $("#miniBar").style.width = `${((cur + 1) / TOTAL) * 100}%`;
        // nav
        $("#btnPrev").disabled = cur === 0;
        $("#btnNext").innerHTML = cur === TOTAL - 1
            ? 'Submit registration <i class="ph-bold ph-check"></i>'
            : 'Next <i class="ph-bold ph-caret-right"></i>';
        $(".content").scrollTop = 0;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // validate required, editable (non-disabled) fields in the active panel
    function validateStep() {
        const panel = panels[cur];
        let ok = true, first = null;
        panel.querySelectorAll("[required]").forEach((el) => {
            if (el.disabled) return;
            const bad = !String(el.value || "").trim();
            const fld = el.closest(".fld");
            fld && fld.classList.toggle("fld--error", bad);
            if (bad) { ok = false; first = first || el; }
        });
        if (first) first.focus();
        return ok;
    }

    function goTo(i) {
        if (i > cur && !validateStep()) return;       // Next button gates forward moves on validation
        cur = Math.max(0, Math.min(TOTAL - 1, i));
        render();
    }

    // free navigation via the step tabs (no validation block)
    function jump(i) { cur = Math.max(0, Math.min(TOTAL - 1, i)); render(); }

    function submit() {
        if (!validateStep()) return;
        showPanel("done");
        [...stepEls, ...vstepEls].forEach((el) => {
            el.classList.add("is-done"); el.classList.remove("is-active");
            const num = el.querySelector(".wiz-step__num, .wiz-vstep__num");
            if (num) num.innerHTML = '<i class="ph-bold ph-check"></i>';
        });
        $("#wizNav").style.display = "none";
        $("#wizMini") && ($("#wizMini").style.display = "none");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.addEventListener("DOMContentLoaded", () => {
        $("#btnPrev").addEventListener("click", () => goTo(cur - 1));
        $("#btnNext").addEventListener("click", () => (cur === TOTAL - 1 ? submit() : goTo(cur + 1)));
        [...stepEls, ...vstepEls].forEach((el) => el.addEventListener("click", () => jump(+el.dataset.go)));

        // layout toggle: top stepper <-> left side rail
        $$("#regLayout button").forEach((b) => b.addEventListener("click", () => {
            $("#regCard").classList.toggle("is-side", b.dataset.layout === "side");
            $$("#regLayout button").forEach((x) => x.classList.toggle("is-active", x === b));
        }));

        // clear error styling as the user types/selects
        $("#regForm").addEventListener("input", (e) => { const f = e.target.closest(".fld"); f && f.classList.remove("fld--error"); });

        // document rows: upload / replace trigger the file dialog; verified rows are locked
        $$(".doc").forEach((doc) => {
            const input = doc.querySelector('input[type=file]');
            doc.querySelectorAll('[data-act="upload"], [data-act="replace"]').forEach((btn) =>
                btn.addEventListener("click", (e) => { e.preventDefault(); input && input.click(); }));
            input && input.addEventListener("change", () => {
                if (!input.files || !input.files.length) return;
                doc.classList.remove("is-pending");
                doc.classList.add("is-uploaded");
                doc.querySelector(".doc__ico i").className = "ph-bold ph-file-text";
                doc.querySelector(".doc__badge").innerHTML = '<i class="ph-bold ph-clock"></i> In review';
                doc.querySelector(".doc__file").textContent = input.files[0].name;
            });
        });

        // email verify / OTP (demo feedback)
        $$("[data-verify]").forEach((btn) => btn.addEventListener("click", () => {
            const ok = btn.closest(".fld").querySelector(".ok");
            if (ok) ok.textContent = "Verified";
            btn.dataset.verify === "otp" ? (btn.textContent = "OTP sent") : btn.classList.add("is-sent");
            setTimeout(() => { if (btn.dataset.verify === "otp") btn.textContent = "Send OTP"; }, 2500);
        }));

        // per-card Edit toggles (Father / Mother) — unlock just that card's fields
        $$(".reg-group__edit").forEach((btn) => btn.addEventListener("click", () => {
            const grp = btn.closest(".reg-group");
            const editing = btn.classList.toggle("is-editing");
            grp.querySelectorAll(".fld__control").forEach((el) => (el.readOnly = !editing));
            btn.innerHTML = editing ? '<i class="ph-bold ph-check"></i> Done' : '<i class="ph-bold ph-pencil-simple"></i> Edit';
            if (editing) { const f = grp.querySelector(".fld__control"); f && f.focus(); }
        }));

        render();
    });
})();
