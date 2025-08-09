import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { settingRoutes } from '../app/modules/setting/setting.route';
import { privacyRoutes } from '../app/modules/privacy/privacy.routes';
import { aboutRoutes } from '../app/modules/aboutUs/aboutUs.route';
import { tersmConditionRoutes } from '../app/modules/termsAndCondition/termsAndCondition.route';
import { NewsLetterRoutes } from '../app/modules/newsLetter/newsLetter.route';
import { BlogRoutes } from '../app/modules/blog/blog.route';

const router = express.Router();

const apiRoutes = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/setting', route: settingRoutes },
  { path: '/privacy', route: privacyRoutes },
  { path: '/about', route: aboutRoutes },
  { path: '/terms', route: tersmConditionRoutes },
  { path: '/news-letter', route: NewsLetterRoutes },
  { path: '/blog', route: BlogRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
