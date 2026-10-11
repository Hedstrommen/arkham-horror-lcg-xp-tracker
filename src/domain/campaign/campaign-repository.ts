import { Campaign } from "./campaign";

export interface CampaignRepository {
  save(campaign: Campaign): void;
  findById(campaignId: string): Campaign | null;
  findAllOrderedByStatusThenRecency(): Campaign[];
}
