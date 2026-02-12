import { BillingAccount } from "../domain/entities/billing-account";
import { IBillingAccountRepository } from "../domain/repositories/i-billing-account-repository";

export class InMemoryBillingAccountRepository
  implements IBillingAccountRepository
{
  private accounts: Map<string, BillingAccount> = new Map();

  save(account: BillingAccount): void {
    this.accounts.set(account.riderId, account);
  }

  findByRiderId(riderId: string): BillingAccount | undefined {
    return this.accounts.get(riderId);
  }
}
