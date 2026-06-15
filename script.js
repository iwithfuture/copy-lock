const statFormatters = new WeakMap();

function formatStat(value, decimals) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function sortStatCards() {
  document.querySelectorAll("[data-sort-stats]").forEach((grid) => {
    [...grid.children]
      .sort((a, b) => Number(b.dataset.value || 0) - Number(a.dataset.value || 0))
      .forEach((card) => grid.appendChild(card));
  });
}

function animateStatNumber(el) {
  if (el.dataset.animated === "true") return;

  const target = Number(el.dataset.target || 0);
  const decimals = Number(el.dataset.decimals || 0);
  const suffix = el.dataset.suffix || "";
  const duration = 1500;
  const startTime = performance.now();
  el.dataset.animated = "true";

  if (!statFormatters.has(el)) {
    statFormatters.set(el, (value) => `${formatStat(value, decimals)}${suffix}`);
  }

  const render = (now) => {
    const elapsed = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    const current = target * eased;
    el.textContent = statFormatters.get(el)(current);

    if (elapsed < 1) {
      requestAnimationFrame(render);
    } else {
      el.textContent = statFormatters.get(el)(target);
    }
  };

  requestAnimationFrame(render);
}

function setupStatCounters() {
  const numbers = document.querySelectorAll(".stat-number");

  if (!("IntersectionObserver" in window)) {
    numbers.forEach(animateStatNumber);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(".stat-number").forEach(animateStatNumber);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll("[data-sort-stats]").forEach((grid) => observer.observe(grid));
}

document.addEventListener("DOMContentLoaded", () => {
  sortStatCards();
  setupStatCounters();
});
