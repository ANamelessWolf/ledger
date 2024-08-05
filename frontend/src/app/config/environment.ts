// const env: NodeJS.ProcessEnv = process.env;

// Use the environment variables
const environment = {
  LEDGER_API_URL: 'http://192.168.1.195:3002',
  // LEDGER_API_URL: env['RBAC_ADMIN_API_URL'] || '',
  // TENANT_ID: env['TENANT_ID'] || '',
  // CLIENT_ID: env['CLIENT_ID'] || '',
};

export const EnvConfig = environment;
