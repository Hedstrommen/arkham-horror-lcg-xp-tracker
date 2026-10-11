export interface CampaignDefinition {
  campaignName: string;
  chapter: number;
}

export interface InvestigatorDefinition {
  investigatorId: string;
  investigatorName: string;
  factionName: string;
  chapter: number;
}

export interface ArkhamCatalog {
  listCampaigns(): CampaignDefinition[];
  listInvestigators(): InvestigatorDefinition[];
  findInvestigatorById(investigatorId: string): InvestigatorDefinition | null;
  findCampaignByName(campaignName: string): CampaignDefinition | null;
}
