import { ExperiencePoints } from "../value-objects/experience-points";
import { ExperienceType } from "../value-objects/experience-type";

export class ExperienceEntry {
  public experienceType: ExperienceType;
  public experiencePoints: ExperiencePoints;
  public experienceTitle: string;
  public notes: string | null;

  constructor(
    public readonly id: string,
    experienceType: ExperienceType,
    experiencePoints: ExperiencePoints,
    experienceTitle: string,
    notes: string | null
  ) {
    this.experienceType = experienceType;
    this.experiencePoints = experiencePoints;
    this.experienceTitle = experienceTitle;
    this.notes = notes;
  }
}
