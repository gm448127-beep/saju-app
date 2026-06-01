import fs from "fs";
import path from "path";

const base = "c:/Users/user/Downloads/files";
for (const name of [
  "landing_with_moon.html",
  "landing_divorced_persona.html",
  "landing_decision_persona.html",
]) {
  let t = fs.readFileSync(path.join(base, name), "utf8");
  t = t.replace(/data:image[^"']+/g, "[img]");
  console.log("\n===", name, "===");
  for (const cls of ["crow", "r-line", "body", "btn", "waitlist"]) {
    const re = new RegExp(`class="${cls}"[^>]*>([\\s\\S]*?)<`, "g");
    let m;
    while ((m = re.exec(t))) {
      const text = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (text && text.length < 200) console.log(cls + ":", text);
    }
  }
  const secs = [...t.matchAll(/<section class="sec[^"]*">([\s\S]*?)<\/section>/g)];
  secs.forEach((s, i) => {
    const h2 = s[1].match(/<h2>([\s\S]*?)<\/h2>/);
    if (h2) console.log("sec" + i + " h2:", h2[1].replace(/<[^>]+>/g, " ").trim());
    const body = s[1].match(/<p class="body">([\s\S]*?)<\/p>/);
    if (body) console.log("sec" + i + " body:", body[1].replace(/<[^>]+>/g, " ").trim().slice(0, 300));
  });
}
