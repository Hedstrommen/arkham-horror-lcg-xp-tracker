export type ExperienceKind = "scenario" | "interlude" | "weakness" | "permanent";

export class ExperienceType {
  private readonly kind: ExperienceKind;

  private constructor(kind: ExperienceKind) {
    this.kind = kind;
  }

  public static fromUserInput(rawKind: string): ExperienceType {
    const validKinds: ExperienceKind[] = [
      "scenario",
      "interlude",
      "weakness",
      "permanent",
    ];
    if (!validKinds.includes(rawKind as ExperienceKind)) {
      throw new Error(`Experience type must be one of: ${validKinds.join(", ")}.`);
    }
    return new ExperienceType(rawKind as ExperienceKind);
  }

  public getKind(): ExperienceKind {
    return this.kind;
  }

  public getDisplayName(): string {
    const displayNames: Record<ExperienceKind, string> = {
      scenario: "Scenario",
      interlude: "Interlude",
      weakness: "Weakness",
      permanent: "Permanent",
    };
    return displayNames[this.kind];
  }
}
