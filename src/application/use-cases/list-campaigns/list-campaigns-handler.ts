import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import { CampaignOverview } from "./campaign-overview";

export class ListCampaignsHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  public handle(ownerId: string): CampaignOverview[] {
    return this.campaignRepository
      .findAllByOwnerIdOrderedByStatusThenRecency(ownerId)
      .map((campaign) => ({
        campaignId: campaign.id,
        title: campaign.getTitle().toString(),
        campaignName: campaign.campaignName,
        chapter: campaign.chapter,
        investigatorName: campaign.investigatorName,
        investigatorFaction: campaign.investigatorFaction,
        totalExperience: campaign.getTotalExperience(),
        notes: campaign.notes,
        isActive: campaign.getIsActive(),
      }));
  }
}
