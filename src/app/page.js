'use client'

import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useState } from "react";
import { loadSlim } from "@tsparticles/slim";

export default function Home() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setReady(true);
    });
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Content */}
      <div className="text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold text-white mb-6"
        >
          Welcome to{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            SkillScan AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-200 mb-8"
        >
          Track your <span className="font-semibold text-indigo-400">Resume</span> and improve your{" "}
          <span className="font-semibold text-purple-400">ATS Score</span>.
          <br />
          Streamlined in{" "}
          <span className="font-semibold text-indigo-400">SkillScan AI</span> to
          simplify your coding journey 🚀
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a
            href="/features/cards"
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </a>
          <a
            href="/features/cards/aboutme"
            className="px-6 py-3 rounded-xl border border-gray-600 text-gray-200 font-medium hover:border-indigo-500 hover:text-indigo-400 transition-all duration-300"
          >
            About Me
          </a>
        </motion.div>
      </div>
    </div>
  );
}
