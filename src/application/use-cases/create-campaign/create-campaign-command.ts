export interface CreateCampaignCommand {
  ownerId: string;
  title: string | null;
  campaignName: string;
  chapter: number;
  friends: string[];
  investigatorId: string;
  notes: string | null;
}
