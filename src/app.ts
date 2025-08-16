// src\app.ts
import cors from 'cors';
import express, { Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import notFoundRoute from './app/middlewares/notFoundRoute';
// import { SubscriptionController } from 'app/modules/subscription/subscription.controller';

const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(
  cors({
    origin: ['http://localhost:3000', '*'],
    credentials: true,
  }),
);

// Webhook handler with raw body parsing - MUST be before other body parsers
// app.post(
//   '/my-webhook/stripe',
//   express.raw({ type: 'application/json' }),
//   SubscriptionController.handleWebhook,
// );

// JSON and text/plain content types
app.use(express.json({ limit: '200mb' }));
app.use(express.text({ type: 'text/plain', limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">Hay, how can i assist you</h1>',
  );
});

//global error handle
app.use(globalErrorHandler);

//*handle not found route;

app.use(notFoundRoute);

export default app;
