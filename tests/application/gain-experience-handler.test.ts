import { describe, expect, it } from "vitest";
import { Campaign } from "../../src/domain/campaign/campaign";
import { CampaignRepository } from "../../src/domain/campaign/campaign-repository";
import { CampaignTitle } from "../../src/domain/value-objects/campaign-title";
import { GainExperienceHandler } from "../../src/application/use-cases/gain-experience/gain-experience-handler";

class InMemoryCampaignRepository implements CampaignRepository {
  public savedCampaigns: Campaign[] = [];

  save(campaign: Campaign): void {
    this.savedCampaigns.push(campaign);
  }

  findById(campaignId: string): Campaign | null {
    return this.savedCampaigns.find((campaign) => campaign.id === campaignId) ?? null;
  }

  findAllOrderedByStatusThenRecency(): Campaign[] {
    return this.savedCampaigns;
  }
}

describe("GainExperienceHandler", () => {
  it("adds experience to the campaign and persists it", () => {
    const repository = new InMemoryCampaignRepository();
    const campaign = Campaign.startNew(
      "campaign-1",
      CampaignTitle.fromUserInput("Blood on the Altar"),
      "The Dunwich Legacy",
      [],
      "01005",
      "Roland Banks",
      "guardian"
    );
    repository.save(campaign);

    const handler = new GainExperienceHandler(repository);
    handler.handle({
      campaignId: "campaign-1",
      experienceKind: "scenario",
      experienceAmount: 4,
      notes: "Victory!",
    });

    const storedCampaign = repository.findById("campaign-1");
    expect(storedCampaign?.getTotalExperience()).toBe(4);
  });

  it("throws when the campaign does not exist", () => {
    const repository = new InMemoryCampaignRepository();
    const handler = new GainExperienceHandler(repository);

    expect(() =>
      handler.handle({
        campaignId: "missing",
        experienceKind: "scenario",
        experienceAmount: 4,
        notes: null,
      })
    ).toThrow();
  });
});
