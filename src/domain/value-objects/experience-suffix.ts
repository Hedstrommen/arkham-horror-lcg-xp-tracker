export class ExperienceSuffix {
  private constructor(private readonly text: string) {}

  public static fromUserInput(rawText: string): ExperienceSuffix | null {
    const trimmedText = rawText.trim();
    if (trimmedText.length === 0) {
      return null;
    }
    if (trimmedText.length > 60) {
      throw new Error("Experience suffix cannot exceed 60 characters.");
    }
    return new ExperienceSuffix(trimmedText);
  }

  public toString(): string | null {
    return this.text;
  }
}
