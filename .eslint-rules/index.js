import requireFormImplementation from "./require-form-implementation.js";

// Named export (ESM)
export const rules = {
  "require-form-implementation": requireFormImplementation,
};

// Default export (ESM)
export default { rules };

// Optional CommonJS compatibility (if needed)
if (typeof module !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  module.exports = { rules };
}
