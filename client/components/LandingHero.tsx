import React, { useEffect, useState } from "react";
import gateImg from "@/assets/clgImage.jpg";

export default function LandingHero() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const targetDate = new Date("2025-12-19T09:00:00+05:30");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) return;

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
  className="
    relative 
    w-screen 
    h-[95vh] 
    flex 
    items-center 
    justify-center 
    text-white 
    overflow-hidden 
    max-w-none 
    -mx-[calc((100vw-100%)/2)]
  "
  style={{
    backgroundImage: `url(${gateImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 text-center px-4">
        {/* College Name */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          Government College of Engineering, Amravati
        </h1>

        <div className="text-2xl md:text-3xl font-semibold mt-4">Present’s</div>

        {/* Conference Title */}
        <h2 className="text-5xl md:text-7xl font-extrabold mt-4 drop-shadow-lg">
          ICAIISD 2025
        </h2>

        {/* Subheading */}
        <p className="text-xl md:text-2xl mt-6 font-semibold text-yellow-300">
          2<sup>nd</sup> International Conference on Artificial Intelligence (AI) Innovations for Societal Development
        </p>

        {/* Date */}
        <p className="mt-4 text-lg md:text-xl font-medium">
          Date: <span className="font-bold">19 & 20 December, 2025</span>
        </p>

        {/* Countdown */}
        <div className="mt-10 flex justify-center gap-6 md:gap-10">
          {[
            ["DAYS", timeLeft.days],
            ["HOURS", timeLeft.hours],
            ["MINUTES", timeLeft.minutes],
            ["SECONDS", timeLeft.seconds],
          ].map(([label, value]) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-bold">{value}</div>
              <div className="text-sm mt-1 tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
