// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      backgroundImage: {
        "zero17-warm-fusion":
          "linear-gradient(115deg, #FFD86A 0%, #FFA88E 25%, #FF64C8 50%, #FF4EB3 70%, #C9B8FF 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
