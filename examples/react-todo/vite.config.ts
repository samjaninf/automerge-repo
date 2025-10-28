import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm"

export default defineConfig({
  plugins: [wasm(), react()],
  worker: {
    format: "es",
    plugins: () => [wasm()],
  },

  assetsInclude: ["**/*.wasm"],

  optimizeDeps: { exclude: ["@automerge/subduction"] },
  resolve: { dedupe: ["@automerge/subduction"] },
})
