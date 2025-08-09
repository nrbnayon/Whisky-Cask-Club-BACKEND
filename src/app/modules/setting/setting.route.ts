/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

import validateRequest from '../../middlewares/validateRequest';
import { settingValidaitons } from './setting.validation';
import { settingControllers } from './setting.controller';
const router = express.Router();

router.post(
  '/create-setting',
  auth(USER_ROLES.ADMIN),
  validateRequest(settingValidaitons.createSettingValidation),
  settingControllers.createSetting,
);

router.get('/', settingControllers.getAllSetting);

router.post(
  '/update-setting',
  auth(USER_ROLES.ADMIN),
  validateRequest(settingValidaitons.updateSettingValidation),
  settingControllers.updateSetting,
);

export const settingRoutes = router;
