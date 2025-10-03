'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function AboutMe() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <motion.div
        className="max-w-4xl text-center space-y-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-indigo-400">
          Hello! I&apos;m Vickey Yadav
        </h1>

        <p className="text-lg md:text-xl max-w-xl mx-auto text-gray-300">
          I&apos;m a passionate web developer specializing in building professional, scalable, and beautiful web applications. I enjoy creating seamless user experiences and bringing ideas to life with clean and efficient code.
        </p>

        <div className="space-y-2 md:space-y-0 md:flex md:justify-center md:gap-8 mt-4">
          <p className="text-gray-400">
            📧 Email: <span className="text-indigo-300">vickeyyadav0088@gmail.com</span>
          </p>
          <p className="text-gray-400">
            📞 Phone: <span className="text-indigo-300">88826XXXXX</span>
          </p>
        </div>

        <motion.div
          className="mt-6 flex justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <a
            href="#"
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium shadow-lg transition-colors"
          >
            Thank You
          </a>
          <a
            href="#"
            className="px-6 py-3 border border-indigo-500 hover:bg-indigo-700 rounded-lg font-medium shadow-lg transition-colors"
          >
            Good Luck
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}
