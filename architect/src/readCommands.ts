import { parseCommands } from "../../shared/parseCommands";

export function readCommands() {
  const textarea = document.querySelector("#editor textarea") as HTMLTextAreaElement;
  return parseCommands(textarea.value);
}
