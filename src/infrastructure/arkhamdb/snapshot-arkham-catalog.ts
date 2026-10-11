import {
  ArkhamCatalog,
  CampaignDefinition,
  InvestigatorDefinition,
} from "../../application/ports/arkham-catalog";
import campaignSnapshot from "./campaign-snapshot.json";
import investigatorSnapshot from "./investigator-snapshot.json";

export class SnapshotArkhamCatalog implements ArkhamCatalog {
  private readonly campaigns: CampaignDefinition[];
  private readonly investigators: InvestigatorDefinition[];

  constructor() {
    this.campaigns = campaignSnapshot as CampaignDefinition[];
    this.investigators = investigatorSnapshot as InvestigatorDefinition[];
  }

  public listCampaigns(): CampaignDefinition[] {
    return [...this.campaigns];
  }

  public listInvestigators(): InvestigatorDefinition[] {
    return [...this.investigators];
  }

  public findInvestigatorById(
    investigatorId: string
  ): InvestigatorDefinition | null {
    return (
      this.investigators.find(
        (investigator) => investigator.investigatorId === investigatorId
      ) ?? null
    );
  }

  public findCampaignByName(campaignName: string): CampaignDefinition | null {
    return (
      this.campaigns.find(
        (campaign) => campaign.campaignName === campaignName
      ) ?? null
    );
  }
}
