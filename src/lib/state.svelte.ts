import { LazyStore } from "@tauri-apps/plugin-store";
import { type FsNode } from "./types";
import { writable } from "svelte/store";

type AppState = {
  currentPath: string;
  contentTree: FsNode | null;
  projects: {
    path: string;
    // from package.json or path if unable to find
    name: string;
  }[];
  activeProject: string | null;
};

const initialState: AppState = {
  currentPath: "",
  contentTree: null,
  projects: [],
  activeProject: null,
};

const persistingKeys: (keyof AppState)[] = ["projects", "activeProject"];

function createAppState() {
  const store = writable(initialState);
  const persistence = new LazyStore("appState");
  let readyToPersist = false;

  persistence.entries().then((diskState) => {
    // we only get a partial state from disk, we need to
    // merge it with the actual state
    const partialState = Object.fromEntries(diskState) as AppState;
    const state = Object.assign({}, initialState, partialState);
    store.set(state);

    readyToPersist = true;
  });

  store.subscribe((value) => {
    if (!readyToPersist) return;

    for (const key of persistingKeys) {
      persistence.set(key, value[key]);
    }
  });

  return store;
}

export const appState = createAppState();
