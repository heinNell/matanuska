/**
 * Google Maps Type Definitions
 * This file provides TypeScript type definitions for the Google Maps JavaScript API.
 */

declare namespace google.maps {
  // Basic Google Maps types
  class Map {
    constructor(mapDiv: Element | null, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    getCenter(): LatLng;
    getZoom(): number;
    panTo(latLng: LatLng | LatLngLiteral): void;
    panBy(x: number, y: number): void;
    setOptions(options: MapOptions): void;
    getBounds(): LatLngBounds | undefined;
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral, padding?: number | Padding): void;
    controls: Array<MVCArray<Node>>;
    data: Data;
    mapTypes: MapTypeRegistry;
    overlayMapTypes: MVCArray<MapType>;
    setTilt(tilt: number): void;
    setHeading(heading: number): void;
    setMapTypeId(mapTypeId: string): void;
    getMapTypeId(): string;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    disableDefaultUI?: boolean;
    mapTypeId?: string;
    gestureHandling?: string;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    scaleControl?: boolean;
    streetViewControl?: boolean;
    rotateControl?: boolean;
    fullscreenControl?: boolean;
    styles?: Array<MapTypeStyle>;
    tilt?: number;
    restriction?: MapRestriction;
  }

  interface MapTypeStyle {
    stylers: Array<{ [key: string]: string | number | boolean }>;
    elementType?: string;
    featureType?: string;
  }

  interface MapRestriction {
    latLngBounds: LatLngBounds | LatLngBoundsLiteral;
    strictBounds?: boolean;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  interface Padding {
    bottom: number;
    left: number;
    right: number;
    top: number;
  }

  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    lat(): number;
    lng(): number;
    toJSON(): LatLngLiteral;
    toString(): string;
    equals(other: LatLng): boolean;
  }

  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    contains(latLng: LatLng | LatLngLiteral): boolean;
    equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    isEmpty(): boolean;
    toJSON(): LatLngBoundsLiteral;
    toString(): string;
    union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latLng: LatLng | LatLngLiteral): void;
    setTitle(title: string): void;
    setLabel(label: string | MarkerLabel): void;
    setIcon(icon: string | Icon | Symbol): void;
    setOpacity(opacity: number): void;
    setVisible(visible: boolean): void;
    setZIndex(zIndex: number): void;
    setDraggable(draggable: boolean): void;
    getPosition(): LatLng | null;
    getTitle(): string;
    getMap(): Map | null;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Icon | Symbol;
    label?: string | MarkerLabel;
    draggable?: boolean;
    clickable?: boolean;
    visible?: boolean;
    opacity?: number;
    zIndex?: number;
    animation?: Animation;
  }

  interface MarkerLabel {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  }

  interface Icon {
    url: string;
    size?: Size;
    scaledSize?: Size;
    origin?: Point;
    anchor?: Point;
    labelOrigin?: Point;
  }

  class MVCArray<T> {
    constructor(array?: Array<T>);
    getArray(): Array<T>;
    getAt(i: number): T;
    getLength(): number;
    insertAt(i: number, elem: T): void;
    removeAt(i: number): T;
    setAt(i: number, elem: T): void;
    push(elem: T): number;
    pop(): T;
    forEach(callback: (elem: T, i: number) => void): void;
    clear(): void;
  }

  interface MapTypeRegistry {
    set(id: string, mapType: MapType): void;
  }

  interface MapType {
    tileSize: Size;
    maxZoom?: number;
    minZoom?: number;
    radius?: number;
    name?: string;
    projection?: Projection;
    alt?: string;
  }

  class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    width: number;
    height: number;
    equals(other: Size): boolean;
    toString(): string;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
    equals(other: Point): boolean;
    toString(): string;
  }

  enum Animation {
    BOUNCE,
    DROP
  }

  class Data {
    add(feature: Data.Feature | Data.FeatureOptions): Data.Feature;
    addGeoJson(geoJson: object, options?: Data.GeoJsonOptions): Array<Data.Feature>;
    contains(feature: Data.Feature): boolean;
    forEach(callback: (feature: Data.Feature) => void): void;
    getFeatureById(id: number | string): Data.Feature | null;
    remove(feature: Data.Feature): void;
    setMap(map: Map | null): void;
    setStyle(style: Data.StyleOptions | ((feature: Data.Feature) => Data.StyleOptions)): void;
  }

  interface Projection {
    fromLatLngToPoint(latLng: LatLng, point?: Point): Point;
    fromPointToLatLng(point: Point, noWrap?: boolean): LatLng;
  }

  namespace Data {
    interface Feature {
      getGeometry(): Geometry;
      getId(): number | string | undefined;
      getProperty(name: string): any;
      setGeometry(geometry: Geometry | LatLng | LatLngLiteral): void;
      setProperty(name: string, value: any): void;
    }

    interface FeatureOptions {
      geometry?: Geometry | LatLng | LatLngLiteral;
      id?: number | string;
      properties?: object;
    }

    interface GeoJsonOptions {
      idPropertyName?: string;
    }

    interface StyleOptions {
      clickable?: boolean;
      cursor?: string;
      draggable?: boolean;
      editable?: boolean;
      fillColor?: string;
      fillOpacity?: number;
      icon?: string | Icon | Symbol;
      shape?: object; // MarkerShape
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      title?: string;
      visible?: boolean;
      zIndex?: number;
    }

    interface Geometry {
      getType(): string;
      forEachLatLng(callback: (latLng: LatLng) => void): void;
    }
  }
}

declare global {
  interface Window {
    google: typeof google;
  }
}
