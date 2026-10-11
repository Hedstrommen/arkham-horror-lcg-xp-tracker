import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import { CampaignTitle } from "../../../domain/value-objects/campaign-title";
import { UpdateCampaignCommand } from "./update-campaign-command";

export class UpdateCampaignHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  public handle(command: UpdateCampaignCommand): void {
    const campaign = this.campaignRepository.findByIdAndOwnerId(
      command.campaignId,
      command.ownerId
    );
    if (campaign === null) {
      throw new Error(`No campaign found with id ${command.campaignId}.`);
    }

    campaign.rename(CampaignTitle.fromUserInput(command.title));
    campaign.updateFriendsAndNotes(command.friends, command.notes);
    this.campaignRepository.save(campaign);
  }
}
