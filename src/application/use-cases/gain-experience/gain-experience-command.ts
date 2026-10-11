export interface GainExperienceCommand {
  campaignId: string;
  ownerId: string;
  experienceKind: string;
  experienceAmount: number;
  notes: string | null;
}
