import data from "@/content/install-prompts.json";

// content/install-prompts.json is a verbatim copy of the canonical file in the
// Dialogues server repo. Keep it unedited; see README "Syncing the prompt".

type InstallPrompts = {
  version: number;
  package: string;
  node_minimum: string;
  node_recommended: string;
  clients: string[];
  install_prompt: string;
  first_message: string;
  example_questions: string[];
};

export const prompts: InstallPrompts = data;
