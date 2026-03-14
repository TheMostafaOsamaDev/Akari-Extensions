import type { ExtensionManifest } from "./types";

export type { ExtensionManifest } from "./types";
export type {
  NovelSource,
  NovelCover,
  NovelDetail,
  Volume,
  Chapter,
  ChapterContent,
  ChapterLine,
} from "./novel-source";

export function defineExtensionManifest(manifest: ExtensionManifest): ExtensionManifest {
  return manifest;
}
