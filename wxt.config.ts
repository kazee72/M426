import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "PokéPet - Virtual Pokémon Companion",
    description: "Virtual Pokémon pet inside your browser with animated sprites and a decaying needs system.",
    permissions: ["storage", "alarms", "activeTab", "scripting"],
    action: {
      default_title: "Toggle PokéPet overlay",
    },
  },
  webExt: {
    disabled: true,
  },
  dev: {
    server: {
      host: "0.0.0.0", // bind all interfaces (default 'localhost' resolves to ::1 only inside Docker)
    },
  },
});
