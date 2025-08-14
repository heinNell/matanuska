// CommonJS shim for the 'jiti' package used by Tailwind to load configs.
// We provide a no-op implementation that returns a dummy loader function.
function jiti() {
  return () => {};
}

module.exports = jiti;
module.exports.createJiti = () => () => {};
