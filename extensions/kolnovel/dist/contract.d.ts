export interface NovelCover {
    title: string;
    url: string;
    coverImage: string;
    latestChapter?: string;
    status?: "Ongoing" | "Completed" | "Hiatus" | string;
    genres?: string[];
    rating?: number;
}
export interface Chapter {
    id: string;
    title: string;
    url: string;
}
export interface Volume {
    id: string;
    title: string;
    chapters: Chapter[];
}
export interface NovelDetail {
    title: string;
    url: string;
    coverImage: string;
    description?: string;
    status?: string;
    genres?: string[];
    rating?: number;
    volumes: Volume[];
}
export interface ChapterContent {
    title: string;
    lines: ChapterLine[];
}
export interface ChapterLine {
    type: "text" | "image";
    content: string;
}
export interface NovelSource {
    readonly id: string;
    readonly name: string;
    readonly baseUrl: string;
    readonly language: string;
    fetchHome(): Promise<{
        featured: NovelCover[];
        hot: NovelCover[];
        latestUpdates: NovelCover[];
    }>;
    fetchBrowse(page: number, filters?: Record<string, string>): Promise<NovelCover[]>;
    fetchNovelDetail(novelUrl: string): Promise<NovelDetail>;
    fetchChapterContent(chapterUrl: string): Promise<ChapterContent>;
}
//# sourceMappingURL=contract.d.ts.map