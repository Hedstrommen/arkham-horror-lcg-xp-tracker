import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import { CampaignOverview } from "./campaign-overview";

export class ListCampaignsHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  public handle(ownerId: string): CampaignOverview[] {
    return this.campaignRepository
      .findAllByOwnerIdOrderedByStatusThenRecency(ownerId)
      .map((campaign) => ({
        campaignId: campaign.id,
        title: campaign.title.toString(),
        campaignName: campaign.campaignName,
        investigatorName: campaign.investigatorName,
        investigatorFaction: campaign.investigatorFaction,
        totalExperience: campaign.getTotalExperience(),
        isActive: campaign.getIsActive(),
      }));
  }
}
