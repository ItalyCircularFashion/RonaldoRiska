const Router = (() => {

  const state = {
    route: null,
    projectId: null,
    category: null
  };

  const listeners = [];

  const emit = () => {
    listeners.forEach(fn => fn(state));
  };

  const parseUrl = () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // 1. PROGETTO
    const matchProject = path.match(/progetti\/([^\/]+)\.html$/);
    const projectId = matchProject?.[1] || params.get("id");

    if (projectId) {
      return { route: "project", projectId };
    }

    // 2. CATEGORIA
    const page = path.split("/").pop();

    const map = {
      "tessitura.html": "tessitura",
      "cad-moda.html": "cad",
      "supply-chain-production.html": "supply",
      "curriculum.html": "curriculum"
    };

    if (map[page]) {
      return { route: "category", category: map[page] };
    }

    // 3. HOME
    return { route: "home" };
  };

  const setState = (newState) => {
    state.route = newState.route;
    state.projectId = newState.projectId || null;
    state.category = newState.category || null;
    emit();
  };

  const navigate = (url) => {
    history.pushState({}, "", url);
    setState(parseUrl());
  };

  const goProject = (id) => navigate(`progetto.html?id=${id}`);
  const goCategory = (key) => {
    const map = {
      tessitura: "tessitura.html",
      cad: "cad-moda.html",
      supply: "supply-chain-production.html",
      curriculum: "curriculum.html"
    };
    navigate(map[key]);
  };
  const goHome = () => navigate("index.html");

  const init = () => {

    // inizializza stato iniziale
    setState(parseUrl());

    // back/forward browser
    window.addEventListener("popstate", () => {
      setState(parseUrl());
      window.scrollTo({ top: 0 });
    });

    // click interception globale
    document.body.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href) return;

      // PROGETTI
      if (href.includes("progetto.html?id=")) {
        e.preventDefault();
        const id = new URL(href, location.href).searchParams.get("id");
        goProject(id);
      }

      // CATEGORIE
      else if (href.includes("tessitura.html")) {
        e.preventDefault();
        goCategory("tessitura");
      }
      else if (href.includes("cad-moda.html")) {
        e.preventDefault();
        goCategory("cad");
      }
      else if (href.includes("supply-chain-production.html")) {
        e.preventDefault();
        goCategory("supply");
      }

      // HOME
      else if (href === "index.html" || href === "#" || href === "./") {
        e.preventDefault();
        goHome();
      }
    });
  };

  const onChange = (fn) => listeners.push(fn);

  return {
    init,
    onChange,
    goProject,
    goCategory,
    goHome,
    state: () => state
  };

})();
