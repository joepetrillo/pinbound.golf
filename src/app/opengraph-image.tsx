import { ImageResponse } from "next/og";

export const alt =
  "Pinbound — fast, consistent help for golf course callers while staff stays with the golfers in front of them.";

export const contentType = "image/png";

export const size = {
  height: 630,
  width: 1200,
};

const colors = {
  background: "#fafaf9",
  border: "#e7e5e4",
  bubble: "#f5f5f4",
  foreground: "#1c1917",
  muted: "#57534e",
};

const opengraphImage = () =>
  new ImageResponse(
    <div
      style={{
        alignItems: "center",
        backgroundColor: colors.background,
        display: "flex",
        height: "100%",
        padding: 72,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1.1,
          flexDirection: "column",
          paddingRight: 48,
        }}
      >
        <div
          style={{
            alignItems: "center",
            color: colors.foreground,
            display: "flex",
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          pinbound
        </div>
        <div
          style={{
            color: colors.foreground,
            display: "flex",
            flexDirection: "column",
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          <span>Help every caller.</span>
          <span>Stay at the counter.</span>
        </div>
        <div
          style={{
            color: colors.muted,
            display: "flex",
            fontSize: 28,
            lineHeight: 1.4,
            marginTop: 28,
          }}
        >
          An AI phone assistant connected to your course and your tee sheet.
        </div>
      </div>

      <div
        style={{
          backgroundColor: colors.background,
          border: `2px solid ${colors.border}`,
          borderRadius: 24,
          display: "flex",
          flex: 0.9,
          flexDirection: "column",
          gap: 16,
          padding: 32,
        }}
      >
        <div
          style={{
            alignSelf: "flex-start",
            backgroundColor: colors.background,
            border: `2px solid ${colors.border}`,
            borderRadius: 18,
            color: colors.foreground,
            display: "flex",
            fontSize: 22,
            lineHeight: 1.4,
            maxWidth: "90%",
            padding: "14px 18px",
          }}
        >
          Thanks for calling Pinehills. I&apos;m the AI virtual assistant. This
          call is recorded. How can I help?
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            backgroundColor: colors.bubble,
            borderRadius: 18,
            color: colors.foreground,
            display: "flex",
            fontSize: 22,
            lineHeight: 1.4,
            maxWidth: "80%",
            padding: "14px 18px",
          }}
        >
          Any tee times tomorrow morning for two?
        </div>
        <div
          style={{
            alignSelf: "flex-start",
            backgroundColor: colors.background,
            border: `2px solid ${colors.border}`,
            borderRadius: 18,
            color: colors.foreground,
            display: "flex",
            fontSize: 22,
            lineHeight: 1.4,
            maxWidth: "90%",
            padding: "14px 18px",
          }}
        >
          I have 7:40 and 8:10 on the Jones Course. Want me to hold one?
        </div>
      </div>
    </div>,
    { ...size }
  );

export default opengraphImage;
