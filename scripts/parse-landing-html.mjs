import fs from "fs";
import path from "path";

const base = "c:/Users/user/Downloads/files";
const files = [
  "landing_with_moon.html",
  "landing_divorced_persona.html",
  "landing_decision_persona.html",
];

for (const name of files) {
  let t = fs.readFileSync(path.join(base, name), "utf8");
  t = t.replace(/data:image[^"']+/g, "[img]");
  console.log("===", name, "===");
  const h1 = t.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (h1) console.log("H1:", h1[1].replace(/<[^>]+>/g, "").trim());
  const lead = t.match(/<p class="lead">([\s\S]*?)<\/p>/);
  if (lead) console.log("LEAD:", lead[1].replace(/<[^>]+>/g, " ").trim());
  const kickers = [...t.matchAll(/<div class="kicker">([\s\S]*?)<\/div>/g)];
  kickers.forEach((m) => console.log("KICKER:", m[1].trim()));
  const h2s = [...t.matchAll(/<h2>([\s\S]*?)<\/h2>/g)];
  h2s.forEach((m) => {
    const s = m[1].replace(/<[^>]+>/g, " ").trim();
    if (s.length < 120) console.log("H2:", s);
  });
  console.log();
}
