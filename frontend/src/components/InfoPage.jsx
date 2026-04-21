import React from 'react';
import { GFONT } from './CommonUI';

const PAGE_CONTENT = {
  features: {
    eyebrow: 'Platform Overview',
    title: 'Features built for local help that feels reliable.',
    intro:
      'HomeTownHelper brings service seekers and local helpers onto one trusted platform with booking, communication, reviews, and secure account flows designed for day-to-day household needs.',
    accent: '#22c55e',
    sections: [
      {
        heading: 'Core capabilities',
        items: [
          'Search helpers by category, location, and skill tags.',
          'Review detailed helper profiles before sending a booking request.',
          'Create user accounts for seekers, helpers, and administrators.',
          'Manage profile information, preferences, and account security from one place.'
        ]
      },
      {
        heading: 'Booking and payments',
        items: [
          'Create bookings directly from helper cards and service detail modals.',
          'Handle plan upgrades and booking payments through the existing payment flow.',
          'Track status updates after checkout with in-app confirmation handling.',
          'Keep pricing options visible for both seekers and helpers.'
        ]
      },
      {
        heading: 'Trust and support',
        items: [
          'Use ratings, reviews, and profile data to make more informed decisions.',
          'Contact the platform through the integrated contact form.',
          'Access password reset and secure authentication workflows.',
          'Give admins a dedicated dashboard for operational visibility.'
        ]
      }
    ]
  },
  about: {
    eyebrow: 'Company',
    title: 'About HomeTownHelper',
    intro:
      'HomeTownHelper is a local-services platform focused on making it easier for households to find dependable helpers while giving skilled workers a clearer path to consistent opportunities in their own communities.',
    accent: '#0ea5e9',
    sections: [
      {
        heading: 'What we do',
        items: [
          'Connect local helpers with people who need trusted home and neighborhood services.',
          'Reduce friction in discovery, communication, and booking.',
          'Present a simple product experience that works for both first-time users and regular customers.'
        ]
      },
      {
        heading: 'Why it matters',
        items: [
          'Reliable local work should be easier to access.',
          'Households need a clearer way to evaluate available help.',
          'Skilled workers benefit from stronger visibility, profile credibility, and easier repeat business.'
        ]
      },
      {
        heading: 'How we operate',
        items: [
          'We focus on practical product flows over unnecessary complexity.',
          'We support seeker, helper, and admin roles inside the same platform.',
          'We continue improving booking, communication, and trust signals as the platform grows.'
        ]
      }
    ]
  },
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro:
      'This Privacy Policy explains the types of information HomeTownHelper collects, how it is used, and the choices users have when using the platform.',
    accent: '#f59e0b',
    sections: [
      {
        heading: 'Information we collect',
        items: [
          'Account details such as name, email address, role, and profile information.',
          'Booking, payment, and service activity required to provide the platform.',
          'Messages or contact form submissions you send to our team.',
          'Technical information needed to maintain security and application performance.'
        ]
      },
      {
        heading: 'How we use information',
        items: [
          'To create and manage accounts, profiles, bookings, and subscriptions.',
          'To process transactions and respond to support requests.',
          'To improve safety, prevent misuse, and maintain service quality.',
          'To communicate important updates related to your account or activity.'
        ]
      },
      {
        heading: 'User controls and retention',
        items: [
          'Users may update profile information through their account where available.',
          'We retain data only as long as reasonably necessary for service delivery, compliance, and dispute handling.',
          'We do not treat personal information as public except where a profile or service listing is intentionally shown inside the platform.',
          'If you need help with account data questions, contact the support channels shown on this site.'
        ]
      }
    ]
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms & Conditions',
    intro:
      'These Terms & Conditions govern access to and use of HomeTownHelper. By using the platform, you agree to act lawfully, provide accurate information, and use the service in good faith.',
    accent: '#ef4444',
    sections: [
      {
        heading: 'Use of the platform',
        items: [
          'Users must provide accurate registration and profile details.',
          'You may not misuse the service, attempt unauthorized access, or interfere with platform operations.',
          'Bookings, listings, and communications must relate to legitimate service activity.',
          'We may suspend or restrict access where misuse, fraud, or policy violations are detected.'
        ]
      },
      {
        heading: 'Payments and responsibility',
        items: [
          'Paid plans or payment-enabled features are subject to the prices displayed in the application.',
          'Users are responsible for reviewing booking details before confirming payment.',
          'Platform availability, pricing, and feature scope may change as the product evolves.',
          'Each user remains responsible for their own conduct, submissions, and service commitments.'
        ]
      },
      {
        heading: 'General terms',
        items: [
          'The platform is provided on an as-available basis, subject to maintenance and technical constraints.',
          'We may update these terms to reflect operational or legal changes.',
          'Continued use of the platform after updates means you accept the revised terms.',
          'Questions about these terms can be directed through the platform contact section.'
        ]
      }
    ]
  }
};

