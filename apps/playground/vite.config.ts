import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    // GitHub Pages serves the demo at https://alexeikaratai.github.io/zimaleto/.
    base: "/zimaleto/",
    plugins: [react()],
});
