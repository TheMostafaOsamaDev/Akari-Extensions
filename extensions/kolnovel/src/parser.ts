/**
 * KolNovel HTML parser
 * All parsing is done against the raw HTML string returned by extension_http_fetch.
 * DOMParser is available in the Tauri webview (Chromium).
 */

import type {
  NovelCover,
  NovelDetail,
  Volume,
  Chapter,
  ChapterContent,
  ChapterLine,
} from "./contract";
import type { InlineStyleMap } from "./types";

const BASE_URL = "https://free.kolnovel.com";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

/** Parse a CSS inline-style attribute string into a key→value map. */
function parseInlineStyle(styleAttr: string): InlineStyleMap {
  const map: InlineStyleMap = {};
  for (const rule of styleAttr.split(";")) {
    const colonIdx = rule.indexOf(":");
    if (colonIdx === -1) continue;
    const key = rule.slice(0, colonIdx).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const value = rule.slice(colonIdx + 1).trim();
    if (key) map[key] = value;
  }
  return map;
}

/**
 * Detect if a paragraph is one of the hidden spam/watermark paragraphs that
 * KolNovel injects via wccp-pro. Mirrors the IsHiddenByStyle logic in KolNovel.cs.
 *
 * Since we're working with raw HTML (not rendered), we check the inline `style`
 * attribute rather than computed layout properties.
 */
function isHiddenParagraph(p: Element): boolean {
  const styleAttr = p.getAttribute("style") ?? "";
  if (!styleAttr) return false;
  const s = parseInlineStyle(styleAttr);
  return (
    s["height"] === "0.1px" &&
    s["overflow"] === "hidden" &&
    s["position"] === "fixed" &&
    s["opacity"] === "0" &&
    s["textIndent"] === "-99999px" &&
    s["bottom"] === "-999px"
  );
}

/**
 * Return true for lines that are watermark / ignore text injected by the site.
 * Pattern derived from _ignoredLines in KolNovel.cs.
 */
function isSpamLine(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("kolnovel") ||
    lower.includes("كول نوفيل") ||
    lower.includes("ملوك الروايات")
  );
}

