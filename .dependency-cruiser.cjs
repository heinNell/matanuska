/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    tsConfig: { fileName: "tsconfig.json" },
    doNotFollow: { path: "node_modules" },
    exclude: {
      path: [
        "^src/.*\\.d\\.ts$",
        "^src/.*/__tests__/.*",
        "^src/.*\\.test\\.(ts|tsx)$",
        "^src/.*\\.stories\\.(ts|tsx)$",
        "^src/.*/(mocks|fixtures)/.*",
      ],
    },
  },
  forbidden: [
    {
      name: "no-orphans",
      severity: "warn",
      comment: "Files not imported by anyone",
      from: { path: "^src" },
      to: { orphan: true },
    },
    {
      name: "no-circular",
      severity: "warn",
      comment: "Disallow circular deps",
      from: {},
      to: { circular: true },
    },
  ],
};
