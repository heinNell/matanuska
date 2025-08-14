// capacitor.config.ts
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "My App",
  webDir: "build", // Change this to your build directory
  bundledWebRuntime: false,
};

export default config;
