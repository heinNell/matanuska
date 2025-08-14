import { useEffect, useState } from "react";

const WIALON_SDK_URL =
  "https://hosting.wialon.com/?token=c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053&lang=en/wsdk/script/wialon.js";
export function useWialonSdk() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ((window as any).wialon) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = WIALON_SDK_URL;
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  return ready;
}
