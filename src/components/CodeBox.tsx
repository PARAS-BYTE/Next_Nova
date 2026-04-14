import React from 'react';
import { palette } from '@/theme/palette';
import { Copy, Terminal } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBoxProps {
  code: string;
  language?: string;
  className?: string;
}

const CodeBox: React.FC<CodeBoxProps> = ({ code, language = 'javascript', className = '' }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Incantation copied to clipboard!');
  };

  return (
    <div 
      className={`relative group rounded-xl overflow-hidden border ${className}`}
      style={{ 
        backgroundColor: '#0F0F12', 
        borderColor: 'rgba(255,255,255,0.05)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1.5">
            <Terminal size={10} /> {language}
          </span>
        </div>
        <button 
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Copy size={12} className="text-white/40 hover:text-[#7C6AFA]" />
        </button>
      </div>

      {/* Code Area */}
      <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto scrollbar-thin">
        <code style={{ color: '#A78BFA' }}>
          <pre style={{ margin: 0 }}>{code}</pre>
        </code>
      </div>

      {/* Bottom accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#7C6AFA]/30 to-transparent" />
    </div>
  );
};

export default CodeBox;
