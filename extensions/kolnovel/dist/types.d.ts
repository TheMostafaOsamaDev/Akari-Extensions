/**
 * KolNovel-specific result types — kept separate from the generic NovelSource
 * contract so that internal parser utilities can be strongly-typed.
 */
/** Raw inline-style map built from a <p> element's `style` attribute. */
export interface InlineStyleMap {
    height?: string;
    overflow?: string;
    position?: string;
    opacity?: string;
    textIndent?: string;
    bottom?: string;
    [key: string]: string | undefined;
}
//# sourceMappingURL=types.d.ts.map