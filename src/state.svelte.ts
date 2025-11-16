import { type FsNode } from "./types";

export const appState: { currentPath: string; contentTree: FsNode | null } =
  $state({
    currentPath: "",
    contentTree: null,
  });
