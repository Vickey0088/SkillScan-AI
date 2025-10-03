"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // hamburger & close icons
import logo from "./logo2.jpg";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black p-2">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-white text-xl md:text-2xl font-bold pl-4 md:pl-8 flex items-center"
        >
          <Image
            src={logo}
            alt="AlgoTrack Logo"
            width={30}
            height={30}
            className="ml-2 md:w-18 md:h-12 mr-3 rounded-2xl"
          />
         SkillScan AI
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4 mr-6">
          <Link href="/" className="text-white hover:bg-blue-400 px-4 py-1 rounded-2xl text-center">
            Home
          </Link>
          <Link href="/features/cards" className="text-white hover:bg-blue-400 px-4 py-1 rounded-2xl text-center">
            Feature
          </Link>
          <Link href="/features/cards/aboutme" className="text-white hover:bg-blue-400 px-4 py-1 rounded-2xl text-center">
            AboutMe
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white mr-4"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col bg-black space-y-2 px-4 pb-4">
          <Link href="/" className="text-white hover:bg-blue-400 px-4 py-1 rounded-2xl text-center">
            Home
          </Link>
          <Link href="/features/cards" className="text-white hover:bg-blue-400 px-4 py-1 rounded-2xl text-center">
            Feature
          </Link>
          <Link href="/features/cards/aboutme" className="text-white hover:bg-blue-400 px-4 py-1 rounded-2xl text-center">
            AboutMe
          </Link>
          
        </div>
      )}
    </nav>
  );
}