function absoluteUrl(href: string): string {
  if (href.startsWith("http")) return href;
  return BASE_URL + (href.startsWith("/") ? href : "/" + href);
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

export interface HomeResult {
  featured: NovelCover[];
  hot: NovelCover[];
  latestUpdates: NovelCover[];
}

export function parseHomePage(html: string): HomeResult {
  const doc = parseHtml(html);

  // --- Featured slider ---
  const featured: NovelCover[] = [];
  doc.querySelectorAll(".slide-item").forEach((item) => {
    const linkEl = item.querySelector(".slide-content a[href]") as HTMLAnchorElement | null;
    const titleEl = item.querySelector(".slide-content .title .ellipsis a");
    const coverEl = item.querySelector("img[src]") as HTMLImageElement | null;
    if (!linkEl) return;
    const href = linkEl.getAttribute("href") ?? "";
    if (!href) return;
    const latestChapter =
      (item.querySelector(".slidchap") as HTMLElement | null)?.textContent?.trim() ?? undefined;
    const statusRaw =
      (item.querySelector(".cast .director") as HTMLElement | null)?.textContent?.trim() ?? "";
    const ratingRaw =
      (item.querySelector(".rt .vote span span") as HTMLElement | null)?.textContent?.trim() ?? "";
    const rating = Number.parseFloat(ratingRaw);
    const genres: string[] = [];
    item.querySelectorAll(".slid-gen a").forEach((a) => {
      const genre = a.textContent?.trim();
      if (genre) genres.push(genre);
    });

    featured.push({
      title: titleEl?.textContent?.trim() ?? linkEl.textContent?.trim() ?? "",
      url: absoluteUrl(href),
      coverImage: coverEl?.src || coverEl?.getAttribute("src") || "",
      latestChapter,
      status: statusRaw ? statusRaw : undefined,
      genres: genres.length > 0 ? genres : undefined,
      rating: Number.isFinite(rating) ? rating : undefined,
    });
  });

  // --- Hot / trending today ---
  const hot: NovelCover[] = [];
  doc.querySelectorAll(".hotoday .inhotoday a.tip").forEach((el) => {
    const anchor = el as HTMLAnchorElement;
    const href = anchor.getAttribute("href") ?? "";
    const titleEl = anchor.querySelector(".todtitle");
    const imgEl = anchor.querySelector("img") as HTMLImageElement | null;
    if (!href) return;
    const latestChapter =
      (anchor.querySelector(".todchap") as HTMLElement | null)?.textContent?.trim() ?? undefined;
    const statusRaw =
      (anchor.querySelector(".todstat") as HTMLElement | null)?.textContent?.trim() ?? "";
    const ratingRaw =
      (anchor.querySelector(".todsco .todnum") as HTMLElement | null)?.textContent?.trim() ?? "";
    const rating = Number.parseFloat(ratingRaw);
    const genres: string[] = [];
    anchor.querySelectorAll(".todgen a").forEach((a) => {
      const genre = a.textContent?.trim();
      if (genre) genres.push(genre);
    });

    hot.push({
      title: titleEl?.textContent?.trim() ?? anchor.getAttribute("title") ?? "",
      url: absoluteUrl(href),
      coverImage: imgEl?.getAttribute("src") ?? "",
      latestChapter,
      status: statusRaw ? statusRaw : undefined,
      genres: genres.length > 0 ? genres : undefined,
      rating: Number.isFinite(rating) ? rating : undefined,
    });
  });

  // --- Latest updates ---
  const latestUpdates: NovelCover[] = [];
  doc.querySelectorAll(".utao .uta").forEach((uta) => {
    const linkEl = uta.querySelector(".imgu a") as HTMLAnchorElement | null;
    const titleEl = uta.querySelector(".luf h3, .luf h4");
    const imgEl = uta.querySelector("img") as HTMLImageElement | null;
    if (!linkEl) return;
    const href = linkEl.getAttribute("href") ?? "";
    const latestChapter =
      (uta.querySelector(".luf ul li a") as HTMLElement | null)?.textContent?.trim() ?? undefined;
    latestUpdates.push({
      title: titleEl?.textContent?.trim() ?? "",
      url: absoluteUrl(href),
      coverImage: imgEl?.getAttribute("src") ?? "",
      latestChapter,
    });
  });

  return { featured, hot, latestUpdates };
}

// ---------------------------------------------------------------------------
// Browse page
// ---------------------------------------------------------------------------

export function parseBrowsePage(html: string): NovelCover[] {
  const doc = parseHtml(html);
  const results: NovelCover[] = [];

  doc.querySelectorAll(".bsx").forEach((item) => {
    const linkEl = item.querySelector("a") as HTMLAnchorElement | null;
    const titleEl = item.querySelector(".tt");
    const imgEl = item.querySelector("img") as HTMLImageElement | null;
    const href = linkEl?.getAttribute("href") ?? "";
    if (!href) return;
    const latestChapter =
      (item.querySelector(".epxs") as HTMLElement | null)?.textContent?.trim() ?? undefined;
    results.push({
      title: titleEl?.textContent?.trim() ?? "",
      url: absoluteUrl(href),
      coverImage: imgEl?.getAttribute("src") ?? imgEl?.getAttribute("data-src") ?? "",
      latestChapter,
    });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Series / Novel detail page
// ---------------------------------------------------------------------------

export function parseNovelDetail(html: string, novelUrl: string): NovelDetail {
  const doc = parseHtml(html);

  const title =
    (doc.querySelector(".entry-title") as HTMLElement | null)?.textContent?.trim() ??
    (doc.querySelector("h1.entry-title") as HTMLElement | null)?.textContent?.trim() ??
    "";

  const coverEl = doc.querySelector(".thumb img") as HTMLImageElement | null;
  const coverUrl = coverEl?.getAttribute("src") ?? coverEl?.getAttribute("data-src") ?? "";

  // Description
  const descParts: string[] = [];
  doc.querySelectorAll(".entry-content-single p, .synp p").forEach((p) => {
    const text = p.textContent?.trim() ?? "";
    if (text) descParts.push(text);
  });
  const description = descParts.join("\n\n");

  // Status
  let status = "Unknown";
  const statusNodes = doc.querySelectorAll(".tsinfo .imptdt, .spe span, .sertostat span");
  statusNodes.forEach((n) => {
    const text = n.textContent?.trim().toLowerCase() ?? "";
    if (text.includes("ongoing")) status = "Ongoing";
    if (text.includes("complet")) status = "Completed";
  });

  // Rating
  const ratingText =
    (doc.querySelector(".rating .num") as HTMLElement | null)?.textContent?.trim() ??
    (doc.querySelector(".rt .num") as HTMLElement | null)?.textContent?.trim() ??
    (doc.querySelector(".numscore") as HTMLElement | null)?.textContent?.trim() ?? "";
  const rating = Number.parseFloat(ratingText);

  // Genres
  const genres: string[] = [];
  doc.querySelectorAll(".mgen a, .sertogenre a").forEach((a) => {
    const g = a.textContent?.trim();
    if (g) genres.push(g);
  });

  // Volumes & chapters
  // Volume toggles are .ts-chl-collapsible elements; their sibling
  // .ts-chl-collapsible-content contains the chapter list.
  // KolNovel.cs reverses them so volume 1 comes first.
  const volumes: Volume[] = [];
  const volumeToggles = Array.from(doc.querySelectorAll(".ts-chl-collapsible")).reverse();

  if (volumeToggles.length === 0) {
    // Some series have no volumes — chapters listed directly under .eplister
    const chapters: Chapter[] = [];
    doc.querySelectorAll(".eplister ul li a").forEach((a) => {
      const anchor = a as HTMLAnchorElement;
      const href = anchor.getAttribute("href") ?? "";
      const chapterTitle =
        (anchor.querySelector(".epl-title") as HTMLElement | null)?.textContent?.trim() ??
        anchor.textContent?.trim() ??
        "";
      if (!href) return;
      chapters.push({
        id: absoluteUrl(href),
        title: chapterTitle,
        url: absoluteUrl(href),
      });
    });
    if (chapters.length > 0) {
      volumes.push({ id: "vol-1", title: "Volume 1", chapters });
    }
  } else {
    volumeToggles.forEach((toggle, idx) => {
      const volTitle =
        (toggle.querySelector("button span, button") as HTMLElement | null)?.textContent?.trim() ??
        `Volume ${idx + 1}`;
      // The content sibling immediately follows the toggle button container
      const content = toggle.nextElementSibling;
      const chapters: Chapter[] = [];
      if (content?.classList.contains("ts-chl-collapsible-content")) {
        content.querySelectorAll("ul li a").forEach((a) => {
          const anchor = a as HTMLAnchorElement;
          const href = anchor.getAttribute("href") ?? "";
          const chapterTitle =
            (anchor.querySelector(".epl-title") as HTMLElement | null)?.textContent?.trim() ??
            anchor.textContent?.trim() ??
            "";
          if (!href) return;
          chapters.push({
            id: absoluteUrl(href),
            title: chapterTitle,
            url: absoluteUrl(href),
          });
        });
      }
      volumes.push({ id: `vol-${idx + 1}`, title: volTitle, chapters });
    });
  }

  return {
    title,
    url: novelUrl,
    coverImage: coverUrl,
    description,
    status,
    genres: genres.length > 0 ? genres : undefined,
    rating: Number.isFinite(rating) ? rating : undefined,
    volumes,
  };
}

// ---------------------------------------------------------------------------
// Chapter content page
// ---------------------------------------------------------------------------

export function parseChapterContent(html: string, _chapterUrl: string): ChapterContent {
  const doc = parseHtml(html);

  const title =
    (doc.querySelector(".entry-title") as HTMLElement | null)?.textContent?.trim() ??
    (doc.querySelector("h1") as HTMLElement | null)?.textContent?.trim() ??
    "";

  const lines: ChapterLine[] = [];

  doc.querySelectorAll(".entry-content p").forEach((p) => {
    // Skip hidden spam paragraphs injected by wccp-pro
    if (isHiddenParagraph(p)) return;

    const text = p.textContent?.trim() ?? "";
    if (!text) return;

    // Skip watermark / site-promotion lines
    if (isSpamLine(text)) return;

    // Detect image lines (paragraph whose text is an image URL)
    if (/^https?:\/\/.+\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(text)) {
      lines.push({ type: "image", content: text });
      return;
    }

    lines.push({ type: "text", content: text });
  });

  // Prev / Next navigation
  return {
    title,
    lines,
  };
}
