import { LogoMark } from "@/components/logo-mark";

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-white">
      <LogoMark className="size-5" />
      Dialogues MCP
    </span>
  );
}
