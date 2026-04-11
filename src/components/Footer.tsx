import React from "react";
import { palette } from "../theme/palette";
import { Blocks, Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="w-full px-4 md:px-10 py-4 flex flex-col md:flex-row items-center md:justify-between gap-2 text-center md:text-left"
      style={{
        background: palette.bgCard,
        borderTop: `1px solid ${palette.border}`,
        color: palette.text2,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center btn-game">
          <Blocks className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-bold text-gradient-purple">LearnNova</span>
        <span className="text-xs opacity-60" style={{ color: palette.text2 }}>// by Hex Visionaries</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs" style={{ color: palette.text2 }}>
        <Zap className="w-3 h-3" style={{ color: palette.gold }} />
        <span>Built with</span>
        <span style={{ color: palette.red }}>❤️</span>
        <span>by</span>
        <span className="font-semibold" style={{ color: palette.text }}>Paras</span>
        <span>&</span>
        <span className="font-semibold" style={{ color: palette.text }}>Harshit</span>
      </div>

      <div className="text-xs opacity-50" style={{ color: palette.text2 }}>
        © {new Date().getFullYear()} Hex Visionaries
      </div>
    </footer>
  );
};

export default Footer;
