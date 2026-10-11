import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import { ExperiencePoints } from "../../../domain/value-objects/experience-points";
import { ExperienceSuffix } from "../../../domain/value-objects/experience-suffix";
import { ExperienceType } from "../../../domain/value-objects/experience-type";
import { UpdateExperienceCommand } from "./update-experience-command";

export class UpdateExperienceHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  public handle(command: UpdateExperienceCommand): void {
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
    const experienceSuffix = ExperienceSuffix.fromUserInput(
      command.experienceSuffix ?? ""
    );

    campaign.updateExperienceEntry(
      command.entryId,
      experienceType,
      experiencePoints,
      experienceSuffix === null ? null : experienceSuffix.toString(),
      command.notes
    );
    this.campaignRepository.save(campaign);
  }
}
