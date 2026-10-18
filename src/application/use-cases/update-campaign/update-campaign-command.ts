import { Friend } from "../../../domain/value-objects/friend";

export interface UpdateCampaignCommand {
  campaignId: string;
  ownerId: string;
  title: string;
  friends: Friend[];
  notes: string | null;
}
