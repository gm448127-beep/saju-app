#!/usr/bin/env node
/**
 * tarot-cards.json + 이미지 파일 검사
 * 사용: node scripts/verify-tarot-cards.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataPath = path.join(root, "public", "data", "tarot-cards.json");
const tarotDir = path.join(root, "public", "tarot");
const cardsDir = path.join(tarotDir, "cards");

const deck = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

function existsAny(basePath) {
  const exts = [".jpg", ".jpeg", ".png", ".webp"];
  for (const ext of exts) {
    if (fs.existsSync(basePath + ext)) return basePath + ext;
  }
  return null;
}

function resolveImage(def) {
  const fromJson = path.join(root, "public", def.image.replace(/^\//, "").replace(/\//g, path.sep));
  const baseJson = fromJson.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  const hit = existsAny(baseJson);
  if (hit) return path.relative(root, hit);

  const inCards = path.join(cardsDir, `${def.name}.png`);
  if (fs.existsSync(inCards)) return path.relative(root, inCards);

  return null;
}

const missing = [];
const found = [];

for (const card of deck) {
  const file = resolveImage(card);
  if (file) found.push(`${card.name_ko} → ${file}`);
  else missing.push(`${card.name_ko} (${card.image})`);
}

console.log(`\n타로 덱: ${deck.length}장 (public/data/tarot-cards.json)\n`);
console.log(`✓ 이미지: ${found.length} / ${deck.length}`);
if (found.length <= 5) {
  for (const line of found) console.log(`  - ${line}`);
} else {
  for (const line of found.slice(0, 3)) console.log(`  - ${line}`);
  console.log(`  … 외 ${found.length - 3}장`);
}

if (missing.length) {
  console.log(`\n✗ 없음: ${missing.length}`);
  for (const line of missing) console.log(`  - ${line}`);
  console.log("\n이미지는 public/tarot/*.jpg 또는 public/tarot/cards/*.png 에 넣어주세요.\n");
  process.exitCode = 1;
} else {
  console.log("\n모든 카드 이미지가 연결 가능합니다.\n");
}
