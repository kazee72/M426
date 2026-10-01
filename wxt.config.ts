import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  webExt: {
    disabled: true, // don't try to launch a browser
  },
  dev: {
    server: {
      host: "0.0.0.0", // bind all interfaces (default 'localhost' resolves to ::1 only inside Docker)
    },
  },
});
