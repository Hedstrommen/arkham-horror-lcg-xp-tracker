export interface CampaignOverview {
  campaignId: string;
  title: string;
  campaignName: string;
  investigatorName: string;
  investigatorFaction: string;
  totalExperience: number;
  notes: string | null;
  isActive: boolean;
}
