export interface GainExperienceCommand {
  campaignId: string;
  experienceKind: string;
  experienceAmount: number;
  notes: string | null;
}
