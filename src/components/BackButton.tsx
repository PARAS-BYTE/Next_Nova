"use client";
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

const BackButton = ({ to, label = 'Back', className = '' }: BackButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (to) {
      router.push(to);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`flex items-center gap-2 text-gray-700 hover:text-black transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
};

export default BackButton;



