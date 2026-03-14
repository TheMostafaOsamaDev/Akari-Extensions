/**
 * KolNovel extension — entry point
 * Implements the NovelSource contract for https://free.kolnovel.com
 */

import type { NovelSource, NovelCover, NovelDetail, ChapterContent } from "./contract";
import {
  parseHomePage,
  parseBrowsePage,
  parseNovelDetail,
  parseChapterContent,
} from "./parser";

const BASE_URL = "https://free.kolnovel.com";

export type HostApiCaller = <T = unknown>(
  method: "akari.network.fetch",
  payload: { url: string; headers?: Record<string, string> },
) => Promise<T>;

let hostApiCaller: HostApiCaller | null = null;

export function setKolNovelHostApiCaller(caller: HostApiCaller): void {
  hostApiCaller = caller;
}

async function fetchHtml(url: string): Promise<string> {
  if (!hostApiCaller) {
    throw new Error("KolNovel host API caller is not configured");
  }
  const result = await hostApiCaller<{ body: string }>("akari.network.fetch", { url });
  return (result as { body: string }).body;
}

export class KolNovelSource implements NovelSource {
  readonly id = "com.akari.extensions.kolnovel";
  readonly name = "KolNovel";
  readonly baseUrl = BASE_URL;
  readonly language = "ar";

  async fetchHome() {
    const html = await fetchHtml(BASE_URL);
    return parseHomePage(html);
  }

  async fetchBrowse(page: number, filters?: Record<string, string>): Promise<NovelCover[]> {
    const params = new URLSearchParams({
      status: filters?.["status"] ?? "",
      type: filters?.["type"] ?? "",
      order: filters?.["order"] ?? "update",
      paged: String(page),
    });
    const url = `${BASE_URL}/series/?${params.toString()}`;
    const html = await fetchHtml(url);
    return parseBrowsePage(html);
  }

  async fetchNovelDetail(novelUrl: string): Promise<NovelDetail> {
    const html = await fetchHtml(novelUrl);
    return parseNovelDetail(html, novelUrl);
  }

  async fetchChapterContent(chapterUrl: string): Promise<ChapterContent> {
    const html = await fetchHtml(chapterUrl);
    return parseChapterContent(html, chapterUrl);
  }
}

// Export a singleton instance
export const kolnovel = new KolNovelSource();

export default kolnovel;
