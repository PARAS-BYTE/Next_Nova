import React from "react";
import { palette } from "../theme/palette";

const Footer = () => {
  return (
    <footer
      className="w-full px-4 md:px-10 py-6 border-t flex flex-col md:flex-row items-center md:justify-between gap-3 text-center md:text-left mt-auto"
      style={{
        background: palette.card,
        borderColor: palette.border,
        color: palette.text2,
      }}
    >
      {/* Left Section - Branding */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold" style={{ color: palette.text }}>
          Hex Visionaries
        </h2>
        <p className="text-sm opacity-80">
          Vision-led builders of next-gen tech
        </p>
      </div>

      {/* Middle Section - Made with Love */}
      <div className="text-sm opacity-80">
        Made with <span className="text-red-500">❤️</span> by 
        <span className="font-medium"> Paras</span> & 
        <span className="font-medium"> Harshit</span>
      </div>

      {/* Right Section - Copyright */}
      <div className="text-sm opacity-70">
        © {new Date().getFullYear()} Hex Visionaries. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
