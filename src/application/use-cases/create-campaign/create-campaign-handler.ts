import { Campaign } from "../../../domain/campaign/campaign";
import { CampaignRepository } from "../../../domain/campaign/campaign-repository";
import { CampaignTitle } from "../../../domain/value-objects/campaign-title";
import { ArkhamCatalog } from "../../ports/arkham-catalog";
import { IdGenerator } from "../../ports/id-generator";
import { CreateCampaignCommand } from "./create-campaign-command";

export class CreateCampaignHandler {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly arkhamCatalog: ArkhamCatalog,
    private readonly idGenerator: IdGenerator
  ) {}

  public handle(command: CreateCampaignCommand): string {
    const title = CampaignTitle.fromUserInput(command.title);

    const campaignDefinition = this.arkhamCatalog.findCampaignByName(
      command.campaignName
    );
    if (campaignDefinition === null) {
      throw new Error(`Unknown campaign: ${command.campaignName}`);
    }

    const investigatorDefinition =
      this.arkhamCatalog.findInvestigatorById(command.investigatorId);
    if (investigatorDefinition === null) {
      throw new Error(`Unknown investigator: ${command.investigatorId}`);
    }

    const campaign = Campaign.startNew(
      this.idGenerator.generateCampaignId(),
      command.ownerId,
      title,
      campaignDefinition.campaignName,
      command.friends.filter((friend) => friend.trim().length > 0),
      investigatorDefinition.investigatorId,
      investigatorDefinition.investigatorName,
      investigatorDefinition.factionName
    );

    this.campaignRepository.save(campaign);
    return campaign.id;
  }
}
