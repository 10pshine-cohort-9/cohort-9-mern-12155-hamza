const { TextEncoder, TextDecoder } = require("node:util");

if (globalThis.TextEncoder === undefined) {
  globalThis.TextEncoder = TextEncoder;
}
if (globalThis.TextDecoder === undefined) {
  globalThis.TextDecoder = TextDecoder;
}
