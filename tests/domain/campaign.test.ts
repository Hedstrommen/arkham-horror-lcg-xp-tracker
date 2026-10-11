import { describe, expect, it } from "vitest";
import { Campaign } from "../../src/domain/campaign/campaign";
import { CampaignTitle } from "../../src/domain/value-objects/campaign-title";
import { ExperiencePoints } from "../../src/domain/value-objects/experience-points";
import { ExperienceType } from "../../src/domain/value-objects/experience-type";

function buildCampaign(): Campaign {
  return Campaign.startNew(
    "campaign-1",
    "user-1",
    CampaignTitle.fromUserInput("Essex County Express run"),
    "The Dunwich Legacy",
    1,
    ["Sven", "Lisa"],
    "01005",
    "Roland Banks",
    "guardian"
  );
}

describe("Campaign", () => {
  it("starts active with zero experience", () => {
    const campaign = buildCampaign();
    expect(campaign.getIsActive()).toBe(true);
    expect(campaign.getTotalExperience()).toBe(0);
  });

  it("accumulates experience across entries", () => {
    const campaign = buildCampaign();
    campaign.gainExperience(
      ExperienceType.fromUserInput("scenario"),
      ExperiencePoints.fromUserInput(3),
      "Scenario 1",
      null
    );
    campaign.gainExperience(
      ExperienceType.fromUserInput("weakness"),
      ExperiencePoints.fromUserInput(2),
      "Amnesia",
      "Bought Deduction"
    );
    expect(campaign.getTotalExperience()).toBe(5);
    expect(campaign.getExperienceLog()).toHaveLength(2);
  });

  it("rejects an empty title", () => {
    expect(() => CampaignTitle.fromUserInput("   ")).toThrow();
  });

  it("rejects a negative experience amount", () => {
    expect(() => ExperiencePoints.fromUserInput(-1)).toThrow();
  });

  it("rejects a non-integer experience amount", () => {
    expect(() => ExperiencePoints.fromUserInput(2.5)).toThrow();
  });

  it("rejects an unknown experience kind", () => {
    expect(() => ExperienceType.fromUserInput("ritual")).toThrow();
  });

  it("accepts the four experience kinds", () => {
    for (const kind of ["scenario", "interlude", "weakness", "permanent"]) {
      expect(ExperienceType.fromUserInput(kind).getKind()).toBe(kind);
    }
  });
});
