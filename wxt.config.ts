import { defineConfig } from "wxt";

export default defineConfig({
  dev: {
      server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
    },
  },
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
});
