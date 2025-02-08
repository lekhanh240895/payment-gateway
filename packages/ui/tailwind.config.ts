import type { Config } from "tailwindcss";
import shareConfig from "@repo/tailwind-config";

const config: Pick<Config, "prefix" | "presets" | "content"> = {
  content: ["./src/**/*.tsx"],
  presets: [shareConfig],
};

export default config;
