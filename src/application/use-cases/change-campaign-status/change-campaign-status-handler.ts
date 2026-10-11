import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import {
  ChangeCampaignStatusCommand,
  CampaignStatusChange,
} from "./change-campaign-status-command";

const VALID_STATUS_CHANGES: CampaignStatusChange[] = ["finish", "reactivate"];

export class ChangeCampaignStatusHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  public handle(command: ChangeCampaignStatusCommand): void {
    if (!VALID_STATUS_CHANGES.includes(command.statusChange)) {
      throw new Error(
        `Status change must be one of: ${VALID_STATUS_CHANGES.join(", ")}.`
      );
    }

    const campaign = this.campaignRepository.findById(command.campaignId);
    if (campaign === null) {
      throw new Error(`No campaign found with id ${command.campaignId}.`);
    }

    if (command.statusChange === "finish") {
      campaign.markFinished();
    } else {
      campaign.reactivate();
    }

    this.campaignRepository.save(campaign);
  }
}
