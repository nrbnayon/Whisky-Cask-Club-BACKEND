# File Tree: Whisky-Cask-Club-BACKEND

Generated on: 8/16/2025, 11:40:04 PM
Root path: `d:\Whisky-Cask-Club-BACKEND`

```
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 logs/
│   ├── 📁 combined/
│   │   ├── 📄 .7fe217df05ce3160f5f4c3261d900d882bba2e00-audit.json
│   │   ├── 📄 .d81166d051af102e3bc753fc691429ff377e1059-audit.json
│   │   ├── 📄 .f4ec377a3ce83d00033dcb1aceb38fb99872cef6-audit.json
│   │   ├── 📋 2025-08-09-combined.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-10-combined.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-14-combined.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-15-combined.log 🚫 (auto-hidden)
│   │   └── 📋 2025-08-16-combined.log 🚫 (auto-hidden)
│   ├── 📁 error/
│   │   ├── 📄 .63f7a5f410087241c28dae4d7b74c02b59cb7086-audit.json
│   │   ├── 📄 .84132a2342dd4e9ed17ece9c6fb4d0b7cc487e56-audit.json
│   │   ├── 📄 .a4ffb5bd724424e34e84dc149b0fe54e547b9b2c-audit.json
│   │   ├── 📋 2025-08-09-15-error.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-09-16-error.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-09-21-error.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-10-13-error.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-14-23-error.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-15-23-error.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-16-00-error.log 🚫 (auto-hidden)
│   │   ├── 📋 2025-08-16-01-error.log 🚫 (auto-hidden)
│   │   └── 📋 2025-08-16-23-error.log 🚫 (auto-hidden)
│   └── 📁 success/
│       ├── 📄 .6b573571ef24b0617571a7d2e8a0c540eff48426-audit.json
│       ├── 📄 .a7927258148d070f70b8a74a50b07c3e57f8b775-audit.json
│       ├── 📄 .cb0ba49116fe9514606e974966afca9fe3286b65-audit.json
│       ├── 📋 2025-08-09-15-success.log 🚫 (auto-hidden)
│       ├── 📋 2025-08-09-16-success.log 🚫 (auto-hidden)
│       ├── 📋 2025-08-10-13-success.log 🚫 (auto-hidden)
│       ├── 📋 2025-08-14-23-success.log 🚫 (auto-hidden)
│       ├── 📋 2025-08-15-23-success.log 🚫 (auto-hidden)
│       ├── 📋 2025-08-16-00-success.log 🚫 (auto-hidden)
│       ├── 📋 2025-08-16-01-success.log 🚫 (auto-hidden)
│       └── 📋 2025-08-16-23-success.log 🚫 (auto-hidden)
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 src/
│   ├── 📁 DB/
│   │   └── 📄 index.ts
│   ├── 📁 app/
│   │   ├── 📁 builder/
│   │   │   └── 📄 QueryBuilder.ts
│   │   ├── 📁 errors/
│   │   │   ├── 📄 AppError.ts
│   │   │   ├── 📄 handleCastError.ts
│   │   │   ├── 📄 handleDuplicateError.ts
│   │   │   ├── 📄 handleValidationError.ts
│   │   │   └── 📄 handleZodError.ts
│   │   ├── 📁 interface/
│   │   │   └── 📄 index.ts
│   │   ├── 📁 middlewares/
│   │   │   ├── 📄 auth.ts
│   │   │   ├── 📄 checkSubscriptionExpiry.ts
│   │   │   ├── 📄 fileUploadHandler.ts
│   │   │   ├── 📄 globalErrorHandler.ts
│   │   │   ├── 📄 notFoundRoute.ts
│   │   │   └── 📄 validateRequest.ts
│   │   └── 📁 modules/
│   │       ├── 📁 aboutUs/
│   │       │   ├── 📄 aboutUs.controller.ts
│   │       │   ├── 📄 aboutUs.interface.ts
│   │       │   ├── 📄 aboutUs.model.ts
│   │       │   ├── 📄 aboutUs.route.ts
│   │       │   ├── 📄 aboutUs.service.ts
│   │       │   └── 📄 aboutUs.validation.ts
│   │       ├── 📁 activityLog/
│   │       │   ├── 📄 activityLog.controller.ts
│   │       │   ├── 📄 activityLog.interface.ts
│   │       │   ├── 📄 activityLog.model.ts
│   │       │   ├── 📄 activityLog.route.ts
│   │       │   └── 📄 activityLog.service.ts
│   │       ├── 📁 auth/
│   │       │   ├── 📄 auth.controller.ts
│   │       │   ├── 📄 auth.lib.ts
│   │       │   ├── 📄 auth.route.ts
│   │       │   ├── 📄 auth.service.ts
│   │       │   └── 📄 auth.validation.ts
│   │       ├── 📁 blog/
│   │       │   ├── 📄 blog.controller.ts
│   │       │   ├── 📄 blog.interface.ts
│   │       │   ├── 📄 blog.model.ts
│   │       │   ├── 📄 blog.route.ts
│   │       │   ├── 📄 blog.services.ts
│   │       │   └── 📄 blog.validation.ts
│   │       ├── 📁 message/
│   │       │   ├── 📄 message.controller.ts
│   │       │   ├── 📄 message.interface.ts
│   │       │   ├── 📄 message.model.ts
│   │       │   ├── 📄 message.route.ts
│   │       │   ├── 📄 message.service.ts
│   │       │   └── 📄 message.validation.ts
│   │       ├── 📁 newsLetter/
│   │       │   ├── 📄 newsLetter.controller.ts
│   │       │   ├── 📄 newsLetter.interface.ts
│   │       │   ├── 📄 newsLetter.model.ts
│   │       │   ├── 📄 newsLetter.route.ts
│   │       │   └── 📄 newsLetter.services.ts
│   │       ├── 📁 notification/
│   │       │   ├── 📄 notification.controller.ts
│   │       │   ├── 📄 notification.interface.ts
│   │       │   ├── 📄 notification.model.ts
│   │       │   ├── 📄 notification.route.ts
│   │       │   ├── 📄 notification.service.ts
│   │       │   └── 📄 notification.validation.ts
│   │       ├── 📁 onlineStatus/
│   │       │   ├── 📄 onlineStatus.controller.ts
│   │       │   ├── 📄 onlineStatus.route.ts
│   │       │   └── 📄 onlineStatus.service.ts
│   │       ├── 📁 privacy/
│   │       │   ├── 📄 privacy.controller.ts
│   │       │   ├── 📄 privacy.interface.ts
│   │       │   ├── 📄 privacy.model.ts
│   │       │   ├── 📄 privacy.routes.ts
│   │       │   ├── 📄 privacy.service.ts
│   │       │   └── 📄 privacy.validation.ts
│   │       ├── 📁 resetToken/
│   │       │   ├── 📄 resetToken.interface.ts
│   │       │   └── 📄 resetToken.model.ts
│   │       ├── 📁 setting/
│   │       │   ├── 📄 setting.controller.ts
│   │       │   ├── 📄 setting.interface.ts
│   │       │   ├── 📄 setting.model.ts
│   │       │   ├── 📄 setting.route.ts
│   │       │   ├── 📄 setting.service.ts
│   │       │   └── 📄 setting.validation.ts
│   │       ├── 📁 subscription/
│   │       │   ├── 📄 subscription.controller.ts
│   │       │   ├── 📄 subscription.interface.ts
│   │       │   ├── 📄 subscription.model.ts
│   │       │   ├── 📄 subscription.route.ts
│   │       │   ├── 📄 subscription.service.ts
│   │       │   ├── 📄 subscription.types.ts
│   │       │   └── 📄 subscription.validation.ts
│   │       ├── 📁 termsAndCondition/
│   │       │   ├── 📄 termsAndCondition.controllers.ts
│   │       │   ├── 📄 termsAndCondition.interface.ts
│   │       │   ├── 📄 termsAndCondition.model.ts
│   │       │   ├── 📄 termsAndCondition.route.ts
│   │       │   ├── 📄 termsAndCondition.services.ts
│   │       │   └── 📄 termsAndCondition.validation.ts
│   │       └── 📁 user/
│   │           ├── 📄 user.controller.ts
│   │           ├── 📄 user.interface.ts
│   │           ├── 📄 user.model.ts
│   │           ├── 📄 user.route.ts
│   │           ├── 📄 user.service.ts
│   │           └── 📄 user.validation.ts
│   ├── 📁 config/
│   │   ├── 📄 firebase.config.ts
│   │   ├── 📄 index.ts
│   │   ├── 📄 redis.config.ts
│   │   └── 📄 stripe.config.ts
│   ├── 📁 enums/
│   │   └── 📄 user.ts
│   ├── 📁 helpers/
│   │   ├── 📄 emailHelper.ts
│   │   ├── 📄 getDistanceHelper.ts
│   │   ├── 📄 jwtHelper.ts
│   │   ├── 📄 month.ts
│   │   ├── 📄 notificationHelper.ts
│   │   ├── 📄 notificationsHelper.ts
│   │   ├── 📄 paginationHelper.ts
│   │   ├── 📄 sendMail.ts
│   │   └── 📄 socketHelper.ts
│   ├── 📁 jobs/
│   │   ├── 📄 cleanupJobs.ts
│   │   └── 📄 subscriptionCron.ts
│   ├── 📁 routes/
│   │   └── 📄 index.ts
│   ├── 📁 shared/
│   │   ├── 📄 catchAsync.ts
│   │   ├── 📄 emailService.ts
│   │   ├── 📄 emailTemplate.ts
│   │   ├── 📄 getFilePath.ts
│   │   ├── 📄 logger.ts
│   │   ├── 📄 morgen.ts
│   │   ├── 📄 pick.ts
│   │   ├── 📄 sendResponse.ts
│   │   └── 📄 unlinkFile.ts
│   ├── 📁 socket/
│   │   ├── 📁 userMessage/
│   │   │   └── 📄 message.ts
│   │   └── 📄 socket.ts
│   ├── 📁 types/
│   │   ├── 📄 auth.ts
│   │   ├── 📄 email.ts
│   │   ├── 📄 emailTemplate.ts
│   │   ├── 📄 errors.types.ts
│   │   ├── 📄 index.d.ts
│   │   └── 📄 pagination.ts
│   ├── 📁 util/
│   │   ├── 📄 cryptoToken.ts
│   │   └── 📄 generateOTP.ts
│   ├── 📄 app.ts
│   └── 📄 server.ts
├── 📁 uploads/
│   └── 📁 images/
│       ├── 🖼️ aesthetic-universe-nature-background-earth-mountain-remixed-media-1753939270700.jpg
│       ├── 🖼️ canvas-1753940249256.png
│       ├── 🖼️ closeup-golden-bitcoins-dark-reflective-surface-histogram-decreasing-crypto-1753939745441.jpg
│       ├── 🖼️ closeup-golden-bitcoins-dark-reflective-surface-histogram-decreasing-crypto-1753941202166.jpg
│       ├── 🖼️ ellipse-2-1753939111941.png
│       ├── 🖼️ image-1754302742362.png
│       ├── 🖼️ image-1754307358709.png
│       ├── 🖼️ images-1753937063154.jpeg
│       ├── 🖼️ screencapture-localhost-3000-auth-login-2025-07-30-15_49_30-1753937861308.png
│       └── 🖼️ vector-1753943820722.png
├── 📄 .dockerignore
├── 🔒 .env 🚫 (auto-hidden)
├── 📄 .env.example
├── 📄 .eslintignore
├── 📄 .eslintrc
├── 🚫 .gitignore
├── 📄 .prettierrc
├── 📝 API_DOCUMENTATION.md
├── 🐳 Dockerfile
├── 📖 README.md
├── ⚙️ docker-compose.yml
├── 🌐 index.html
├── ⚙️ nginx.conf
├── 📄 note
├── 📄 package.json
├── ⚙️ pnpm-lock.yaml
├── ⚙️ pnpm-workspace.yaml
├── 📄 tsconfig.json
└── 📄 vercel.json
```

---

_Generated by FileTree Pro Extension_
