import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Fixes the error: SharedArrayBuffer is NOT supported in your browser see https://developer.chrome.com/blog/enabling-shared-array-buffer/
  // See discussion: https://github.com/cornerstonejs/cornerstone3D/issues/594#issuecomment-1537072270
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
