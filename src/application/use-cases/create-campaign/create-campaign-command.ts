export interface CreateCampaignCommand {
  ownerId: string;
  campaignName: string;
  chapter: number;
  friends: string[];
  investigatorId: string;
  notes: string | null;
}
