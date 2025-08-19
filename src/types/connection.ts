// Shared connection status type used across UI and services
export type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "reconnecting"
  | "error";
