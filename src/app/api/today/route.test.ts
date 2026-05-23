import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/today/route";

/** 테스트마다 동일한 「오늘」이 되도록 고정 (로컬 2026-05-19 정오) */
const FIXED_TODAY = new Date(2026, 4, 19, 12, 0, 0, 0);

const BASE_PAYLOAD = {
  year: 1995,
  month: 8,
  day: 17,
  gender: "여",
  isLunar: false,
  hour: 9,
  minute: 30,
} as const;

type TodayScores = {
  overall: number;
  wealth: number;
  love: number;
  career: number;
  health: number;
  luck: number;
};

type HourlyFlowItem = {
  hour: string;
  score: number;
  branch: string;
  sipsin: string;
  isMyHour?: boolean;
};

type TodayPostBody = {
  scores: TodayScores;
  hourlyFlow: HourlyFlowItem[];
  domainScores?: { score: number }[];
};

function createPostRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/today", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function callTodayApi(body: Record<string, unknown>): Promise<TodayPostBody> {
  const response = await POST(createPostRequest(body));
  expect(response.status).toBe(200);
  return (await response.json()) as TodayPostBody;
}

function scoreKeys(): (keyof TodayScores)[] {
  return ["overall", "wealth", "love", "career", "health", "luck"];
}

function collectAllScores(data: TodayPostBody): number[] {
  const main = scoreKeys().map((key) => data.scores[key]);
  const hourly = data.hourlyFlow.map((slot) => slot.score);
  const domains = (data.domainScores ?? []).map((d) => d.score);
  return [...main, ...hourly, ...domains];
}

function hourlyScoreVector(flow: HourlyFlowItem[]) {
  return flow.map((slot) => slot.score);
}

describe("POST /api/today", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("같은 입력·같은 날짜면 scores와 hourlyFlow가 결정론적으로 동일하다", async () => {
    const first = await callTodayApi({ ...BASE_PAYLOAD });
    const second = await callTodayApi({ ...BASE_PAYLOAD });

    expect(second.scores).toEqual(first.scores);
    expect(second.hourlyFlow).toEqual(first.hourlyFlow);
  });

  it("hour 입력 시 태어난 시지와 같은 슬롯에 isMyHour가 true다", async () => {
    const data = await callTodayApi({ ...BASE_PAYLOAD });
    const myHourSlots = data.hourlyFlow.filter((slot) => slot.isMyHour);

    expect(myHourSlots.length).toBe(1);
    expect(data.hourlyFlow.every((slot) => !slot.isMyHour || slot === myHourSlots[0])).toBe(true);
  });

  it("hour 미입력 시 hourlyFlow의 isMyHour는 모두 false다", async () => {
    const data = await callTodayApi({
      year: BASE_PAYLOAD.year,
      month: BASE_PAYLOAD.month,
      day: BASE_PAYLOAD.day,
      gender: BASE_PAYLOAD.gender,
      isLunar: BASE_PAYLOAD.isLunar,
    });

    expect(data.hourlyFlow.every((slot) => !slot.isMyHour)).toBe(true);
  });

  it("hour 미입력 vs 입력 시 hourlyFlow 점수 분포가 달라진다", async () => {
    const withHour = await callTodayApi({ ...BASE_PAYLOAD });
    const withoutHour = await callTodayApi({
      year: BASE_PAYLOAD.year,
      month: BASE_PAYLOAD.month,
      day: BASE_PAYLOAD.day,
      gender: BASE_PAYLOAD.gender,
      isLunar: BASE_PAYLOAD.isLunar,
    });

    const withVector = hourlyScoreVector(withHour.hourlyFlow);
    const withoutVector = hourlyScoreVector(withoutHour.hourlyFlow);

    expect(withVector).not.toEqual(withoutVector);
    expect(withHour.scores).not.toEqual(withoutHour.scores);
  });

  it("모든 점수가 20~99 범위 안에 있다", async () => {
    const data = await callTodayApi({ ...BASE_PAYLOAD });
    const allScores = collectAllScores(data);

    expect(allScores.length).toBeGreaterThan(0);
    for (const score of allScores) {
      expect(score).toBeGreaterThanOrEqual(20);
      expect(score).toBeLessThanOrEqual(99);
    }
  });

  it("시간 모름(timeMode none)과 동일하게 hour 없이 호출해도 200·isMyHour 없음", async () => {
    const data = await callTodayApi({
      year: BASE_PAYLOAD.year,
      month: BASE_PAYLOAD.month,
      day: BASE_PAYLOAD.day,
      gender: BASE_PAYLOAD.gender,
      isLunar: BASE_PAYLOAD.isLunar,
    });

    expect(data.scores.overall).toBeGreaterThanOrEqual(20);
    expect(data.hourlyFlow).toHaveLength(12);
    expect(data.hourlyFlow.every((slot) => !slot.isMyHour)).toBe(true);
  });

  it("hour 입력 시 isMyHour는 시주 지지와 일치한다(9:30 → 진 시진)", async () => {
    const data = await callTodayApi({ ...BASE_PAYLOAD });
    const mySlot = data.hourlyFlow.find((slot) => slot.isMyHour);

    expect(mySlot).toBeDefined();
    // 만세력 시주 지지(이 프로필 9:30) — 벽시각 巳와 다를 수 있음
    expect(mySlot?.branch).toBe("진");
  });

  it("siBonus·시간별 seed 변화가 전체 점수를 비정상적으로 치우치지 않는다", async () => {
    const hourSamples = [0, 3, 6, 9, 12, 15, 18, 21];
    const overalls: number[] = [];

    for (const hour of hourSamples) {
      const data = await callTodayApi({
        ...BASE_PAYLOAD,
        hour,
        minute: 0,
      });
      overalls.push(data.scores.overall);
      expect(data.scores.overall).toBeGreaterThanOrEqual(20);
      expect(data.scores.overall).toBeLessThanOrEqual(99);
    }

    const mean = overalls.reduce((a, b) => a + b, 0) / overalls.length;
    const spread = Math.max(...overalls) - Math.min(...overalls);

    expect(mean).toBeGreaterThanOrEqual(40);
    expect(mean).toBeLessThanOrEqual(88);
    expect(spread).toBeLessThanOrEqual(45);
    expect(new Set(overalls).size).toBeGreaterThan(1);
  });
});
