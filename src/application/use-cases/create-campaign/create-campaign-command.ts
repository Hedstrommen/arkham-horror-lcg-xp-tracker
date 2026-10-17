import { Friend } from "../../../domain/value-objects/friend";

export interface CreateCampaignCommand {
  ownerId: string;
  title: string | null;
  campaignName: string;
  chapter: number;
  friends: Friend[];
  investigatorId: string;
  notes: string | null;
}
