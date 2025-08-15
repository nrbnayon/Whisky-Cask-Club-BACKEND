import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { settingRoutes } from '../app/modules/setting/setting.route';
import { privacyRoutes } from '../app/modules/privacy/privacy.routes';
import { aboutRoutes } from '../app/modules/aboutUs/aboutUs.route';
import { tersmConditionRoutes } from '../app/modules/termsAndCondition/termsAndCondition.route';
import { NewsLetterRoutes } from '../app/modules/newsLetter/newsLetter.route';
import { BlogRoutes } from '../app/modules/blog/blog.route';
import { SubscriptionRoutes } from 'app/modules/subscription/subscription.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { ActivityLogRoutes } from '../app/modules/activityLog/activityLog.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { OnlineStatusRoutes } from '../app/modules/onlineStatus/onlineStatus.route';

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
  { path: '/subscriptions', route: SubscriptionRoutes },
  { path: '/messages', route: MessageRoutes },
  { path: '/activity-logs', route: ActivityLogRoutes },
  { path: '/notifications', route: NotificationRoutes },
  { path: '/online-status', route: OnlineStatusRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
