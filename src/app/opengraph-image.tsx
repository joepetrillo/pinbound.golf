import { ImageResponse } from "next/og";

export const alt =
  "Pinbound — fast, consistent help for golf course callers while staff stays with the golfers in front of them.";

export const contentType = "image/png";

export const size = {
  height: 630,
  width: 1200,
};

// ImageResponse renders its own Tailwind classes independently of the app CSS.
const opengraphImage = () =>
  new ImageResponse(
    <div tw="flex items-center bg-[#fafaf9] h-full w-full p-[72px]">
      <div tw="flex w-[565px] flex-col pr-12">
        <div tw="flex text-[#1c1917] text-[28px] font-semibold tracking-[3.36px] mb-10 uppercase">
          pinbound
        </div>
        <div tw="flex text-[#1c1917] text-[60px] font-medium tracking-[-1.5px] leading-none">
          The pro shop assistant that never clocks out
        </div>
        <div tw="flex text-[#57534e] text-[28px] leading-[1.4] mt-7">
          An AI phone assistant connected to your course and your tee sheet.
        </div>
      </div>

      <div tw="flex bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-3xl w-[491px] flex-col p-8">
        <div tw="flex self-start bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-[18px] text-[#1c1917] text-[22px] leading-[1.4] max-w-[90%] py-[14px] px-[18px]">
          Thanks for calling Pinehills. I&apos;m the AI virtual assistant. This
          call is recorded. How can I help?
        </div>
        <div tw="flex self-end bg-[#f5f5f4] rounded-[18px] text-[#1c1917] text-[22px] leading-[1.4] max-w-[80%] py-[14px] px-[18px] mt-4">
          Any tee times tomorrow morning for two?
        </div>
        <div tw="flex self-start bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-[18px] text-[#1c1917] text-[22px] leading-[1.4] max-w-[90%] py-[14px] px-[18px] mt-4">
          I have 7:40 and 8:10 on the Jones Course. Want me to hold one?
        </div>
      </div>
    </div>,
    { ...size }
  );

export default opengraphImage;
