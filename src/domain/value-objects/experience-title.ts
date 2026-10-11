export class ExperienceTitle {
  private constructor(private readonly text: string) {}

  public static fromUserInput(rawText: string): ExperienceTitle {
    const trimmedText = rawText.trim();
    if (trimmedText.length === 0) {
      throw new Error("Experience title cannot be empty.");
    }
    if (trimmedText.length > 120) {
      throw new Error("Experience title cannot exceed 120 characters.");
    }
    return new ExperienceTitle(trimmedText);
  }

  public toString(): string {
    return this.text;
  }
}
