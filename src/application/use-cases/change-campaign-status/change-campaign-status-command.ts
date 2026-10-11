export type CampaignStatusChange = "finish" | "reactivate";

export interface ChangeCampaignStatusCommand {
  campaignId: string;
  statusChange: CampaignStatusChange;
}
