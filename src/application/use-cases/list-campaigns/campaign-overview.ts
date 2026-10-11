export interface CampaignOverview {
  campaignId: string;
  title: string;
  campaignName: string;
  chapter: number;
  investigatorName: string;
  investigatorFaction: string;
  totalExperience: number;
  notes: string | null;
  isActive: boolean;
}
