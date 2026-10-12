// Minimal shape check for install-prompts.json (fields the page reads).

/** @returns {string[]} list of problems; empty when valid */
export function validatePrompts(value) {
  const problems = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return ["top level must be a JSON object"];
  }
  const strings = ["package", "node_minimum", "install_prompt", "first_message"];
  for (const key of strings) {
    if (typeof value[key] !== "string" || value[key].trim() === "") {
      problems.push(`"${key}" must be a non-empty string`);
    }
  }
  if (typeof value.version !== "number") problems.push(`"version" must be a number`);
  for (const key of ["clients", "example_questions"]) {
    if (!Array.isArray(value[key]) || !value[key].every((item) => typeof item === "string")) {
      problems.push(`"${key}" must be an array of strings`);
    }
  }
  return problems;
}
