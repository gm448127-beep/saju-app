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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "64px",
        position: "relative",
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: "36px",
        border: "2px solid #E2D7D0",
        borderRadius: "36px",
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          width: "220px",
          height: "220px",
          borderRadius: "48px",
          background: "#FFFFFF",
          border: "2px solid #E2D7D0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8B6F47",
          fontSize: "150px",
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: "32px",
          boxShadow: "0 22px 52px rgba(61, 51, 56, 0.10)",
        },
      },
      "命",
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          fontSize: "76px",
          fontWeight: 800,
          color: "#3D3338",
          letterSpacing: "-0.04em",
        },
      },
      "운명비서",
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
