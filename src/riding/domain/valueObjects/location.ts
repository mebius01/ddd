import { ValueObject } from "../../../shared/domain/value-object";

interface LocationProps {
  latitude: number;
  longitude: number;
}

/**
 * Location — Value Object.
 * Якщо координати змінилися — це вже інша локація. ID не потрібен.
 */
export class Location extends ValueObject<LocationProps> {
  private constructor(props: LocationProps) {
    super(props);
  }

  static create(latitude: number, longitude: number): Location {
    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }
    return new Location({ latitude, longitude });
  }

  get latitude(): number {
    return this.props.latitude;
  }

  get longitude(): number {
    return this.props.longitude;
  }

  toString(): string {
    return `(${this.props.latitude}, ${this.props.longitude})`;
  }
}
