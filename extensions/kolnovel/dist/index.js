/**
 * KolNovel extension — entry point
 * Implements the NovelSource contract for https://free.kolnovel.com
 */
import { parseHomePage, parseBrowsePage, parseNovelDetail, parseChapterContent, } from "./parser";
const BASE_URL = "https://free.kolnovel.com";
let hostApiCaller = null;
export function setKolNovelHostApiCaller(caller) {
    hostApiCaller = caller;
}
async function fetchHtml(url) {
    if (!hostApiCaller) {
        throw new Error("KolNovel host API caller is not configured");
    }
    const result = await hostApiCaller("akari.network.fetch", { url });
    return result.body;
}
export class KolNovelSource {
    id = "com.akari.extensions.kolnovel";
    name = "KolNovel";
    baseUrl = BASE_URL;
    language = "ar";
    async fetchHome() {
        const html = await fetchHtml(BASE_URL);
        return parseHomePage(html);
    }
    async fetchBrowse(page, filters) {
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
    async fetchNovelDetail(novelUrl) {
        const html = await fetchHtml(novelUrl);
        return parseNovelDetail(html, novelUrl);
    }
    async fetchChapterContent(chapterUrl) {
        const html = await fetchHtml(chapterUrl);
        return parseChapterContent(html, chapterUrl);
    }
}
// Export a singleton instance
export const kolnovel = new KolNovelSource();
export default kolnovel;
