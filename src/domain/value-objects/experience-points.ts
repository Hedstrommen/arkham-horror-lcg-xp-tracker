export class ExperiencePoints {
  private readonly amount: number;

  private constructor(amount: number) {
    this.amount = amount;
  }

  public static fromUserInput(rawAmount: number): ExperiencePoints {
    if (!Number.isInteger(rawAmount)) {
      throw new Error("Experience must be a whole number.");
    }
    if (rawAmount < 0) {
      throw new Error("Experience cannot be negative.");
    }
    return new ExperiencePoints(rawAmount);
  }

  public getAmount(): number {
    return this.amount;
  }
}
