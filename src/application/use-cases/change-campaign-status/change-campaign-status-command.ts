export type CampaignStatusChange = "finish" | "reactivate";

export interface ChangeCampaignStatusCommand {
  campaignId: string;
  ownerId: string;
  statusChange: CampaignStatusChange;
}
