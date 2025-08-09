// import Stripe from 'stripe';
// import { Types } from 'mongoose';
// import { User } from '../app/modules/user/user.model';
// import stripe from '../app/modules/payment/utils';
// import { Subscription } from '../app/modules/subscription/subscription.model';

// const handleCheckoutSessionCompleted = async (
//   session: Stripe.Checkout.Session,
// ) => {
//   const { amount_total, metadata, payment_intent, payment_status } = session;
//   const userId = metadata?.userId as string;
//   const packageId = metadata?.packageId as string;
//   const products = JSON.parse(metadata?.products || '[]');
//   const email = session.customer_email || '';
//   const amountTotal = (amount_total ?? 0) / 100;

//   const subscription = await stripe.subscriptions.retrieve(
//     session.subscription as string,
//   );

//   const startDate = new Date(subscription.start_date * 1000);
//   const endDate = new Date(subscription.current_period_end * 1000);

//   const interval = subscription.items.data[0]?.plan?.interval as string;

//   const status = payment_status === 'paid' ? 'Completed' : 'Pending';

//   const paymentRecord = new Subscription({
//     amount: amountTotal,
//     user: new Types.ObjectId(userId),
//     package: new Types.ObjectId(packageId),
//     products,
//     email,
//     transactionId: payment_intent,
//     startDate,
//     endDate,
//     status,
//     subscriptionId: session.subscription,
//     stripeCustomerId: session.customer as string,
//     time: interval,
//   });

//   await paymentRecord.save();
// };

// // Function to handle invoice.payment_succeeded event
// const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
//   const subscription = await Subscription.findOne({
//     subscriptionId: invoice.subscription,
//   });

//   if (subscription) {
//     subscription.status = 'active';
//     await subscription.save();
//   }

//   const user = await User.findById(subscription?.user);
//   await User.findByIdAndUpdate(user?._id, {
//     $set: { subscription: true },
//   });
// };

// // Function to handle invoice.payment_failed event
// const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
//   const subscription = await Subscription.findOne({
//     subscriptionId: invoice.subscription,
//   });

//   if (subscription) {
//     subscription.status = 'expired'; // Update status to expired
//     await subscription.save();
//   }

//   const user = await User.findById(subscription?.user);
//   if (user) {
//     await User.findByIdAndUpdate(user._id, {
//       $set: { subscription: false }, // Update user subscription status
//     });
//   }
// };

// // Function to handle checkout.session.async_payment_failed event
// const handleAsyncPaymentFailed = async (session: Stripe.Checkout.Session) => {
//   const payment = await Subscription.findOne({
//     stripeCustomerId: session.customer as string,
//   });
//   if (payment) {
//     payment.status = 'Failed';
//     await payment.save();
//   }
// };

// // Function to handle customer.subscription.deleted event
// const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
//   const existingSubscription = await Subscription.findOne({
//     subscriptionId: subscription.id,
//   });

//   if (existingSubscription) {
//     existingSubscription.status = 'expired'; // Mark as expired
//     await existingSubscription.save();

//     const user = await User.findById(existingSubscription.user);
//     if (user) {
//       await User.findByIdAndUpdate(user._id, {
//         $set: { subscription: false },
//       });
//     }
//   }
// };

// export const WebhookService = {
//   handleCheckoutSessionCompleted,
//   handleInvoicePaymentSucceeded,
//   handleInvoicePaymentFailed,
//   handleAsyncPaymentFailed,
//   handleSubscriptionDeleted,
// };
