const cron = require("node-cron");
const User = require("../models/user");


function removeUnverifiedAccount() {
  // Avoid scheduling cron jobs on serverless platforms (they are ephemeral)
  if (process.env.VERCEL) return;

  cron.schedule("*/5 * * * *", async () => {
    const TenMinuteAgo = new Date(Date.now() - 5 * 60 * 1000);
    const UserDelete = await User.deleteMany({
      accountVerified: false,
      createdAt: { $lt: TenMinuteAgo },
    });
    // console.log(`Deleted ${UserDelete.deletedCount} unverified users`);
  });
}

module.exports = removeUnverifiedAccount;

// const cron = require("node-cron");

// cron.schedule("*/2 * * * * *", () => {
//   console.log("Running every minute...");
// });
