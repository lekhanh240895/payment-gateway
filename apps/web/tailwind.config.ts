import type { Config } from "tailwindcss"
import shareConfig from "@repo/tailwind-config"

export const config: Config = {
  darkMode: ["class"],
  content: [
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [shareConfig],
} satisfies Config

export default config
