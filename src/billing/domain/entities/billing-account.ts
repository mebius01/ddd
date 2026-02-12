import { Entity } from "../../../shared/domain/entity";
import { UniqueId } from "../../../shared/domain/unique-id";

interface BillingAccountProps {
  riderId: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
}

export interface Transaction {
  tripId: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
}

/**
 * BillingAccount — Entity в контексті Billing.
 * Тут самокат — це просто ID з тарифом за хвилину.
 * Контекст Billing не знає про GPS, маршрути чи заряд батареї.
 */
export class BillingAccount extends Entity<BillingAccountProps> {
  private constructor(props: BillingAccountProps, id?: UniqueId) {
    super(props, id);
  }

  static create(
    riderId: string,
    initialBalance: number,
    currency: string = "UAH",
    id?: UniqueId
  ): BillingAccount {
    return new BillingAccount(
      { riderId, balance: initialBalance, currency, transactions: [] },
      id
    );
  }

  get riderId(): string {
    return this.props.riderId;
  }

  get balance(): number {
    return this.props.balance;
  }

  get currency(): string {
    return this.props.currency;
  }

  get transactions(): ReadonlyArray<Transaction> {
    return this.props.transactions;
  }

  charge(tripId: string, amount: number, description: string): void {
    if (this.props.balance < amount) {
      throw new Error(
        `Insufficient balance: ${this.props.balance} ${this.props.currency}, required: ${amount} ${this.props.currency}`
      );
    }
    this.props.balance -= amount;
    this.props.transactions.push({
      tripId,
      amount,
      currency: this.props.currency,
      description,
      date: new Date(),
    });
  }
}
