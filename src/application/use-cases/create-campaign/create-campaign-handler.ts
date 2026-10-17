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
    const title = CampaignTitle.fromUserInput(
      command.title !== null && command.title.trim().length > 0
        ? command.title
        : command.campaignName
    );
    const chapter = command.chapter === 2 ? 2 : 1;

    const investigatorDefinition =
      this.arkhamCatalog.findInvestigatorById(command.investigatorId);
    if (investigatorDefinition === null) {
      throw new Error(`Unknown investigator: ${command.investigatorId}`);
    }

    const campaign = Campaign.startNew(
      this.idGenerator.generateCampaignId(),
      command.ownerId,
      title,
      title.toString(),
      chapter,
      command.friends.filter((friend) => friend.name.trim().length > 0),
      investigatorDefinition.investigatorId,
      investigatorDefinition.investigatorName,
      investigatorDefinition.factionName,
      command.notes
    );

    this.campaignRepository.save(campaign);
    return campaign.id;
  }
}
