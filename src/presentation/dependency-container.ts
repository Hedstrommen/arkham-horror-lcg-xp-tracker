import Database from "better-sqlite3";
import { ArkhamCatalog } from "../application/ports/arkham-catalog";
import { SessionStore } from "../application/ports/session-store";
import { CampaignRepository } from "../domain/campaign/campaign-repository";
import { UserRepository } from "../domain/user/user-repository";
import { PasswordHasher } from "../domain/value-objects/password-hash";
import { CreateCampaignHandler } from "../application/use-cases/create-campaign/create-campaign-handler";
import { GainExperienceHandler } from "../application/use-cases/gain-experience/gain-experience-handler";
import { ListCampaignsHandler } from "../application/use-cases/list-campaigns/list-campaigns-handler";
import { ChangeCampaignStatusHandler } from "../application/use-cases/change-campaign-status/change-campaign-status-handler";
import { SignUpHandler } from "../application/use-cases/auth/sign-up-handler";
import { SignInHandler } from "../application/use-cases/auth/sign-in-handler";
import { UpdateExperienceHandler } from "../application/use-cases/update-experience/update-experience-handler";
import { UpdateCampaignHandler } from "../application/use-cases/update-campaign/update-campaign-handler";
import { openDatabase } from "../infrastructure/persistence/database";
import { SqliteCampaignRepository } from "../infrastructure/persistence/sqlite-campaign-repository";
import { SqliteUserRepository } from "../infrastructure/persistence/sqlite-user-repository";
import { SnapshotArkhamCatalog } from "../infrastructure/arkhamdb/snapshot-arkham-catalog";
import { BcryptPasswordHasher } from "../infrastructure/identity/bcrypt-password-hasher";
import { InMemorySessionStore } from "../infrastructure/identity/in-memory-session-store";
import { UuidIdGenerator } from "../infrastructure/identity/uuid-id-generator";

export interface DependencyContainer {
  campaignRepository: CampaignRepository;
  userRepository: UserRepository;
  arkhamCatalog: ArkhamCatalog;
  sessionStore: SessionStore;
  passwordHasher: PasswordHasher;
  listCampaignsHandler: ListCampaignsHandler;
  createCampaignHandler: CreateCampaignHandler;
  gainExperienceHandler: GainExperienceHandler;
  updateExperienceHandler: UpdateExperienceHandler;
  changeCampaignStatusHandler: ChangeCampaignStatusHandler;
  updateCampaignHandler: UpdateCampaignHandler;
  signUpHandler: SignUpHandler;
  signInHandler: SignInHandler;
}

export function buildDependencyContainer(
  databaseFilePath: string
): DependencyContainer {
  const database: Database.Database = openDatabase(databaseFilePath);
  const campaignRepository = new SqliteCampaignRepository(database);
  const userRepository = new SqliteUserRepository(database);
  const arkhamCatalog = new SnapshotArkhamCatalog();
  const idGenerator = new UuidIdGenerator();
  const sessionStore = new InMemorySessionStore();
  const passwordHasher = new BcryptPasswordHasher();

  const listCampaignsHandler = new ListCampaignsHandler(campaignRepository);
  const createCampaignHandler = new CreateCampaignHandler(
    campaignRepository,
    arkhamCatalog,
    idGenerator
  );
  const gainExperienceHandler = new GainExperienceHandler(campaignRepository);
  const updateExperienceHandler = new UpdateExperienceHandler(campaignRepository);
  const changeCampaignStatusHandler = new ChangeCampaignStatusHandler(
    campaignRepository
  );
  const updateCampaignHandler = new UpdateCampaignHandler(campaignRepository);
  const signUpHandler = new SignUpHandler(
    userRepository,
    passwordHasher,
    idGenerator
  );
  const signInHandler = new SignInHandler(userRepository, passwordHasher);

  return {
    campaignRepository,
    userRepository,
    arkhamCatalog,
    sessionStore,
    passwordHasher,
    listCampaignsHandler,
    createCampaignHandler,
    gainExperienceHandler,
    updateExperienceHandler,
    changeCampaignStatusHandler,
    updateCampaignHandler,
    signUpHandler,
    signInHandler,
  };
}
