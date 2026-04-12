import React from "react";
import { palette } from "../theme/palette";

const Footer = () => {
  return (
    <footer
      className="w-full px-4 md:px-10 py-6 flex flex-col md:flex-row items-center md:justify-between gap-3 text-center md:text-left mt-auto"
      style={{
        background: palette.card,
        borderTop: `1px solid ${palette.border}`,
        color: palette.text2,
      }}
    >
      {/* Left Section - Branding */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold shimmer-text">
          Hex Visionaries
        </h2>
        <p className="text-sm opacity-80" style={{ color: palette.textMuted }}>
          Vision-led builders of next-gen tech
        </p>
      </div>

      {/* Middle Section - Made with Love */}
      <div className="text-sm" style={{ color: palette.textMuted }}>
        Made with <span className="text-red-400">❤️</span> by 
        <span className="font-medium" style={{ color: palette.text2 }}> Paras</span> & 
        <span className="font-medium" style={{ color: palette.text2 }}> Harshit</span>
      </div>

      {/* Right Section - Copyright */}
      <div className="text-sm" style={{ color: palette.textMuted }}>
        © {new Date().getFullYear()} Hex Visionaries. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
