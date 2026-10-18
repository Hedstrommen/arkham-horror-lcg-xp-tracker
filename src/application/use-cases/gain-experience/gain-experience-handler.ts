import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import { ExperiencePoints } from "../../../domain/value-objects/experience-points";
import { ExperienceType } from "../../../domain/value-objects/experience-type";
import { ExperienceTitle } from "../../../domain/value-objects/experience-title";
import { GainExperienceCommand } from "./gain-experience-command";

export class GainExperienceHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  public handle(command: GainExperienceCommand): void {
    const campaign = this.campaignRepository.findByIdAndOwnerId(
      command.campaignId,
      command.ownerId
    );
    if (campaign === null) {
      throw new Error(`No campaign found with id ${command.campaignId}.`);
    }

    const experienceType = ExperienceType.fromUserInput(command.experienceKind);
    const experiencePoints = ExperiencePoints.fromUserInput(
      command.experienceAmount
    );
    const experienceTitle = ExperienceTitle.fromUserInput(
      command.experienceTitle
    );

    campaign.gainExperience(
      experienceType,
      experiencePoints,
      experienceTitle.toString(),
      command.notes,
      command.friendAmounts
    );
    this.campaignRepository.save(campaign);
  }
}
