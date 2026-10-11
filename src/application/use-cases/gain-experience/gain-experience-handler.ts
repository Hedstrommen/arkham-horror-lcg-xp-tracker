import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import { ExperiencePoints } from "../../../domain/value-objects/experience-points";
import { ExperienceType } from "../../../domain/value-objects/experience-type";
import { GainExperienceCommand } from "./gain-experience-command";

export class GainExperienceHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  public handle(command: GainExperienceCommand): void {
    const campaign = this.campaignRepository.findById(command.campaignId);
    if (campaign === null) {
      throw new Error(`No campaign found with id ${command.campaignId}.`);
    }

    const experienceType = ExperienceType.fromUserInput(command.experienceKind);
    const experiencePoints = ExperiencePoints.fromUserInput(
      command.experienceAmount
    );

    campaign.gainExperience(experienceType, experiencePoints, command.notes);
    this.campaignRepository.save(campaign);
  }
}
