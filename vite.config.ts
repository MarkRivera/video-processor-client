import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    host: "172.27.0.2",
    port: 8080,
  },
  build: {
    target: 'esnext',
  },
});
