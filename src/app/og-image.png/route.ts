import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

const size = { width: 1200, height: 630 };

function OgImage() {
  return React.createElement(
    "div",
    {
      style: {
        background: "#FAF8F5",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "42px",
        color: "#2F282B",
        position: "relative",
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute",
        right: "-120px",
        top: "-150px",
        width: "430px",
        height: "430px",
        borderRadius: "999px",
        background: "#F1E7DE",
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        left: "-110px",
        bottom: "-150px",
        width: "430px",
        height: "430px",
        borderRadius: "999px",
        background: "#F8F3EE",
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          position: "relative",
          width: "100%",
          height: "100%",
          border: "2px solid #E2D7D0",
          borderRadius: "46px",
          background: "#FFFDF9",
          padding: "58px 64px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: "0 26px 70px rgba(61, 51, 56, 0.12)",
        },
      },
      React.createElement("div", {
        style: {
          position: "absolute",
          right: "36px",
          top: "112px",
          display: "flex",
          color: "#F1E7DE",
          fontSize: "340px",
          fontWeight: 900,
          lineHeight: 1,
        },
      }, "命"),
      React.createElement(
        "div",
        {
          style: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "28px",
            width: "100%",
            marginBottom: "44px",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              width: "104px",
              height: "104px",
              borderRadius: "30px",
              background: "#2F282B",
              border: "2px solid #2F282B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F4E7D6",
              fontSize: "58px",
              fontWeight: 900,
              lineHeight: 1,
              boxShadow: "0 14px 34px rgba(47, 40, 43, 0.18)",
            },
          },
          "命",
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                fontSize: "68px",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              },
            },
            "운명비서",
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                fontSize: "24px",
                fontWeight: 700,
                color: "#8B6F47",
                letterSpacing: "-0.02em",
              },
            },
            "AI SAJU REPORT",
          ),
        ),
      ),
      React.createElement(
        "div",
        {
          style: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            width: "100%",
            maxWidth: "820px",
            alignSelf: "flex-start",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              fontSize: "64px",
              fontWeight: 900,
              color: "#3D3338",
              letterSpacing: "-0.04em",
              lineHeight: 1.12,
            },
          },
          "오늘의 운세부터",
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              fontSize: "64px",
              fontWeight: 900,
              color: "#3D3338",
              letterSpacing: "-0.04em",
              lineHeight: 1.12,
            },
          },
          "사주·궁합까지",
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              fontSize: "30px",
              fontWeight: 700,
              color: "#5A4E48",
              letterSpacing: "-0.02em",
              marginTop: "6px",
            },
          },
          "매일 다시 보고 싶은 AI 운명 리포트.",
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              gap: "14px",
              marginTop: "18px",
            },
          },
          ["오늘의 운세", "사주", "토정비결", "궁합", "타로"].map((label) =>
            React.createElement(
              "div",
              {
                key: label,
                style: {
                  display: "flex",
                  border: "1px solid #D9C8C0",
                  borderRadius: "999px",
                  background: "#FAF8F5",
                  color: "#6B5E58",
                  padding: "10px 18px",
                  fontSize: "22px",
                  fontWeight: 700,
                },
              },
              label,
            ),
          ),
        ),
      ),
    ),
  );
}

export function GET() {
  return new ImageResponse(React.createElement(OgImage), {
    ...size,
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=0, must-revalidate",
    },
  });
}
