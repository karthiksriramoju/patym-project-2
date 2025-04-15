// scheduler.js
import cron from 'node-cron';
import db from "@repo/db/client";

// Scheduled task to run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled job to process transactions');

  try {
    // Fetch all processing transactions
    const processingTransactions = await db.onRampTransaction.findMany({
      where: {
        status: "Processing",
      },
    });

    // Process each transaction
    for (const txn of processingTransactions) {
      await db.$transaction([
        db.balance.upsert({
          where: {
            userId: txn.userId,
          },
          update: {
            amount: {
              increment: txn.amount,
            },
          },
          create: {
            userId: txn.userId,
            amount: txn.amount,
            locked: 0,
          },
        }),
        db.onRampTransaction.update({
          where: {
            token: txn.token,
          },
          data: {
            status: "Success",
          },
        }),
      ]);
    }

    console.log('Processed all transactions successfully');

    
  } catch (error) {
    console.error('Error processing transactions:', error);
  }
});
