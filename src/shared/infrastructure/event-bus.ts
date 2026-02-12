import { DomainEvent } from "../domain/domain-event";

type EventHandler = (event: DomainEvent) => void;

/**
 * EventBus — простий in-memory механізм публікації/підписки на доменні події.
 * У реальному проекті це може бути RabbitMQ, Kafka, Redis Streams тощо.
 */
export class EventBus {
  private static handlers: Map<string, EventHandler[]> = new Map();

  static subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  static publish(event: DomainEvent): void {
    const handlers = this.handlers.get(event.eventName) ?? [];
    for (const handler of handlers) {
      handler(event);
    }
  }

  static publishAll(events: ReadonlyArray<DomainEvent>): void {
    for (const event of events) {
      this.publish(event);
    }
  }

  static clear(): void {
    this.handlers.clear();
  }
}
