import { describe, expect, it } from "vitest";
import { Campaign } from "../../src/domain/campaign/campaign";
import { CampaignRepository } from "../../src/domain/campaign/campaign-repository";
import { CampaignTitle } from "../../src/domain/value-objects/campaign-title";
import { GainExperienceHandler } from "../../src/application/use-cases/gain-experience/gain-experience-handler";

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
    CampaignTitle.fromUserInput("Blood on the Altar"),
    "The Dunwich Legacy",
    1,
    [],
    "01005",
    "Roland Banks",
    "guardian"
  );
}

describe("GainExperienceHandler", () => {
  it("adds experience to the owner's campaign and persists it", () => {
    const repository = new InMemoryCampaignRepository();
    repository.save(buildCampaign());

    const handler = new GainExperienceHandler(repository);
    handler.handle({
      campaignId: "campaign-1",
      ownerId: OWNER_ID,
      experienceKind: "scenario",
      experienceAmount: 4,
      experienceTitle: "Scenario 1",
      notes: "Victory!",
    });

    expect(repository.findByIdAndOwnerId("campaign-1", OWNER_ID)?.getTotalExperience()).toBe(4);
  });

  it("refuses to touch a campaign owned by someone else", () => {
    const repository = new InMemoryCampaignRepository();
    repository.save(buildCampaign());

    const handler = new GainExperienceHandler(repository);
    expect(() =>
      handler.handle({
        campaignId: "campaign-1",
        ownerId: "intruder-1",
        experienceKind: "scenario",
        experienceAmount: 4,
        experienceTitle: "Scenario 2",
        notes: null,
      })
    ).toThrow();
  });

  it("throws when the campaign does not exist", () => {
    const repository = new InMemoryCampaignRepository();
    const handler = new GainExperienceHandler(repository);

    expect(() =>
      handler.handle({
        campaignId: "missing",
        ownerId: OWNER_ID,
        experienceKind: "scenario",
        experienceAmount: 4,
        experienceTitle: "Scenario 2",
        notes: null,
      })
    ).toThrow();
  });
});
