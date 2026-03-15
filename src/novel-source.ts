/**
 * Shared NovelSource interface that all novel extension sources must implement.
 * This is the contract between the Akari host and extension-provided sources.
 */

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

  /**
   * Fetch the homepage featured / trending / latest novels.
   */
  fetchHome(): Promise<{
    featured: NovelCover[];
    hot: NovelCover[];
    latestUpdates: NovelCover[];
  }>;

  /**
   * Fetch a paginated browse list.
   */
  fetchBrowse(page: number, filters?: Record<string, string>): Promise<NovelCover[]>;

  /**
   * Fetch detailed info and chapter list for a novel by its URL.
   */
  fetchNovelDetail(novelUrl: string): Promise<NovelDetail>;

  /**
   * Fetch chapter text content by its URL.
   */
  fetchChapterContent(chapterUrl: string): Promise<ChapterContent>;
}
