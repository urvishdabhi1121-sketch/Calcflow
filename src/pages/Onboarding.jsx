import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Type, Eye, Calculator } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';

const SLIDES = [
  { icon: Sparkles, title: 'Meet CalcFlow', subtitle: 'Calculate everyday problems in seconds.' },
  { icon: Type, title: 'Just describe it', subtitle: 'Type what you want to calculate.' },
  { icon: Eye, title: 'See the answer', subtitle: 'Get the result, formula and breakdown.' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { update } = useSettings();
  const slide = SLIDES[step];

  const finish = () => { update('onboarded', true); navigate('/'); };
  const next = () => (step < SLIDES.length - 1 ? setStep(step + 1) : finish());

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-12 max-w-lg mx-auto">
      <div className="flex justify-end">
        <button onClick={finish} className="text-sm font-medium text-muted-foreground">Skip</button>
      </div>
      <div className="flex flex-col items-center text-center flex-1 justify-center">
        <div className="w-24 h-24 rounded-3xl bg-brand/10 flex items-center justify-center text-brand mb-8 animate-scale-in">
          <slide.icon size={44} />
        </div>
        <h1 className="text-3xl font-bold mb-3 animate-fade-in">{slide.title}</h1>
        <p className="text-muted-foreground text-lg animate-fade-in">{slide.subtitle}</p>
      </div>
      <div>
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-brand' : 'w-2 bg-muted'}`} />
          ))}
        </div>
        <button onClick={next} className="w-full py-3.5 rounded-2xl bg-brand text-brand-foreground font-semibold text-base active:scale-[0.98] transition no-tap-highlight">
          {step < SLIDES.length - 1 ? 'Continue' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}