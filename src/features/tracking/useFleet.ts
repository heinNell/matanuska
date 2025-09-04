import { useEffect, useMemo, useRef, useState } from "react";
import { CONFIG } from "../../config";
import { FleetItem, wialonService } from "../../services/wialonService";

export function useFleet() {
  const [status, setStatus] = useState<"idle" | "connecting" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const stopRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setStatus("connecting");

        // Use bootstrap method instead of loginWithToken
        wialonService.bootstrapFromLoginResponse({
          base_url: "https://hst-api.wialon.eu",
          eid: "51dffd4e89b2f38b26a7187c2911198d",
        });

        if (!mounted) return;
        setStatus("ready");
        stopRef.current = wialonService.watchFleet(CONFIG.UPDATE_MS, (f) => {
          if (!mounted) return;
          setFleet(f);
        });
      } catch (e) {
        setError((e as Error)?.message ?? String(e));
        setStatus("error");
      }
    })();
    return () => {
      mounted = false;
      if (stopRef.current) stopRef.current();
    };
  }, []);

  const stats = useMemo(() => {
    let active = 0,
      idle = 0,
      offline = 0;
    for (const v of fleet) {
      if (v.status === "active") active++;
      else if (v.status === "idle") idle++;
      else offline++;
    }
    return { active, idle, offline };
  }, [fleet]);

  return { status, error, fleet, stats };
}
