const {
  validateScheduleToken,
} = require("../middlewares/verifyScheduleToken.middleware");
class ScheduleController {
  setupRoutes(router) {
    router.post(
      "/daily-schedule",
      validateScheduleToken({
        name: "daily_12am_trigger",
        cron: "0 0 * * ? *",
      }),
      this.dailySchedule
    );

    router.post(
      "/every-minute-schedule",
      validateScheduleToken({
        name: "every_minute_trigger",
        cron: "0/1 * * * ? *",
      }),
      this.everyMinuteSchedule
    );
  }

  async dailySchedule(req, res) {
    // Your code here
    console.log("Daily schedule invoked");
    res.status(200).json({ message: "Daily schedule invoked" });
  }
  async everyMinuteSchedule(req, res) {
    // Your code here
    console.log("Every minute schedule invoked");
    res.status(200).json({ message: "Every minute schedule invoked" });
  }
}

module.exports = new ScheduleController();
