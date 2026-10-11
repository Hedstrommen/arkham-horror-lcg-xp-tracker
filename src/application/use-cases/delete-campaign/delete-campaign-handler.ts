import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import { DeleteCampaignCommand } from "./delete-campaign-command";

export class DeleteCampaignHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  public handle(command: DeleteCampaignCommand): void {
    const campaign = this.campaignRepository.findByIdAndOwnerId(
      command.campaignId,
      command.ownerId
    );
    if (campaign === null) {
      throw new Error(`No campaign found with id ${command.campaignId}.`);
    }
    this.campaignRepository.deleteByIdAndOwnerId(
      command.campaignId,
      command.ownerId
    );
  }
}
