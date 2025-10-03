"use client";

import Link from "next/link";
import {
  FaCode,
  FaMicrophone,
  FaComments,
  FaFileAlt,
  FaBolt,
  FaClipboardList,
  FaMap,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Example features list
const features = [
  {
    id: 4,
    title: "AI Resume Analyser",
    description:
      "Get comprehensive analysis of your resume with AI-powered insights and optimization recommendations for better results.",
    icon: <FaFileAlt className="text-yellow-400 text-2xl" />,
    color: "from-yellow-500 to-yellow-600",
    slug: "ai-resume-analyser",
  },
];

export default function Features() {
  return (
    <div className="py-32 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-6xl mx-auto text-center">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl font-bold mb-14 text-white"
        >
          Explore Our Features
        </motion.h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center ">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-2xl shadow-lg p-8 flex flex-col justify-between hover:shadow-2xl transition-all duration-300"
            >
              {/* Icon + Title */}
              <div className="flex items-center space-x-4 mb-5">
                <span className="p-4 rounded-xl bg-gray-900/70 border border-gray-700">
                  {feature.icon}
                </span>
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                {feature.description}
              </p>

              {/* Button */}
              <Link href={`/components/${feature.slug}`}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-r ${feature.color} text-white px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium shadow-md hover:shadow-xl transition-all duration-300`}
                >
                  <span>Explore Feature</span>
                  <span>→</span>
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
