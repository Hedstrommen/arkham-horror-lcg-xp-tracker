export interface CreateCampaignCommand {
  ownerId: string;
  title: string;
  campaignName: string;
  friends: string[];
  investigatorId: string;
}
