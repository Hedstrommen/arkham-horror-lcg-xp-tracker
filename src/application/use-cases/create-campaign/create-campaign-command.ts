export interface CreateCampaignCommand {
  ownerId: string;
  campaignName: string;
  friends: string[];
  investigatorId: string;
  notes: string | null;
}
