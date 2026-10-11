import express from "express";
import path from "node:path";
import { buildDependencyContainer } from "./dependency-container";
import { createCampaignRoutes } from "./routes/campaign-routes";

const DATABASE_FILE_PATH = path.join(process.cwd(), "data", "arkham-tracker.db");
const PORT = Number(process.env.PORT ?? 3000);

const container = buildDependencyContainer(DATABASE_FILE_PATH);

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(
  "/styles",
  express.static(path.join(__dirname, "presentation", "styles"))
);
app.use(
  createCampaignRoutes(
    container.listCampaignsHandler,
    container.createCampaignHandler,
    container.gainExperienceHandler,
    container.campaignRepository,
    container.arkhamCatalog,
    container.changeCampaignStatusHandler
  )
);

app.listen(PORT, () => {
  console.log(`Arkham XP Tracker listening on http://localhost:${PORT}`);
});
