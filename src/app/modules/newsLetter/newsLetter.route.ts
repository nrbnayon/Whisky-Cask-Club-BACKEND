import express from 'express';
import { NewsLetterController } from './newsLetter.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router.post('/subscribe-newsletter', NewsLetterController.createNewsLetter);
router.get(
  '/all-newsletters',
  auth(USER_ROLES.ADMIN),
  NewsLetterController.getAllNewsLetters,
);

export const NewsLetterRoutes = router;
