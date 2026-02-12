import { Entity } from "./entity";
import { DomainEvent } from "./domain-event";
import { UniqueId } from "./unique-id";

/**
 * Aggregate Root — корінь агрегату.
 * Всі зміни внутрішніх об'єктів проходять через нього.
 * Накопичує доменні події для подальшої публікації.
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  constructor(props: T, id?: UniqueId) {
    super(props, id);
  }

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}
