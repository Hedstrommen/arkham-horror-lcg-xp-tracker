import { Campaign } from "./campaign";

export interface CampaignRepository {
  save(campaign: Campaign): void;
  deleteByIdAndOwnerId(campaignId: string, ownerId: string): void;
  findByIdAndOwnerId(campaignId: string, ownerId: string): Campaign | null;
  findAllByOwnerIdOrderedByStatusThenRecency(ownerId: string): Campaign[];
}
