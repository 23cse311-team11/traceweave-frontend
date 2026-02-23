'use client';

import React from 'react';
import { GridBackground } from './public_landing/GridBackground';
import { FloatingElements } from './public_landing/FloatingElements';
import { LandingNavbar } from './public_landing/sections/LandingNavbar';
import { HeroSection } from './public_landing/sections/HeroSection';
import { FeatureSection } from './public_landing/sections/FeatureSection';
import { TechStackTicker } from './public_landing/sections/TechStackTicker';
import { SocialProof } from './public_landing/sections/SocialProof';
import { CTASection } from './public_landing/sections/CTASection';
import { LandingFooter } from './public_landing/sections/LandingFooter';


export default function PublicLanding() {
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased overflow-x-hidden">
      <GridBackground />
      <FloatingElements />
      <LandingNavbar />
      <HeroSection />
      <TechStackTicker />
      <FeatureSection />
      <SocialProof />
      <CTASection />
      <LandingFooter />
    </div>
  );
}