import { describe, expect, it } from "vitest";
import { Campaign } from "../../src/domain/campaign/campaign";
import { CampaignRepository } from "../../src/domain/campaign/campaign-repository";
import { CampaignTitle } from "../../src/domain/value-objects/campaign-title";
import { ChangeCampaignStatusHandler } from "../../src/application/use-cases/change-campaign-status/change-campaign-status-handler";

class InMemoryCampaignRepository implements CampaignRepository {
  public storedCampaigns: Campaign[] = [];

  save(campaign: Campaign): void {
    const existingIndex = this.storedCampaigns.findIndex(
      (storedCampaign) => storedCampaign.id === campaign.id
    );
    if (existingIndex >= 0) {
      this.storedCampaigns[existingIndex] = campaign;
    } else {
      this.storedCampaigns.push(campaign);
    }
  }

  findById(campaignId: string): Campaign | null {
    return (
      this.storedCampaigns.find((campaign) => campaign.id === campaignId) ??
      null
    );
  }

  findAllOrderedByStatusThenRecency(): Campaign[] {
    return this.storedCampaigns;
  }
}

function buildCampaign(): Campaign {
  return Campaign.startNew(
    "campaign-1",
    CampaignTitle.fromUserInput("Essex County Express run"),
    "The Dunwich Legacy",
    ["Sven"],
    "01005",
    "Roland Banks",
    "guardian"
  );
}

describe("ChangeCampaignStatusHandler", () => {
  it("marks a campaign finished", () => {
    const repository = new InMemoryCampaignRepository();
    repository.save(buildCampaign());
    const handler = new ChangeCampaignStatusHandler(repository);

    handler.handle({ campaignId: "campaign-1", statusChange: "finish" });

    expect(repository.findById("campaign-1")?.getIsActive()).toBe(false);
  });

  it("reactivates a finished campaign", () => {
    const repository = new InMemoryCampaignRepository();
    const campaign = buildCampaign();
    campaign.markFinished();
    repository.save(campaign);
    const handler = new ChangeCampaignStatusHandler(repository);

    handler.handle({ campaignId: "campaign-1", statusChange: "reactivate" });

    expect(repository.findById("campaign-1")?.getIsActive()).toBe(true);
  });

  it("throws for an unknown status change", () => {
    const repository = new InMemoryCampaignRepository();
    repository.save(buildCampaign());
    const handler = new ChangeCampaignStatusHandler(repository);

    expect(() =>
      handler.handle({
        campaignId: "campaign-1",
        statusChange: "pause" as never,
      })
    ).toThrow();
  });

  it("throws when the campaign does not exist", () => {
    const repository = new InMemoryCampaignRepository();
    const handler = new ChangeCampaignStatusHandler(repository);

    expect(() =>
      handler.handle({ campaignId: "missing", statusChange: "finish" })
    ).toThrow();
  });
});
