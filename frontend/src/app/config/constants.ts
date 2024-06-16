import { EnvConfig } from '@config/environment';

export const APP_SETTINGS = {
  USER_NAME: 'ANamelessWolf',
  CONTACT_EMAIL: 'contact_email@gmail.com',
  COMPANY_NAME: 'Nameless dev',
  OWNER_EMAIL: '',
};

export const LEDGER_API_URL = EnvConfig.LEDGER_API_URL;

export const LEDGER_API = {
  CATALOG: `${LEDGER_API_URL}/catalog`,
};
