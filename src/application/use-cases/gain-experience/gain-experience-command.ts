export interface GainExperienceCommand {
  campaignId: string;
  ownerId: string;
  experienceKind: string;
  experienceAmount: number;
  experienceSuffix: string | null;
  notes: string | null;
}
