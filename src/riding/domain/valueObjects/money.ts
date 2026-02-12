import { ValueObject } from "../../../shared/domain/value-object";

interface MoneyProps {
  amount: number;
  currency: string;
}

/**
 * Money — Value Object.
 * 10 доларів — це завжди 10 доларів, незалежно від того, звідки вони.
 */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  static create(amount: number, currency: string): Money {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    if (!currency || currency.length !== 3) {
      throw new Error("Currency must be a 3-letter ISO code");
    }
    return new Money({ amount, currency: currency.toUpperCase() });
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  add(other: Money): Money {
    if (this.props.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return Money.create(this.props.amount + other.amount, this.props.currency);
  }

  multiply(factor: number): Money {
    return Money.create(
      Math.round(this.props.amount * factor * 100) / 100,
      this.props.currency,
    );
  }

  toString(): string {
    return `${this.props.amount.toFixed(2)} ${this.props.currency}`;
  }
}
