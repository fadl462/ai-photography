/* HotFoto AI V49.9 — canonical public navigation
   Ensures every public marketing/workspace page exposes the same core menu. */
(() => {
  const canonical = [
    ["Platform","platform.html"],
    ["Workflow","workflow.html"],
    ["Projects","projects.html"],
    ["AI Studio","studio.html"],
    ["Pricing","pricing.html"]
  ];
  const apply = () => {
    const nav = document.querySelector("header.nav nav");
    if (!nav) return;
    const current = location.pathname.split("/").pop() || "index.html";
    nav.innerHTML = canonical.map(([label,href]) =>
      `<a href="${href}" class="${current === href ? "active" : ""}">${label}</a>`
    ).join("");
  };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",apply,{once:true});
  else apply();
})();
