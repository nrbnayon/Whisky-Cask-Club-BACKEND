/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

import validateRequest from '../../middlewares/validateRequest';
import { aboutValidations } from './aboutUs.validation';
import { aboutControllers } from './aboutUs.controller';
const router = express.Router();

router.post(
  '/create-about',
  auth(USER_ROLES.ADMIN),
  validateRequest(aboutValidations.createAboutValidation),
  aboutControllers.createAbout,
);

router.get('/', aboutControllers.getAllAbout);

router.post(
  '/update-about',
  auth(USER_ROLES.ADMIN),
  validateRequest(aboutValidations.updateAboutValidation),
  aboutControllers.updateAbout,
);

export const aboutRoutes = router;
