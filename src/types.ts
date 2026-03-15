export type ExtensionPermission =
  | "storage.read"
  | "storage.write"
  | "library.read"
  | "library.write"
  | "network.fetch";

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  hostApiVersion: "1.0.0";
  entry: string;
  permissions: ExtensionPermission[];
  description?: string;
  author?: string;  /** URL to a small square icon image (32×32 recommended) */
  icon?: string;}
