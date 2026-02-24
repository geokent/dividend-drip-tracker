import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import PrerenderSPAPlugin from 'vite-plugin-prerender';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode === 'production' && PrerenderSPAPlugin({
      staticDir: path.resolve(__dirname, 'dist'),
      routes: [
        '/',
        '/dividend-calendar',
        '/stock-screener',
        '/future-income-projects',
        '/terms',
        '/privacy'
      ],
      renderer: new PrerenderSPAPlugin.PuppeteerRenderer({
        renderAfterTime: 500
      })
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
