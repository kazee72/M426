import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  dev: {
      server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
    },
  },
  modules: ["@wxt-dev/module-react"],
  webExt: {
    disabled: true, // don't try to launch a browser
  },
});
