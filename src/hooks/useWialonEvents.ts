import { useEffect, useState } from "react";
import wialonService from "../services/wialonService";
import type { Event } from "@/types/wialon-types";

export function useWialonEvents(unitId: number, type: string, timeFrom: number, timeTo: number) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await wialonService.executeCustomMethod<any>(
        "events/get",
        { selector: { type, timeFrom, timeTo, detalization: 0x1 } }
      );
      if (active && res) {
        // Adapt to your schema
        setEvents(Object.values(res[type] || {}).map((e: any) => ({
          id: String(e.id ?? ""),
          type,
          value: e.value,
          time: new Date(e.from?.t * 1000)
        })));
      }
    })();
    return () => { active = false; };
  }, [unitId, type, timeFrom, timeTo]);

  return events;
}
