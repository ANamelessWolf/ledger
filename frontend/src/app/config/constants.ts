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
  CREDIT_CARD: `${LEDGER_API_URL}/creditcard`,
  DEBIT_CARD: `${LEDGER_API_URL}/debitcard`,
};

export const APP_CATALOGS = {
  CARD_DAYS: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28,
  ],
  CARD_MONTHS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  CARD_COLORS: [
    'black',
    'blue',
    'darkblue',
    'gold',
    'lightblue',
    'platinum',
    'purple',
    'red',
    'tangerine',
    'yellow',
  ],
};
