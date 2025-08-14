import { useState } from "react";
import { useWialonSession } from "@/hooks/useWialonSession";

export default function WialonLoginModal() {
  const [token, setToken] = useState("");
  const sdkReady = true; // or set this based on your app logic
  const { loggedIn, error, session } = useWialonSession(sdkReady);

  const handleLogin = () => {
    if (session && typeof session.loginToken === "function") {
      session.loginToken(token, "", () => {});
    }
  };

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (token.trim()) {
      handleLogin();
    }
  };

  return (
    <div>
      {!loggedIn ? (
        <>
          <input value={token} onChange={e => setToken(e.target.value)} placeholder="Wialon Token" />
          <button onClick={onClick}>Login</button>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </>
      ) : (
        <span>Logged in to Wialon!</span>
      )}
    </div>
  );
}
