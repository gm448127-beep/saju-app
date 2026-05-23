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
});
