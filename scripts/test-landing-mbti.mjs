/**
 * /landing-mbti E2E 스크린샷 (Playwright)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", ".test-screenshots");
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function main() {
  const { chromium } = await import("playwright");
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });

  const log = [];

  await page.goto(`${baseUrl}/landing-mbti`, { waitUntil: "networkidle", timeout: 60000 });
  const skipIntro = page.getByRole("button", { name: "건너뛰기" });
  if (await skipIntro.isVisible().catch(() => false)) {
    await skipIntro.click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, "01-initial.png"), fullPage: true });

  await page.getByLabel("출생년도").fill("1990");
  await page.getByLabel("출생월").fill("5");
  await page.getByLabel("출생일").fill("15");

  await page.waitForSelector(".landing-preview__sentence", { timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, "02-result.png"), fullPage: true });

  const sentence = await page.locator(".landing-preview__sentence").textContent();
  const tone = await page.locator(".landing-preview__tone").textContent();
  log.push(`result: ${tone?.trim()} / ${sentence?.trim()}`);

  await page.getByRole("button", { name: "매일 받아보려면 이메일 입력" }).click();
  await page.waitForTimeout(900);

  const formInView = await page.evaluate(() => {
    const el = document.getElementById("launch-form");
    if (!el) return { ok: false, reason: "no #launch-form" };
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.1;
    return { ok: visible, top: Math.round(rect.top), vh };
  });
  log.push(`scroll: ${JSON.stringify(formInView)}`);

  await page.screenshot({ path: path.join(outDir, "03-email-scroll.png"), fullPage: false });

  const emailVisible = await page.locator("#launch-form").isVisible();
  log.push(`email form visible: ${emailVisible}`);

  await writeFile(path.join(outDir, "test-log.txt"), log.join("\n"), "utf8");
  await browser.close();

  console.log("SCREENSHOTS:", outDir);
  console.log(log.join("\n"));
  if (!sentence?.trim()) process.exitCode = 1;
  if (!formInView.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
