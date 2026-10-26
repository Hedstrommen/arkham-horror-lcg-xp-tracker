import express from "express";
import path from "node:path";
import { buildDependencyContainer } from "./dependency-container";
import { createCampaignRoutes, createRequireSignedInUser } from "./routes/campaign-routes";
import { createAuthRoutes } from "./routes/auth-routes";

const DATABASE_FILE_PATH = path.join(process.cwd(), "data", "arkham-tracker.db");
const PORT = Number(process.env.PORT ?? 3000);

const container = buildDependencyContainer(DATABASE_FILE_PATH);
const requireSignedInUser = createRequireSignedInUser(container.sessionStore);

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(
  "/styles",
  express.static(path.join(__dirname, "..", "..", "src", "presentation", "styles"))
);
app.use(
  "/pwa",
  express.static(path.join(__dirname, "..", "..", "src", "presentation", "pwa"), {
    setHeaders: (response, filePath) => {
      if (filePath.endsWith("manifest.webmanifest")) {
        response.setHeader("Content-Type", "application/manifest+json");
      }
      if (filePath.endsWith("sw.js")) {
        response.setHeader("Service-Worker-Allowed", "/");
      }
    },
  })
);
app.use(
  createAuthRoutes(
    container.signUpHandler,
    container.signInHandler,
    container.sessionStore
  )
);
app.use(
  createCampaignRoutes(
    container.listCampaignsHandler,
    container.createCampaignHandler,
    container.gainExperienceHandler,
    container.updateExperienceHandler,
    container.campaignRepository,
    container.arkhamCatalog,
    container.changeCampaignStatusHandler,
    container.updateCampaignHandler,
    container.deleteCampaignHandler,
    requireSignedInUser
  )
);

app.listen(PORT, () => {
  console.log(`Arkham XP Tracker listening on http://localhost:${PORT}`);
});
