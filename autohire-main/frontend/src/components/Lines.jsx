"use client";
import { TypewriterEffect } from "./ui/typewriter-effect";
export function TypewriterEffectDemo() {
  const words = [
    {
      text: "Connecting ",
      className: "text-[#000000] dark:text-[#000000]",
    },
    {
      text: "Talent ",
      className: "text-[#000000] dark:text-[#000000]",
    },
    {
        text: " With",
        className: "text-[#000000] dark:text-[#000000]",
      },
      
    {
      text: " Opportunity,",
      className: "text-[#000000] dark:text-[#000000]",
    },
    
    {
      text: "Seamlessly",
      className: "text-[#515cb1] dark:text-[#515cb1]",
    },
  ];
  return (
    (<div className="flex flex-col items-center justify-center h-[4rem]">
      
      <TypewriterEffect words={words}
      className="gap-2"
       />
    </div>)
  );
}