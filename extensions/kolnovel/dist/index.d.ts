/**
 * KolNovel extension — entry point
 * Implements the NovelSource contract for https://free.kolnovel.com
 */
import type { NovelSource, NovelCover, NovelDetail, ChapterContent } from "./contract";
export type HostApiCaller = <T = unknown>(method: "akari.network.fetch", payload: {
    url: string;
    headers?: Record<string, string>;
}) => Promise<T>;
export declare function setKolNovelHostApiCaller(caller: HostApiCaller): void;
export declare class KolNovelSource implements NovelSource {
    readonly id = "com.akari.extensions.kolnovel";
    readonly name = "KolNovel";
    readonly baseUrl = "https://free.kolnovel.com";
    readonly language = "ar";
    fetchHome(): Promise<import("./parser").HomeResult>;
    fetchBrowse(page: number, filters?: Record<string, string>): Promise<NovelCover[]>;
    fetchNovelDetail(novelUrl: string): Promise<NovelDetail>;
    fetchChapterContent(chapterUrl: string): Promise<ChapterContent>;
}
export declare const kolnovel: KolNovelSource;
export default kolnovel;
//# sourceMappingURL=index.d.ts.map