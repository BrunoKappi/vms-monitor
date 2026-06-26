export const DASHBOARD_CONSTANTS = {
  // Use dynamically resolved hostname to support viewing on other devices on the same local network!
  BACKEND_URL: `http://${window.location.hostname || 'localhost'}:42200/api`,
  WS_STREAM_URL: `ws://${window.location.hostname || 'localhost'}:42300/stream`,
};
