import { generateDailyMetrics } from "../services/safetyAggregator.js";

(async () => {
  await generateDailyMetrics();
  console.log("📊 Initial safety metrics generated");
})();

setInterval(async () => {
  await generateDailyMetrics();
  console.log("📊 Daily safety metrics updated");
}, 24 * 60 * 60 * 1000);
