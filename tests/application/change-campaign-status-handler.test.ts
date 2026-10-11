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

  findByIdAndOwnerId(campaignId: string, ownerId: string): Campaign | null {
    return (
      this.storedCampaigns.find(
        (campaign) =>
          campaign.id === campaignId && campaign.ownerId === ownerId
      ) ?? null
    );
  }

  findAllByOwnerIdOrderedByStatusThenRecency(ownerId: string): Campaign[] {
    return this.storedCampaigns.filter(
      (campaign) => campaign.ownerId === ownerId
    );
  }
}

const OWNER_ID = "user-1";

function buildCampaign(): Campaign {
  return Campaign.startNew(
    "campaign-1",
    OWNER_ID,
    CampaignTitle.fromUserInput("Essex County Express run"),
    "The Dunwich Legacy",
    1,
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

    handler.handle({
      campaignId: "campaign-1",
      ownerId: OWNER_ID,
      statusChange: "finish",
    });

    expect(
      repository.findByIdAndOwnerId("campaign-1", OWNER_ID)?.getIsActive()
    ).toBe(false);
  });

  it("reactivates a finished campaign", () => {
    const repository = new InMemoryCampaignRepository();
    const campaign = buildCampaign();
    campaign.markFinished();
    repository.save(campaign);
    const handler = new ChangeCampaignStatusHandler(repository);

    handler.handle({
      campaignId: "campaign-1",
      ownerId: OWNER_ID,
      statusChange: "reactivate",
    });

    expect(
      repository.findByIdAndOwnerId("campaign-1", OWNER_ID)?.getIsActive()
    ).toBe(true);
  });

  it("refuses to change a campaign owned by someone else", () => {
    const repository = new InMemoryCampaignRepository();
    repository.save(buildCampaign());
    const handler = new ChangeCampaignStatusHandler(repository);

    expect(() =>
      handler.handle({
        campaignId: "campaign-1",
        ownerId: "intruder-1",
        statusChange: "finish",
      })
    ).toThrow();
  });

  it("throws for an unknown status change", () => {
    const repository = new InMemoryCampaignRepository();
    repository.save(buildCampaign());
    const handler = new ChangeCampaignStatusHandler(repository);

    expect(() =>
      handler.handle({
        campaignId: "campaign-1",
        ownerId: OWNER_ID,
        statusChange: "pause" as never,
      })
    ).toThrow();
  });

  it("throws when the campaign does not exist", () => {
    const repository = new InMemoryCampaignRepository();
    const handler = new ChangeCampaignStatusHandler(repository);

    expect(() =>
      handler.handle({
        campaignId: "missing",
        ownerId: OWNER_ID,
        statusChange: "finish",
      })
    ).toThrow();
  });
});
