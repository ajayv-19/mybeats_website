module.exports = {
  now() {
    return new Date().toLocaleDateString("en-ca");
  },
  addDays(
    localeDateString,
    intervalCount = 1,
    interval = "day",
    locale = "en-US"
  ) {
    const date = new Date(localeDateString); // Parse the input date string

    if (isNaN(date)) {
      throw new Error("Invalid Date Format");
    }

    const fractionalPart = intervalCount % 1; // Extract fractional part (e.g., 1.5 -> 0.5)
    const wholePart = Math.floor(intervalCount); // Extract whole part (e.g., 1.5 -> 1)

    switch (interval.toLowerCase()) {
      case "day":
        // Add days (whole + fractional as part of a day)
        date.setDate(date.getDate() + wholePart + fractionalPart);
        break;

      case "month":
        // Add months (whole part first)
        date.setMonth(date.getMonth() + wholePart);
        // Handle fractional months (approximate as days: 0.5 months ≈ 15 days)
        if (fractionalPart > 0) {
          const daysInCurrentMonth = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
          ).getDate();
          const fractionalDays = Math.round(
            daysInCurrentMonth * fractionalPart
          );
          date.setDate(date.getDate() + fractionalDays);
        }
        break;

      case "year":
        // Add years (whole part first)
        date.setFullYear(date.getFullYear() + wholePart);
        // Handle fractional years (approximate as days: 0.25 years ≈ 91 days)
        if (fractionalPart > 0) {
          const daysInYear = 365; // Assume non-leap year for simplicity
          const fractionalDays = Math.round(daysInYear * fractionalPart);
          date.setDate(date.getDate() + fractionalDays);
        }
        break;

      default:
        throw new Error("Invalid interval. Use 'day', 'month', or 'year'.");
    }

    // Return the result in the specified locale format
    return date.toLocaleDateString(locale);
  },
};
