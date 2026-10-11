import Database from "better-sqlite3";
import { ArkhamCatalog } from "../application/ports/arkham-catalog";
import { CampaignRepository } from "../domain/campaign/campaign-repository";
import { CreateCampaignHandler } from "../application/use-cases/create-campaign/create-campaign-handler";
import { GainExperienceHandler } from "../application/use-cases/gain-experience/gain-experience-handler";
import { ListCampaignsHandler } from "../application/use-cases/list-campaigns/list-campaigns-handler";
import { openDatabase } from "../infrastructure/persistence/database";
import { SqliteCampaignRepository } from "../infrastructure/persistence/sqlite-campaign-repository";
import { SnapshotArkhamCatalog } from "../infrastructure/arkhamdb/snapshot-arkham-catalog";
import { UuidIdGenerator } from "../infrastructure/identity/uuid-id-generator";

export interface DependencyContainer {
  campaignRepository: CampaignRepository;
  arkhamCatalog: ArkhamCatalog;
  listCampaignsHandler: ListCampaignsHandler;
  createCampaignHandler: CreateCampaignHandler;
  gainExperienceHandler: GainExperienceHandler;
}

export function buildDependencyContainer(
  databaseFilePath: string
): DependencyContainer {
  const database: Database.Database = openDatabase(databaseFilePath);
  const campaignRepository = new SqliteCampaignRepository(database);
  const arkhamCatalog = new SnapshotArkhamCatalog();
  const idGenerator = new UuidIdGenerator();

  const listCampaignsHandler = new ListCampaignsHandler(campaignRepository);
  const createCampaignHandler = new CreateCampaignHandler(
    campaignRepository,
    arkhamCatalog,
    idGenerator
  );
  const gainExperienceHandler = new GainExperienceHandler(campaignRepository);

  return {
    campaignRepository,
    arkhamCatalog,
    listCampaignsHandler,
    createCampaignHandler,
    gainExperienceHandler,
  };
}
