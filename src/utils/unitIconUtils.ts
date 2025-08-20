import L from "leaflet";

// You can expand this as you add more vehicle types
export function getUnitIcon(unit: any): L.Icon {
  const iconUrl =
    unit.getIconUrl?.(32) ||
    "https://cdn-icons-png.flaticon.com/512/61/61168.png"; // Default

  return L.icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -24],
    className: "fleet-marker-icon",
  });
}
