/* Hero interactions: mouse-parallax depth on the constellation. */
document.addEventListener("DOMContentLoaded", () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = document.getElementById("constellation");
    if (!el || reduce) return;

    const hero = el.closest(".hero");
    let raf = null;
    hero.addEventListener("mousemove", (e) => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;   // -0.5..0.5
        const dy = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            el.style.transform = `translate(${dx * 26}px, ${dy * 26}px)`;
        });
    });
    hero.addEventListener("mouseleave", () => { el.style.transform = ""; });
});
