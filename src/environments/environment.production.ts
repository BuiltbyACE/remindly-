declare const NG_APP_API_BASE_URL: string;
declare const NG_APP_WS_BASE_URL: string;

export const environment = {
  production: true,
  apiBaseUrl: (typeof NG_APP_API_BASE_URL !== 'undefined' ? NG_APP_API_BASE_URL : '') as string,
  wsBaseUrl: (typeof NG_APP_WS_BASE_URL !== 'undefined' ? NG_APP_WS_BASE_URL : '') as string,
  appName: 'Remindly',
  appEnv: 'production',
  enableAnalytics: true,
};
