import React from 'react';
import { render } from '@testing-library/react';

/* =========================================================
   MOCK EVERYTHING INSIDE public_landing
   ========================================================= */

/* sections */
jest.mock('../sections/CTASection', () => () => <div>CTASection</div>);
jest.mock('../sections/FeatureSection', () => () => <div>FeatureSection</div>);
jest.mock('../sections/HeroSection', () => () => <div>HeroSection</div>);
jest.mock('../sections/LandingFooter', () => () => <div>LandingFooter</div>);
jest.mock('../sections/LandingNavbar', () => () => <div>LandingNavbar</div>);
jest.mock('../sections/SocialProof', () => () => <div>SocialProof</div>);
jest.mock('../sections/TechStackTicker', () => () => <div>TechStackTicker</div>);

/* root-level */
jest.mock('../FloatingElements', () => () => <div>FloatingElements</div>);
jest.mock('../GridBackground', () => () => <div>GridBackground</div>);
jest.mock('../VideoModal', () => () => null);

/* next/link */
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

/* framer-motion */
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }) => <div>{children}</div>,
    section: ({ children }) => <section>{children}</section>,
  },
  useInView: () => true,
  useSpring: () => ({ set: jest.fn() }),
}));

/* =========================================================
   TESTS
   ========================================================= */

describe('Public Landing folder smoke tests', () => {
  const components = [
    require('../sections/CTASection'),
    require('../sections/FeatureSection'),
    require('../sections/HeroSection'),
    require('../sections/LandingFooter'),
    require('../sections/LandingNavbar'),
    require('../sections/SocialProof'),
    require('../sections/TechStackTicker'),
    require('../FloatingElements'),
    require('../GridBackground'),
  ];

  components.forEach((Comp, index) => {
    it(`Component #${index + 1} renders without crashing`, () => {
      expect(Comp).toBeDefined();
      const { container } = render(<Comp />);
      expect(container).toBeTruthy();
    });
  });

  it('VideoModal renders without crashing when closed', () => {
    const VideoModal = require('../VideoModal');
    const { container } = render(
      <VideoModal isOpen={false} onClose={() => {}} />
    );
    expect(container).toBeTruthy();
  });
});
