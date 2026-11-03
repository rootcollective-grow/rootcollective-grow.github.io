// Guides menu in the header: close it when you click somewhere else or press Escape.
document.querySelectorAll(".nav-guides").forEach((menu) => {
  document.addEventListener("click", (e) => { if (!menu.contains(e.target)) menu.open = false; });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
  });
});

// Gentle animations for every page.
// Things fade and slide into view as you scroll down to them.
// If someone has asked their device to reduce motion, nothing moves.
(function () {
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm || !("IntersectionObserver" in window)) return;

  // Which things should animate in, smallest pieces first.
  // Items in the same list appear one after another.
  const targets = [
    ".methods > .method", ".basics > .basic", ".showcase > .setup", ".pillars > li", ".audience > li",
    ".steps > li", ".supply-list > li", ".problems > dt", ".faq > details", ".share-steps > li",
    ".safety-list > li", ".path-links > a", ".promise-strip > li",
    ".before-box", ".grow-demo-page", ".light-day", ".food-strength", ".light-options > div", ".ph-scale", ".ph-table-wrap",
    ".section > .eyebrow", ".section > h2", ".section > .lead", ".section > p", ".section-join > *",
    ".split > div > .eyebrow", ".split > div > h2", ".split > div > p", ".split > div"
  ];
  const seen = new Set();
  targets.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (seen.has(el) || el.closest(".hero")) return;
      // Skip anything inside (or around) something already animating, so nothing fades twice.
      for (const other of seen) if (other.contains(el) || el.contains(other)) return;
      seen.add(el);
    });
  });

  const items = Array.from(seen);
  items.forEach((el) => {
    // Stagger siblings a little so lists ripple in.
    const sibs = Array.from(el.parentElement.children).filter((c) => seen.has(c));
    const i = Math.min(sibs.indexOf(el), 6);
    el.style.setProperty("--reveal-delay", i * 70 + "ms");
    el.classList.add("reveal");
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach((el) => io.observe(el));

  // Safety net: if anything is still hidden after a few seconds (old browser, odd frame), show it.
  setTimeout(() => items.forEach((el) => el.classList.add("is-visible")), 4000);
})();
