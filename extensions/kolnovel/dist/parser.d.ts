/**
 * KolNovel HTML parser
 * All parsing is done against the raw HTML string returned by extension_http_fetch.
 * DOMParser is available in the Tauri webview (Chromium).
 */
import type { NovelCover, NovelDetail, ChapterContent } from "./contract";
export interface HomeResult {
    featured: NovelCover[];
    hot: NovelCover[];
    latestUpdates: NovelCover[];
}
export declare function parseHomePage(html: string): HomeResult;
export declare function parseBrowsePage(html: string): NovelCover[];
export declare function parseNovelDetail(html: string, novelUrl: string): NovelDetail;
export declare function parseChapterContent(html: string, _chapterUrl: string): ChapterContent;
//# sourceMappingURL=parser.d.ts.map