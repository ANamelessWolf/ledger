import { Router } from 'express';
import {
  getExpenseTypes, createExpenseType, updateExpenseType, deleteExpenseType,
  getFinancingTypes, createFinancingType, updateFinancingType, deleteFinancingType,
  getVendors, createVendor, updateVendor, deleteVendor,
  getWalletTypes, createWalletType, updateWalletType, deleteWalletType,
  getFinancingEntities, createFinancingEntity, updateFinancingEntity, deleteFinancingEntity,
} from '../controllers/settingsController';

const router = Router();

router.get('/expense-types',        getExpenseTypes);
router.post('/expense-types',       createExpenseType);
router.put('/expense-types/:id',    updateExpenseType);
router.delete('/expense-types/:id', deleteExpenseType);

router.get('/financing-types',        getFinancingTypes);
router.post('/financing-types',       createFinancingType);
router.put('/financing-types/:id',    updateFinancingType);
router.delete('/financing-types/:id', deleteFinancingType);

router.get('/vendors',        getVendors);
router.post('/vendors',       createVendor);
router.put('/vendors/:id',    updateVendor);
router.delete('/vendors/:id', deleteVendor);

router.get('/wallet-types',        getWalletTypes);
router.post('/wallet-types',       createWalletType);
router.put('/wallet-types/:id',    updateWalletType);
router.delete('/wallet-types/:id', deleteWalletType);

router.get('/financing-entities',        getFinancingEntities);
router.post('/financing-entities',       createFinancingEntity);
router.put('/financing-entities/:id',    updateFinancingEntity);
router.delete('/financing-entities/:id', deleteFinancingEntity);

export default router;
