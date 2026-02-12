import { ValueObject } from "../../../shared/domain/value-object";
import { Location } from "./location";

interface RoutePointProps {
  location: Location;
  timestamp: Date;
}

/**
 * RoutePoint — Value Object, точка маршруту.
 * Внутрішній елемент агрегату Trip.
 */
export class RoutePoint extends ValueObject<RoutePointProps> {
  private constructor(props: RoutePointProps) {
    super(props);
  }

  static create(location: Location, timestamp: Date): RoutePoint {
    return new RoutePoint({ location, timestamp });
  }

  get location(): Location {
    return this.props.location;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  toString(): string {
    return `${this.props.location.toString()} @ ${this.props.timestamp.toISOString()}`;
  }
}
