const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://serverest.dev",
    video: true,  // Garante que os vídeos serão gravados
    videosFolder: "cypress/videos",  // Define a pasta onde os vídeos serão salvos
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
