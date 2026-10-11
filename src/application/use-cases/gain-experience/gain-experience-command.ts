export interface GainExperienceCommand {
  campaignId: string;
  ownerId: string;
  experienceKind: string;
  experienceAmount: number;
  experienceTitle: string;
  notes: string | null;
}
