const buySubscription = catchAsync(async (req, res) => {
  const { plan, price, paymentMethodId }: CreateSubscriptionRequest = req.body;
  const userEmail = req.user.userEmail;
  const userId = req.user.userId;

  // Validation
  if (plan !== 'premium') {
    throw new AppError(
      status.BAD_REQUEST,
      'Only the premium plan is available.',
    );
  }

  if (price !== 3.99) {
    throw new AppError(
      status.BAD_REQUEST,
      'Price must be $3.99 for the premium plan.',
    );
  }

  try {
    const result = await UserService.buySubscriptionIntoDB(
      plan,
      price,
      userEmail,
      userId,
      paymentMethodId,
    );

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: 'Subscription created successfully.',
      data: result,
    });
  } catch (error) {
    logger.error('Subscription creation error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      'Subscription creation failed',
    );
  }
});

const handleWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || typeof sig !== 'string') {
    logger.error('Missing or invalid Stripe signature header');
    return next(
      new AppError(400, 'Missing or invalid Stripe signature header'),
    );
  }

  let event: Stripe.Event | undefined = undefined;

  // Try primary webhook secret first, then fallback to local
  const webhookSecrets = [
    process.env.STRIPE_WEBHOOK_SECRET || appConfig.stripe_webhook_secret,
    process.env.LOCAL_STRIPE_WEBHOOK_SECRET ||
      appConfig.local_stripe_webhook_secret,
  ].filter(Boolean); // Remove null/undefined values

  if (webhookSecrets.length === 0) {
    logger.error('No webhook secrets configured');
    return next(new AppError(500, 'Webhook secrets not configured'));
  }

  let lastError: Error | null = null;
  let webhookVerified = false;

  // Try each webhook secret until one works
  for (let i = 0; i < webhookSecrets.length; i++) {
    const webhookSecret = webhookSecrets[i];

    try {
      logger.info(
        `Attempting webhook verification with secret ${i + 1}/${
          webhookSecrets.length
        }`,
      );

      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret as string,
      );
      webhookVerified = true;

      logger.info(`Webhook verification successful with secret ${i + 1}`);
      break; // Success - exit the loop
    } catch (err) {
      const error = err as Error;
      lastError = error;

      logger.warn(
        `Webhook verification failed with secret ${i + 1}: ${error.message}`,
      );

      // Continue to next secret if available
      if (i < webhookSecrets.length - 1) {
        logger.info('Trying fallback webhook secret...');
        continue;
      }
    }
  }

  // If all webhook secrets failed
  if (!webhookVerified || !event) {
    logger.error(
      'All webhook signature verifications failed:',
      lastError?.message,
    );
    return next(new AppError(400, `Webhook Error: ${lastError?.message}`));
  }

  logger.info('Webhook event received:', event.type);

  try {
    await UserService.handleStripeWebhook(event);
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    return next(new AppError(500, 'Webhook processing failed'));
  }
});

const cancelSubscription = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await UserService.cancelSubscriptionIntoDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Subscription cancelled successfully.',
    data: result,
  });
});

const getSubscriptionStatus = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await UserService.getSubscriptionStatus(userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Subscription status retrieved successfully.',
    data: result,
  });
});

const syncSubscriptionStatus = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await UserService.syncSubscriptionStatus(userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Subscription status synchronized successfully.',
    data: result,
  });
});

export const SubscriptionController = {
  buySubscription,
  handleWebhook,
  cancelSubscription,
  getSubscriptionStatus,
  syncSubscriptionStatus,
};
