const manifestUrl = "docs-manifest.json";

const state = {
  docs: [],
  activePath: "",
  query: "",
};

const elements = {
  navToggle: document.querySelector("#navToggle"),
  sidebar: document.querySelector("#sidebar"),
  docSearch: document.querySelector("#docSearch"),
  docNav: document.querySelector("#docNav"),
  libraryView: document.querySelector("#libraryView"),
  homeView: document.querySelector("#homeView"),
  docView: document.querySelector("#docView"),
  docCount: document.querySelector("#docCount"),
  docTitle: document.querySelector("#docTitle"),
  breadcrumb: document.querySelector("#breadcrumb"),
  docGroup: document.querySelector("#docGroup"),
  docPath: document.querySelector("#docPath"),
  markdownBody: document.querySelector("#markdownBody"),
  assetPanel: document.querySelector("#assetPanel"),
  toc: document.querySelector("#toc"),
  readingProgress: document.querySelector("#readingProgress"),
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const isSafeLink = (href) => !/^\s*javascript:/i.test(href);

function linkAttributes(href) {
  const safeHref = isSafeLink(href) ? escapeHtml(href) : "#";
  const isDocLink = href.replace(/^\.\//, "").startsWith("docs/") && href.split("#")[0].endsWith(".md");
  if (href.startsWith("#") || isDocLink) {
    return `href="${safeHref}"`;
  }
  return `href="${safeHref}" target="_blank" rel="noreferrer"`;
}

function inlineMarkdown(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    return `<a ${linkAttributes(href)}>${label}</a>`;
  });
  output = output.replace(/(^|[\s(])((?:https?:\/\/|mailto:)[^\s<)]+)/g, (_match, prefix, href) => {
    return `${prefix}<a ${linkAttributes(href)}>${href}</a>`;
  });
  return output;
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = null;
  let inCode = false;
  let code = [];

  const closeParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!list) return;
    html.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`);
    list = null;
  };

  for (const line of lines) {
    const fence = line.match(/^```/);
    if (fence && !inCode) {
      closeParagraph();
      closeList();
      inCode = true;
      code = [];
      continue;
    }
    if (fence && inCode) {
      html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      inCode = false;
      code = [];
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      closeParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1].length;
      const text = inlineMarkdown(heading[2].trim());
      const id = slugify(heading[2]);
      html.push(`<h${level} id="${id}">${text}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (bullet || ordered) {
      closeParagraph();
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        closeList();
        list = { type, items: [] };
      }
      list.items.push((bullet || ordered)[1]);
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote) {
      closeParagraph();
      closeList();
      html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    closeList();
    paragraph.push(line.trim());
  }

  closeParagraph();
  closeList();
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
}

function groupedDocs(docs) {
  return docs.reduce((groups, doc) => {
    groups[doc.group] = groups[doc.group] || [];
    groups[doc.group].push(doc);
    return groups;
  }, {});
}

function renderNav() {
  const docs = filteredDocs();
  const groups = groupedDocs(docs);

  elements.docNav.innerHTML = Object.entries(groups)
    .map(
      ([group, groupDocs]) => `
        <section class="nav-group">
          <h2 class="nav-group-title">${escapeHtml(group)}</h2>
          ${groupDocs
            .map(
              (doc) => `
                <a class="nav-link ${doc.path === state.activePath ? "active" : ""}" href="#/${doc.path}">
                  ${escapeHtml(doc.title)}
                </a>
              `,
            )
            .join("")}
        </section>
      `,
    )
    .join("");

  if (!docs.length) {
    elements.docNav.innerHTML = `<p class="empty-state">No documents matched your search.</p>`;
  }
}

function renderLibrary() {
  const docs = filteredDocs();
  elements.libraryView.innerHTML = docs
    .map(
      (doc) => `
        <a class="doc-card" href="#/${doc.path}">
          <small>${escapeHtml(doc.group)}</small>
          <strong>${escapeHtml(doc.title)}</strong>
        </a>
      `,
    )
    .join("");

  if (!docs.length) {
    elements.libraryView.innerHTML = `<p class="empty-state">No matching markdown files yet. Try a different search.</p>`;
  }
}

function filteredDocs() {
  const query = state.query.trim().toLowerCase();
  if (!query) return state.docs;
  return state.docs.filter((doc) => `${doc.title} ${doc.group} ${doc.path}`.toLowerCase().includes(query));
}

function buildToc() {
  const headings = [...elements.markdownBody.querySelectorAll("h2, h3")];
  if (!headings.length) {
    elements.toc.innerHTML = "";
    return;
  }
  elements.toc.innerHTML = `
    <p class="toc-title">On this page</p>
    ${headings
      .map(
        (heading) => `
          <a href="#${heading.id}" data-toc-id="${heading.id}">
            ${escapeHtml(heading.textContent)}
          </a>
        `,
      )
      .join("")}
  `;
  updateActiveToc();
}

function setActiveToc(id) {
  const links = [...elements.toc.querySelectorAll("[data-toc-id]")];
  links.forEach((link) => {
    const isActive = link.dataset.tocId === id;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveToc() {
  const headings = [...elements.markdownBody.querySelectorAll("h2, h3")];
  if (!headings.length || elements.docView.hidden) return;

  const offset = 130;
  let active = headings[0];
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= offset) {
      active = heading;
    } else {
      break;
    }
  }
  setActiveToc(active.id);
}

function assetKind(assetName) {
  const extension = assetName.split(".").pop();
  if (!extension || extension === assetName) return "File";
  return extension.toUpperCase();
}

function renderAssets(doc) {
  const assets = doc.assets || [];
  const suggestedFolder = doc.path.replace(/\/[^/]+$/, "/assets/");

  elements.assetPanel.innerHTML = `
    <div class="asset-panel-head">
      <p class="asset-title">Assets</p>
      <span>${assets.length}</span>
    </div>
    ${
      assets.length
        ? `<div class="asset-list">
            ${assets
              .map(
                (asset) => `
                  <a class="asset-link" href="${encodeURI(asset.path)}" target="_blank" rel="noreferrer">
                    <strong>${escapeHtml(asset.name)}</strong>
                    <small>${escapeHtml(assetKind(asset.name))} / ${escapeHtml(asset.size)}</small>
                  </a>
                `,
              )
              .join("")}
          </div>`
        : `<p class="asset-empty">No related files yet. Add files to <code>${escapeHtml(suggestedFolder)}</code>.</p>`
    }
  `;
}

async function openDoc(path) {
  const doc = state.docs.find((item) => item.path === path) || state.docs[0];
  if (!doc) return;

  state.activePath = doc.path;
  const response = await fetch(doc.path);
  const markdown = await response.text();

  elements.homeView.hidden = true;
  elements.libraryView.hidden = true;
  elements.docView.hidden = false;
  elements.docTitle.textContent = doc.title;
  elements.breadcrumb.textContent = "Docs / " + doc.group;
  elements.docGroup.textContent = doc.group;
  elements.docPath.textContent = doc.path;
  elements.markdownBody.innerHTML = parseMarkdown(markdown);
  renderAssets(doc);
  buildToc();
  renderNav();
  elements.sidebar.classList.remove("open");
  elements.navToggle.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showHome() {
  state.activePath = "";
  elements.homeView.hidden = false;
  elements.libraryView.hidden = false;
  elements.docView.hidden = true;
  renderNav();
  renderLibrary();
}

function route() {
  const path = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  if (path) {
    openDoc(path);
  } else {
    showHome();
  }
}

function updateProgress() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const percent = max > 0 ? (scrollTop / max) * 100 : 0;
  elements.readingProgress.style.width = `${percent}%`;
}

async function init() {
  const response = await fetch(manifestUrl);
  const manifest = await response.json();
  state.docs = manifest.docs || [];
  elements.docCount.textContent = state.docs.length;
  renderNav();
  renderLibrary();
  route();
}

elements.docSearch.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderNav();
  renderLibrary();
});

elements.navToggle.addEventListener("click", () => {
  const isOpen = elements.sidebar.classList.toggle("open");
  elements.navToggle.setAttribute("aria-expanded", String(isOpen));
});

elements.toc.addEventListener("click", (event) => {
  const link = event.target.closest("[data-toc-id]");
  if (!link) return;

  event.preventDefault();
  const heading = document.getElementById(link.dataset.tocId);
  if (!heading) return;

  heading.scrollIntoView({ behavior: "smooth", block: "start" });
  setActiveToc(link.dataset.tocId);
});

elements.markdownBody.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  if (href.startsWith("#")) {
    event.preventDefault();
    const heading = document.getElementById(href.slice(1));
    if (!heading) return;
    heading.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveToc(heading.id);
    return;
  }

  const docPath = href.replace(/^\.\//, "").split("#")[0];
  if (state.docs.some((doc) => doc.path === docPath)) {
    event.preventDefault();
    window.location.hash = `#/${docPath}`;
  }
});

window.addEventListener("hashchange", route);
window.addEventListener(
  "scroll",
  () => {
    updateProgress();
    updateActiveToc();
  },
  { passive: true },
);

init().catch((error) => {
  elements.libraryView.innerHTML = `<p class="empty-state">The documentation manifest could not be loaded. Run the manifest generator and try again.</p>`;
  console.error(error);
});
