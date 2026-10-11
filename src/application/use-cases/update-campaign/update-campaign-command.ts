export interface UpdateCampaignCommand {
  campaignId: string;
  ownerId: string;
  title: string;
  friends: string[];
  notes: string | null;
}
