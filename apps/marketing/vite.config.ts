import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { markdownDocs } from "./plugins/markdown-docs.js"

const docs = path.resolve(__dirname, "../../docs/content")

export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [markdownDocs(docs), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Page content is authored in docs/content and compiled from there.
      // One copy, no generated mirror to drift.
      "@docs": docs,
    },
  },
  server: { fs: { allow: [path.resolve(__dirname, "../.."), docs] } },
})
