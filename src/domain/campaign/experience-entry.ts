import { ExperiencePoints } from "../value-objects/experience-points";
import { ExperienceType } from "../value-objects/experience-type";

export class ExperienceEntry {
  public experienceType: ExperienceType;
  public experiencePoints: ExperiencePoints;
  public experienceSuffix: string | null;
  public notes: string | null;

  constructor(
    public readonly id: string,
    experienceType: ExperienceType,
    experiencePoints: ExperiencePoints,
    experienceSuffix: string | null,
    notes: string | null
  ) {
    this.experienceType = experienceType;
    this.experiencePoints = experiencePoints;
    this.experienceSuffix = experienceSuffix;
    this.notes = notes;
  }
}
