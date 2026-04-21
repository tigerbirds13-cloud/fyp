import React from 'react';
import { Alert } from './CommonUI';

export default function ContactSection({ isDark, contactRef, contactForm, setCF, contactSent, sendContact }) {
  const shellBg = isDark ? '#0b1220' : '#f4f7fc';
  const cardBg = isDark ? '#111b2e' : '#ffffff';
  const panelBg = isDark ? '#0f1a2c' : '#f6f8fc';
  const titleColor = isDark ? '#e7eefb' : '#173059';
  const textColor = isDark ? '#9fb1cc' : '#6a7a98';
  const inputBg = isDark ? '#0a1423' : '#ffffff';
  const inputBorder = isDark ? '#253550' : '#d9e1ef';
  const primary = '#1f5edc';
  const primaryDark = '#164bb5';

  const contactInfo = [
    { icon: '@', title: 'Email Office', detail: 'support@hometownhelper.com', sub: 'hello@hometownhelper.com' },
    { icon: 'P', title: 'Phone', detail: '+977-01-4000000', sub: '+977-9800000000' },
    { icon: 'L', title: 'Address', detail: 'New Baneshwor, Kathmandu', sub: 'Bagmati Province, Nepal' }
  ];

  const social = [
    { label: 'fb' },
    { label: 'in' },
    { label: 'tw' },
    { label: 'yt' }
  ];

  return (
    <section ref={contactRef} className="contact-shell" style={{ background: shellBg, transition: 'background 0.3s' }}>
      <div
        style={{
          position: 'relative',
          minHeight: 360,
          padding: '96px 24px 132px',
          backgroundImage:
            "linear-gradient(115deg, rgba(15,42,88,0.9), rgba(26,86,200,0.78)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.9rem)', color: '#ffffff', margin: 0 }}>
            Contact us
          </h2>
          <p style={{ margin: '14px auto 0', color: 'rgba(237,244,255,0.92)', fontFamily: 'DM Sans', fontSize: 16, maxWidth: 600 }}>
            HomeTownHelper is ready to provide support and the right local service for your needs.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '-88px auto 0', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div
          className="contact-main-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(250px, 360px) minmax(320px, 1fr)',
            background: cardBg,
            borderRadius: 18,
            overflow: 'hidden',
            border: `1px solid ${inputBorder}`,
            boxShadow: isDark ? '0 30px 60px rgba(4,8,15,0.55)' : '0 28px 54px rgba(29,44,77,0.18)'
          }}
        >
          <aside style={{ background: panelBg, padding: 30 }}>
            <h3 style={{ margin: 0, color: titleColor, fontFamily: 'Syne', fontSize: 28, fontWeight: 700 }}>Get in touch</h3>
            <p style={{ margin: '10px 0 0', color: textColor, fontFamily: 'DM Sans', fontSize: 14, lineHeight: 1.6 }}>
              Tell us where and when you need help. We will guide you to the right expert quickly.
            </p>

            <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
              {contactInfo.map((info, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 14 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: primary,
                      color: '#fff',
                      fontFamily: 'Syne',
                      fontWeight: 700,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 3px', fontFamily: 'Syne', color: titleColor, fontWeight: 700, fontSize: 14 }}>{info.title}</p>
                    <p style={{ margin: '0 0 2px', fontFamily: 'DM Sans', color: textColor, fontSize: 13 }}>{info.detail}</p>
                    <p style={{ margin: 0, fontFamily: 'DM Sans', color: textColor, fontSize: 13 }}>{info.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22 }}>
              <p style={{ margin: '0 0 10px', color: titleColor, fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>Follow us</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {social.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="social-spot"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      border: `1px solid ${inputBorder}`,
                      background: inputBg,
                      color: textColor,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'DM Sans',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                    aria-label={item.label}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div style={{ padding: 30 }}>
            <h3 style={{ margin: 0, color: titleColor, fontFamily: 'Syne', fontSize: 28, fontWeight: 700 }}>Send us a message</h3>

            {contactSent && (
              <div style={{ marginTop: 16 }}>
                <Alert type="success">Message sent successfully. We will get back to you soon.</Alert>
              </div>
            )}

            <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
              <div className="contact-row">
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Name"
                  value={contactForm.name || ''}
                  onChange={(e) => setCF((f) => ({ ...f, name: e.target.value }))}
                  className="contact-input"
                  style={{ background: inputBg, color: titleColor, borderColor: inputBorder }}
                />
                <input
                  type="text"
                  name="company"
                  autoComplete="organization"
                  placeholder="Company"
                  value={contactForm.company || ''}
                  onChange={(e) => setCF((f) => ({ ...f, company: e.target.value }))}
                  className="contact-input"
                  style={{ background: inputBg, color: titleColor, borderColor: inputBorder }}
                />
              </div>

              <div className="contact-row">
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="Phone"
                  value={contactForm.phone || ''}
                  onChange={(e) => setCF((f) => ({ ...f, phone: e.target.value }))}
                  className="contact-input"
                  style={{ background: inputBg, color: titleColor, borderColor: inputBorder }}
                />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  placeholder="Email"
                  value={contactForm.email || ''}
                  onChange={(e) => setCF((f) => ({ ...f, email: e.target.value }))}
                  className="contact-input"
                  style={{ background: inputBg, color: titleColor, borderColor: inputBorder }}
                />
              </div>

              <input
                type="text"
                name="subject"
                autoComplete="on"
                placeholder="Subject"
                value={contactForm.subject || ''}
                onChange={(e) => setCF((f) => ({ ...f, subject: e.target.value }))}
                className="contact-input"
                style={{ background: inputBg, color: titleColor, borderColor: inputBorder }}
              />

              <textarea
                rows={5}
                name="message"
                autoComplete="off"
                placeholder="Message"
                value={contactForm.msg || ''}
                onChange={(e) => setCF((f) => ({ ...f, msg: e.target.value }))}
                className="contact-input"
                style={{ background: inputBg, color: titleColor, borderColor: inputBorder, resize: 'vertical' }}
              />

              <button type="button" onClick={sendContact} className="contact-send-btn" style={{ background: primary }}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 46, borderTop: isDark ? '1px solid #1d2941' : '1px solid #d5dfef' }}>
        <iframe
          title="HomeTownHelper map"
          src="https://www.openstreetmap.org/export/embed.html?bbox=85.297%2C27.693%2C85.347%2C27.733&layer=mapnik&marker=27.713%2C85.322"
          style={{ width: '100%', height: 320, border: 0, display: 'block' }}
          loading="lazy"
        />
      </div>

      <style>{`
        .contact-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .contact-input {
          width: 100%;
          height: 44px;
          border: 1px solid;
          border-radius: 8px;
          padding: 0 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          box-sizing: border-box;
        }

        textarea.contact-input {
          min-height: 112px;
          padding-top: 10px;
          line-height: 1.45;
        }

        .contact-input:focus {
          border-color: ${primary};
          box-shadow: 0 0 0 3px ${isDark ? 'rgba(31,94,220,0.25)' : 'rgba(31,94,220,0.18)'};
        }

        .contact-send-btn {
          height: 40px;
          border: 0;
          border-radius: 999px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
          box-shadow: 0 10px 20px rgba(22, 75, 181, 0.26);
        }

        .contact-send-btn:hover {
          background: ${primaryDark} !important;
          transform: translateY(-1px);
        }

        .social-spot {
          transition: transform 0.2s, color 0.2s, border-color 0.2s;
        }

        .social-spot:hover {
          transform: translateY(-1px);
          color: ${primary};
          border-color: ${primary} !important;
        }

        @media (max-width: 980px) {
          .contact-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .contact-shell {
            overflow: hidden;
          }
        }

        @media (max-width: 840px) {
          .contact-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
