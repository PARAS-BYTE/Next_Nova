import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ExternalLink, ShieldCheck, Download, Share2, Swords, Zap, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { palette } from '../../theme/palette';
import { Button } from '../../components/ui/button';
import { useGameStore } from '@/game/useGameStore';
import CertificateUnlock from '@/components/game/CertificateUnlock';
import GameAvatar from '@/components/game/AvatarSystem';
import { getRankForLevel } from '@/game/gameConfig';

const Certificates = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnlock, setShowUnlock] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  const stats = useGameStore(s => s.stats);
  const avatarSkin = useGameStore(s => s.avatarSkin);
  const addXP = useGameStore(s => s.addXP);
  const addCoins = useGameStore(s => s.addCoins);
  const incrementCertificates = useGameStore(s => s.incrementCertificates);
  const rankCfg = getRankForLevel(stats.level);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data } = await axios.get('/api/certificates/my');
        setCertificates(data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const handleCertClick = (cert: any) => {
    setSelectedCert({
      courseName: cert.courseTitle,
      studentName: cert.studentName || 'Player',
      date: new Date(cert.mintedAt).toLocaleDateString(),
      hash: cert.transactionHash || cert.blockchainHash || '0x' + Math.random().toString(16).slice(2, 18),
      verifyUrl: cert.blockchainUrl,
    });
    setShowUnlock(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1 }
  };

  const rarityMap = ['common', 'rare', 'epic', 'legendary'];
  const rarityGradients = {
    common: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
    rare: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    epic: 'linear-gradient(135deg, #A855F7, #7C3AED)',
    legendary: 'linear-gradient(135deg, #FFD700, #F59E0B)',
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen relative">
      {/* Certificate Unlock Modal */}
      {selectedCert && (
        <CertificateUnlock
          isOpen={showUnlock}
          onClose={() => setShowUnlock(false)}
          certificate={selectedCert}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(124, 106, 250, 0.2), rgba(34, 211, 238, 0.2))',
              border: '1px solid rgba(124, 106, 250, 0.3)',
            }}
          >
            <Award className="w-6 h-6 text-[#7C6AFA]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gradient">Trophy Room</h1>
            <p className="text-sm" style={{ color: palette.text2 }}>
              Your verifiable blockchain achievements · {certificates.length} earned
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mt-4">
          <StatPill icon={<Award className="w-3.5 h-3.5" />} label="Certificates" value={certificates.length} color="#7C6AFA" />
          <StatPill icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Verified" value={certificates.filter((c: any) => c.blockchainUrl).length} color="#34D399" />
          <StatPill icon={<Zap className="w-3.5 h-3.5" />} label="XP Earned" value={certificates.length * 200} color="#FBBF24" />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div
            className="relative w-16 h-16"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-0 rounded-full" style={{ border: `3px solid ${palette.border}` }} />
            <div className="absolute inset-0 rounded-full" style={{ border: '3px solid transparent', borderTopColor: palette.accent }} />
            <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: palette.card }}>
              <Award className="w-5 h-5" style={{ color: palette.accent }} />
            </div>
          </motion.div>
        </div>
      ) : certificates.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto relative overflow-hidden"
          style={{
            background: palette.card,
            border: `1px solid ${palette.border}`,
            boxShadow: `0 0 40px ${palette.accent}10`,
          }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-20 h-20 rounded-full"
                style={{ background: palette.accent, left: `${i * 20}%`, top: `${i * 15}%` }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{ duration: 3 + i, repeat: Infinity }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <GameAvatar skin={avatarSkin} level={stats.level} mood="thinking" size={80} className="mx-auto mb-6" />

            <h2 className="text-2xl font-black mb-2" style={{ color: palette.text }}>
              No Trophies Yet
            </h2>
            <p className="mb-2" style={{ color: palette.text2 }}>
              Complete your first quest to earn a blockchain-verified certificate!
            </p>
            <p className="text-xs mb-6" style={{ color: palette.textMuted }}>
              Certificates are minted as NFTs on Polygon blockchain upon 100% quest completion.
            </p>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}
            >
              <Lock className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="text-xs font-medium text-[#FBBF24]">
                Complete 100% of any quest to unlock
              </span>
            </div>

            <br />
            <Button 
              className="rounded-xl px-8 font-bold border-0"
              style={{ background: palette.gradient1, color: '#fff' }}
              onClick={() => window.location.href = '/student/courses'}
            >
              <Swords className="w-4 h-4 mr-2" />
              Browse Quests
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {certificates.map((cert: any, idx: number) => {
            const rarity = rarityMap[Math.min(idx, 3)] as keyof typeof rarityGradients;
            const gradient = rarityGradients[rarity];

            return (
              <motion.div 
                key={cert._id}
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: `0 0 30px ${palette.accent}20` }}
                className="rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  background: palette.card,
                  border: `1px solid ${palette.border}`,
                }}
                onClick={() => handleCertClick(cert)}
              >
                {/* Top accent */}
                <div className="h-1" style={{ background: gradient }} />

                {/* Certificate Preview */}
                <div className="h-44 sm:h-48 relative overflow-hidden flex items-center justify-center p-4 sm:p-6"
                  style={{ background: `linear-gradient(135deg, ${palette.bgSecondary}, ${palette.bg})` }}
                >
                  {/* Decorative elements */}
                  <motion.div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, ${palette.accent} 0, ${palette.accent} 1px, transparent 1px, transparent 20px)`,
                    }}
                  />

                  <div className="relative z-10 text-center">
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{
                        background: 'rgba(124, 106, 250, 0.1)',
                        border: '1px dashed rgba(124, 106, 250, 0.3)',
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 15px rgba(124, 106, 250, 0.1)',
                          '0 0 30px rgba(124, 106, 250, 0.25)',
                          '0 0 15px rgba(124, 106, 250, 0.1)',
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Award className="w-8 h-8 text-[#7C6AFA] opacity-60" />
                    </motion.div>
                    <h3 className="font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: palette.text }}>
                      Certificate of Achievement
                    </h3>
                  </div>

                  {/* Verified badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)' }}
                  >
                    <ShieldCheck size={12} className="text-green-400" />
                    <span className="text-[8px] font-bold text-green-400 uppercase tracking-wider">
                      On-Chain
                    </span>
                  </div>

                  {/* Rarity tag */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
                    style={{ background: gradient, color: '#fff' }}
                  >
                    {rarity}
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold mb-1 group-hover:text-gradient transition-all" style={{ color: palette.text }}>
                    {cert.courseTitle}
                  </h3>
                  <p className="text-xs mb-3" style={{ color: palette.text2 }}>
                    Earned on {new Date(cert.mintedAt).toLocaleDateString()}
                  </p>

                  {/* XP reward display */}
                  <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg" style={{ background: palette.accentSoft }}>
                    <Zap className="w-3 h-3 text-[#7C6AFA]" />
                    <span className="text-[10px] font-bold text-[#7C6AFA]">+200 XP earned</span>
                    <span className="text-[10px]" style={{ color: palette.text2 }}>·</span>
                    <Sparkles className="w-3 h-3 text-[#A855F7]" />
                    <span className="text-[10px] font-bold text-[#A855F7]">Quest Completed</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1 rounded-xl h-10 text-xs font-medium border-white/10"
                      style={{ color: palette.text, background: 'transparent' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(cert.blockchainUrl, '_blank');
                      }}
                    >
                      <ExternalLink size={14} className="mr-1.5" />
                      Verify
                    </Button>
                    <Button 
                      className="flex-1 rounded-xl h-10 text-xs font-bold border-0"
                      style={{ background: palette.gradient1, color: '#fff' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCertClick(cert);
                      }}
                    >
                      <Award size={14} className="mr-1.5" />
                      View
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Certificates;

/* ── Stat Pill ── */
function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
      style={{ background: `${color}15`, border: `1px solid ${color}20` }}
    >
      <div style={{ color }}>{icon}</div>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
      <span className="text-[10px]" style={{ color: palette.text2 }}>{label}</span>
    </div>
  );
}
