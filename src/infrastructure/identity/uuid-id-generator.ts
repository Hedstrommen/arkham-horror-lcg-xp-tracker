import { randomUUID } from "node:crypto";
import { IdGenerator } from "../../application/ports/id-generator";

export class UuidIdGenerator implements IdGenerator {
  public generateCampaignId(): string {
    return randomUUID();
  }

  public generateUserId(): string {
    return randomUUID();
  }
}
