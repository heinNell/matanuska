// src/types/wialon-augmentations.d.ts
declare module "wialon" {
  interface WialonUnit {
    id?: number | string;
    uid?: number | string;
    nm?: string;
    name?: string;
    pos?: any;
    getId?: () => number | string;
    getName?: () => string;
    getPosition?: () => any;
  }
}
