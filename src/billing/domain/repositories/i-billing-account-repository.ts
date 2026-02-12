import { BillingAccount } from "../entities/billing-account";

export interface IBillingAccountRepository {
  save(account: BillingAccount): void;
  findByRiderId(riderId: string): BillingAccount | undefined;
}
