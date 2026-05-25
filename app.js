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
  topbarContext: document.querySelector("#topbarContext"),
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

function normalizePath(path) {
  const [, pathname = "", suffix = ""] = path.match(/^([^?#]*)(.*)$/) || [];
  const parts = [];

  pathname.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") {
      parts.pop();
      return;
    }
    parts.push(part);
  });

  return parts.join("/") + suffix;
}

function resolveDocHref(href, docPath) {
  if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(href)) {
    return href;
  }
  const docFolder = docPath.split("/").slice(0, -1).join("/");
  return normalizePath(`${docFolder}/${href}`);
}

const videoExtensions = new Set(["mp4", "webm", "ogg", "mov", "m4v"]);

function mediaExtension(src) {
  const cleanPath = src.split(/[?#]/)[0];
  const extension = cleanPath.split(".").pop();
  return extension ? extension.toLowerCase() : "";
}

function mediaMimeType(src) {
  const extension = mediaExtension(src);
  if (extension === "mov") return "video/quicktime";
  if (extension === "m4v") return "video/mp4";
  if (extension) return `video/${extension}`;
  return "video/mp4";
}

function isVideoSource(src) {
  return videoExtensions.has(mediaExtension(src));
}

function resolveMediaSrc(src, docPath) {
  if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(src)) {
    return src;
  }

  const cleanSrc = src.replace(/^\.\//, "");
  if (!cleanSrc.includes("/")) {
    const docFolder = docPath.split("/").slice(0, -1).join("/");
    return normalizePath(`${docFolder}/media/${cleanSrc}`);
  }

  return resolveDocHref(src, docPath);
}

function linkAttributes(href, docPath) {
  const resolvedHref = resolveDocHref(href, docPath);
  const safeHref = isSafeLink(resolvedHref) ? escapeHtml(resolvedHref) : "#";
  const isDocLink = resolvedHref.replace(/^\.\//, "").startsWith("docs/") && resolvedHref.split("#")[0].endsWith(".md");
  if (resolvedHref.startsWith("#") || isDocLink) {
    return `href="${safeHref}"`;
  }
  return `href="${safeHref}" target="_blank" rel="noreferrer"`;
}

function inlineMarkdown(value, docPath = "") {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
    const resolvedSrc = resolveMediaSrc(src, docPath);
    const safeSrc = isSafeLink(resolvedSrc) ? escapeHtml(resolvedSrc) : "";
    if (!safeSrc) return "";
    if (isVideoSource(resolvedSrc)) {
      return `<video controls preload="metadata" title="${alt}"><source src="${safeSrc}" type="${escapeHtml(mediaMimeType(resolvedSrc))}" />${alt}</video>`;
    }
    return `<img src="${safeSrc}" alt="${alt}" loading="lazy" />`;
  });
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    return `<a ${linkAttributes(href, docPath)}>${label}</a>`;
  });
  output = output.replace(/(^|[\s(])((?:https?:\/\/|mailto:)[^\s<)]+)/g, (_match, prefix, href) => {
    return `${prefix}<a ${linkAttributes(href, docPath)}>${href}</a>`;
  });
  return output;
}

function parseMarkdown(markdown, docPath) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = null;
  let inCode = false;
  let code = [];

  const closeParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "), docPath)}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!list) return;
    html.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item, docPath)}</li>`).join("")}</${list.type}>`);
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
      const text = inlineMarkdown(heading[2].trim(), docPath);
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
      html.push(`<blockquote>${inlineMarkdown(quote[1], docPath)}</blockquote>`);
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
  const headings = [...elements.markdownBody.querySelectorAll("h2")];
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
  const headings = [...elements.markdownBody.querySelectorAll("h2")];
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
  const groups = assets.reduce((folders, asset) => {
    folders[asset.folder] = folders[asset.folder] || [];
    folders[asset.folder].push(asset);
    return folders;
  }, {});

  elements.assetPanel.innerHTML = `
    ${
      assets.length
        ? `<details class="asset-dropdown">
            <summary class="asset-summary">
              <span>
                <span class="asset-title">Assets</span>
                <small>${assets.length} files available</small>
              </span>
              <span class="asset-count">${assets.length}</span>
            </summary>
            <div class="asset-menu">
              <div class="asset-list" role="list">
                ${Object.entries(groups)
                  .map(
                    ([folder, folderAssets]) => `
                      <section class="asset-group" aria-label="${escapeHtml(folder)}">
                        <div class="asset-group-title">
                          <strong>${escapeHtml(folder.split("/").pop() || folder)}</strong>
                          <span>${folderAssets.length}</span>
                        </div>
                        <div class="asset-grid">
                          ${folderAssets
                            .map(
                              (asset) => `
                                <a class="asset-link" href="${encodeURI(asset.path)}" target="_blank" rel="noreferrer" role="listitem" title="${escapeHtml(asset.name)}">
                                  <span class="asset-type">${escapeHtml(assetKind(asset.name))}</span>
                                  <span class="asset-name">${escapeHtml(asset.name)}</span>
                                  <span class="asset-size">${escapeHtml(asset.size)}</span>
                                </a>
                              `,
                            )
                            .join("")}
                        </div>
                      </section>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          </details>`
        : `<div class="asset-summary asset-summary-empty">
            <span>
              <span class="asset-title">Assets</span>
              <small>No files attached</small>
            </span>
            <span class="asset-count">0</span>
          </div>`
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
  elements.topbarContext.textContent = doc.title;
  elements.breadcrumb.textContent = "Docs / " + doc.group;
  elements.docGroup.textContent = doc.group;
  elements.docPath.textContent = doc.path;
  elements.markdownBody.innerHTML = parseMarkdown(markdown, doc.path);
  renderAssets(doc);
  buildToc();
  renderNav();
  elements.sidebar.classList.remove("open");
  elements.navToggle.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showHome() {
  state.activePath = "";
  elements.topbarContext.textContent = "Documentation home";
  elements.homeView.hidden = false;
  elements.libraryView.hidden = true;
  elements.docView.hidden = true;
  renderNav();
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
  route();
}

elements.docSearch.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderNav();
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

document.addEventListener("click", (event) => {
  const dropdown = elements.assetPanel.querySelector(".asset-dropdown[open]");
  if (!dropdown || dropdown.contains(event.target)) return;
  dropdown.open = false;
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
  elements.homeView.insertAdjacentHTML(
    "afterend",
    `<p class="empty-state">The documentation manifest could not be loaded. Run the manifest generator and try again.</p>`,
  );
  console.error(error);
});
