const { calculateSaju } = require("ssaju");
const result = calculateSaju({
  year: 1971,
  month: 1,
  day: 18,
  hour: 9,
  minute: 15,
  gender: "여",
  calendar: "lunar",
  timezone: "Asia/Seoul",
  applyLocalMeanTime: true,
  longitude: 126.9784
});

console.log("=== pillarDetails ===");
const pd = result.pillarDetails;
console.log("년주:", pd.year.stemKo, pd.year.branchKo);
console.log("월주:", pd.month.stemKo, pd.month.branchKo);
console.log("일주:", pd.day.stemKo, pd.day.branchKo);
console.log("시주:", pd.hour.stemKo, pd.hour.branchKo);

console.log("\n=== fiveElements ===");
console.log(JSON.stringify(result.fiveElements, null, 2));

console.log("\n=== hiddenStems ===");
if (result.pillarDetails) {
  for (const key of ["year","month","day","hour"]) {
    const p = pd[key];
    console.log(key + " hidden:", JSON.stringify(p.hiddenStems));
  }
}
