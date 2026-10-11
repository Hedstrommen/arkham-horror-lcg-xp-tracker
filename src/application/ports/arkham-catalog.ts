export interface CampaignDefinition {
  campaignName: string;
}

export interface InvestigatorDefinition {
  investigatorId: string;
  investigatorName: string;
  factionName: string;
}

export interface ArkhamCatalog {
  listCampaigns(): CampaignDefinition[];
  listInvestigators(): InvestigatorDefinition[];
  findInvestigatorById(investigatorId: string): InvestigatorDefinition | null;
  findCampaignByName(campaignName: string): CampaignDefinition | null;
}
