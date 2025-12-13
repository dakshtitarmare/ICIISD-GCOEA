import React, { useEffect, useState } from "react";
import { Moon, Sun, Home, Info, ImageIcon, Users, Calendar, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import LandingHero from "@/components/LandingHero";

// If you prefer Lottie animations, import Lottie and provide animation JSONs in /src/assets
// import Lottie from 'lottie-react';
// import heroAnim from '@/assets/hero-animation.json';

// Landing page component (single-file, production-ready layout)
export default function LandingPage() {
  // theme: 'light' | 'dark' | 'system'
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("site-theme");
      if (saved === "dark") return "dark";
    } catch (e) {}
    // default to light
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try { localStorage.setItem("site-theme", theme); } catch (e) {}
  }, [theme]);

  // countdown target (conference dates: 19 Dec 2025 start)
  const target = new Date("2025-12-19T09:00:00+05:30");
  const [left, setLeft] = useState(getLeft());

  function getLeft() {
    const now = new Date();
    const diff = Math.max(0, target.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const t = setInterval(() => setLeft(getLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  // small helper components
  const StatCard = ({ title, value, subtitle, accent = "bg-indigo-500" } : any) => (
    <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-md border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</div>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${accent} text-white`}> 
          <Users size={20} />
        </div>
      </div>
      {subtitle && <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">{subtitle}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-900 transition-colors">
      {/* <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold">G</div>
          <div>
            <div className="text-lg font-bold">ICAIISD 2025</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Government College of Engineering, Amravati</div>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <a className="text-sm hover:underline" href="#home">Home</a>
          <a className="text-sm hover:underline" href="#about">About</a>
          <a className="text-sm hover:underline" href="#tracks">Tracks</a>
          <a className="text-sm hover:underline" href="#committee">Committees</a>
          <a className="text-sm hover:underline" href="#contact">Contact</a>

          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </nav>
      </header> */}

      <main className="max-w-7xl mx-auto px-6">
        {/* HERO */}
        <LandingHero />

        {/* About section */}
        <section id="about" className="py-12">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-semibold">About the Conference</h3>
            <p className="mt-3 text-gray-700 dark:text-gray-300">Welcome to ICAIISD 2025 — a platform for researchers, industry professionals, and students to share innovations in AI for societal development. Join workshops, sessions, and networking events.</p>
          </div>
        </section>

        {/* Tracks grid */}
        <section id="tracks" className="py-12">
          <h3 className="text-2xl font-semibold">Conference Tracks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[
              'AI in Healthcare and Human Development',
              'AI in Education',
              'AI in Agriculture',
              'AI in Smart Cities',
              'AI in Robotics',
              'AI in FinTech'
            ].map((t) => (
              <div key={t} className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="font-semibold">{t}</div>
                <div className="text-xs text-gray-500 mt-2">Call for papers & sessions</div>
              </div>
            ))}
          </div>
        </section>

        {/* Committees / Partners */}
        {/* <section id="committee" className="py-12">
          <h3 className="text-2xl font-semibold">Organizers & Partners</h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-white/80 dark:bg-slate-800/80 border">Govt College of Engineering</div>
            <div className="p-4 rounded-lg bg-white/80 dark:bg-slate-800/80 border">Knowledge Partner</div>
            <div className="p-4 rounded-lg bg-white/80 dark:bg-slate-800/80 border">Publication Partner</div>
            <div className="p-4 rounded-lg bg-white/80 dark:bg-slate-800/80 border">Tech Partner</div>
          </div>
        </section> */}

        {/* Footer / Contact */}
        <section id="contact" className="py-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <div className="text-lg font-semibold">Venue</div>
              <div className="text-sm text-gray-600 mt-2">Government College of Engineering, Amravati</div>
              <div className="mt-4 text-sm text-gray-600">VMV Road, Kathora Naka, Amravati, Maharashtra - 444604</div>
            </div>

            <div>
              <div className="text-lg font-semibold">Important Dates</div>
              <ul className="mt-2 text-sm text-gray-600">
                <li>Full Paper Submission — 15 Aug 2025</li>
                <li>Acceptance — 15 Oct 2025</li>
                <li>Registration — 5 Nov 2025</li>
              </ul>
            </div>

            <div>
              <div className="text-lg font-semibold">Contact</div>
              <div className="mt-2 text-sm text-gray-600">Email: icaiisd2025@gcoea.ac.in</div>
              <div className="mt-1 text-sm text-gray-600">Phone: +91 12345 67890</div>
            </div>
          </div>

          <a
  href="https://www.linkedin.com/in/dakshtitarmare/"
  target="_blank"
  rel="noopener noreferrer"
>
  <div className="mt-8 text-center text-sm text-gray-500">
    © 2025 GCoEA — All rights reserved • Developed by GCoEA IT Branch
  </div>
</a>



        </section>
      </main>
    </div>
  );
}
