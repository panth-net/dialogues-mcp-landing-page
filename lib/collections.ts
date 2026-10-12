import data from "@/content/collections.json";

// content/collections.json is generated from the Dialogues server's catalog.
// Don't edit it by hand; see README "Syncing the collections".

export type Collection = {
  id: string;
  title: string;
  downloadable: boolean;
  sources: { name: string; url: string }[];
};

export const collections: Collection[] = data.collections;
