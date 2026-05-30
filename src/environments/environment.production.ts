// ══════════════════════════════════════════════════════════════════
//  PRODUCTION ENVIRONMENT
//  ────────────────────────────────────────────────────────────────
//  UPDATE THESE VALUES to point to YOUR deployed backend server.
//  Replace the placeholder below with your actual backend URL.
// ══════════════════════════════════════════════════════════════════

export const environment = {
  production: true,
  // apiBaseUrl: 'https://YOUR_BACKEND_URL',
  apiBaseUrl: 'https://remindly-backend-production-a3a0.up.railway.app',
  // wsBaseUrl: 'wss://YOUR_BACKEND_URL',
  wsBaseUrl: 'wss://remindly-backend-production-a3a0.up.railway.app',
  appName: 'Remindly',
  appEnv: 'production',
  enableAnalytics: true,
};
