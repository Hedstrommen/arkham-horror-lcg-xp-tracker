import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import { CampaignOverview } from "./campaign-overview";

export class ListCampaignsHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  public handle(): CampaignOverview[] {
    return this.campaignRepository
      .findAllOrderedByStatusThenRecency()
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
