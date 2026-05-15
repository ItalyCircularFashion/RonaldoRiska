const siteState = {
  activeProjectFilter: "all",
};

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("[data-nav-menu]");
const currentYear = document.querySelector("[data-current-year]");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-category]");
const revealItems = document.querySelectorAll(".reveal");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("is-open", !isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
    }
  });
}

const updateProjectFilter = (filter) => {
  siteState.activeProjectFilter = filter;

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });

  projectCards.forEach((card) => {
    const categories = card.dataset.category?.split(" ") ?? [];
    const isVisible = filter === "all" || categories.includes(filter);
    card.classList.toggle("is-hidden", !isVisible);
  });
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateProjectFilter(button.dataset.filter ?? "all");
  });
});

const revealImmediately = () => {
  revealItems.forEach((item) => item.classList.add("is-visible"));
};

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealImmediately();
}

// Future extension: mount data modules here, for example MRP/MPS dashboard,
// textile calculators, KPI analytics, or project content loaded from JSON.
window.portfolioModules = {
  register(name, init) {
    if (typeof init === "function") {
      init({ header, state: siteState });
    }
  },
};