export default function InfoPage({ isDark, pageKey, onBack, onPrimaryAction }) {
  const content = PAGE_CONTENT[pageKey] || PAGE_CONTENT.about;
  const bg = isDark ? '#020617' : '#f8fafc';
  const surface = isDark ? '#0f172a' : '#ffffff';
  const border = isDark ? '#1e293b' : '#e2e8f0';
  const title = isDark ? '#f8fafc' : '#0f172a';
  const text = isDark ? '#cbd5e1' : '#475569';
  const muted = isDark ? '#94a3b8' : '#64748b';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: title }}>
      <style>{GFONT}</style>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 80px' }}>
        <button
          onClick={onBack}
          style={{
            border: `1px solid ${border}`,
            background: surface,
            color: title,
            borderRadius: 999,
            padding: '10px 18px',
            fontFamily: 'DM Sans',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>

        <section
          style={{
            marginTop: 24,
            padding: '40px clamp(24px, 4vw, 52px)',
            borderRadius: 32,
            background: isDark
              ? `linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.86)), radial-gradient(circle at top right, ${content.accent}22, transparent 38%)`
              : `linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92)), radial-gradient(circle at top right, ${content.accent}26, transparent 42%)`,
            border: `1px solid ${border}`,
            boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.35)' : '0 24px 60px rgba(15,23,42,0.08)'
          }}
        >
          <p style={{ margin: 0, color: content.accent, fontFamily: 'DM Sans', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {content.eyebrow}
          </p>
          <h1 style={{ margin: '12px 0 16px', fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 1.05 }}>
            {content.title}
          </h1>
          <p style={{ margin: 0, maxWidth: 760, color: text, fontFamily: 'DM Sans', fontSize: 16, lineHeight: 1.7 }}>
            {content.intro}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 28 }}>
            <button
              onClick={onPrimaryAction}
              style={{
                background: content.accent,
                color: '#ffffff',
                border: 'none',
                borderRadius: 999,
                padding: '12px 22px',
                fontFamily: 'DM Sans',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Explore Services
            </button>
            <span style={{ alignSelf: 'center', color: muted, fontFamily: 'DM Sans', fontSize: 14 }}>
              HomeTownHelper for seekers, helpers, and admins.
            </span>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 24 }}>
          {content.sections.map((section) => (
            <article
              key={section.heading}
              style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 24,
                padding: '24px 22px',
                boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.22)' : '0 16px 40px rgba(15,23,42,0.06)'
              }}
            >
              <h2 style={{ margin: '0 0 14px', color: title, fontFamily: 'Syne', fontWeight: 700, fontSize: 22 }}>
                {section.heading}
              </h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {section.items.map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: content.accent, fontSize: 18, lineHeight: 1 }}>•</span>
                    <p style={{ margin: 0, color: text, fontFamily: 'DM Sans', fontSize: 14.5, lineHeight: 1.7 }}>{item}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}