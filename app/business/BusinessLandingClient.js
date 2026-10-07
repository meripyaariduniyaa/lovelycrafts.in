'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const OCCASIONS_SHOWCASE = [
  {
    id: 'birthday',
    title: 'Employee Birthdays',
    icon: '🎂',
    badge: 'Zero-Effort Delight',
    headline: 'Make team members feel truly celebrated on their special day.',
    description:
      'Cinematic balloon pops, interactive virtual cake moments, personalized team messages, and cherished photo memories generated automatically.',
    highlights: ['Interactive cake-cutting', 'Multi-colleague photo montage', 'Custom gift voucher / shagun'],
    sampleRecipient: 'Priya Sharma • Senior Product Designer',
    sampleOccasion: 'Turning 28 Today 🎉',
  },
  {
    id: 'anniversary',
    title: 'Work Anniversaries',
    icon: '🥂',
    badge: 'Milestone Recognition',
    headline: 'Honor dedication, loyalty, and tenure milestones.',
    description:
      'A live timeline counting exact days together, team gratitude quotes, leadership accolades, and achievements celebrated in an emotional digital experience.',
    highlights: ['Tenure milestone counter', 'Leader appreciation note', 'Interactive champagne toast'],
    sampleRecipient: 'Rahul Verma • Lead Architect',
    sampleOccasion: '5 Years of Excellence 🌟',
  },
  {
    id: 'welcome',
    title: 'Welcome & Onboarding',
    icon: '🚀',
    badge: 'Day-1 Wow Factor',
    headline: 'Give new hires an unforgettable warm welcome.',
    description:
      'Introduce teammates, company culture highlights, and a personalized message from their direct manager to set a joyous tone from minute one.',
    highlights: ['Team buddy intro', 'Interactive welcome map', 'Founders welcome video/letter'],
    sampleRecipient: 'Ananya Deshmukh • Software Engineer',
    sampleOccasion: 'Welcome to the Family 💫',
  },
  {
    id: 'farewell',
    title: 'Farewells & Appreciation',
    icon: '💐',
    badge: 'Heartfelt Goodbyes',
    headline: 'Part ways with gratitude, elegance, and treasured memories.',
    description:
      'A heartfelt compilation of moments, team farewell notes, and warm wishes that departing employees will cherish forever.',
    highlights: ['Team memory album', 'Sealed farewell letter', 'Colleague signature wall'],
    sampleRecipient: 'Vikram Mehta • VP of Engineering',
    sampleOccasion: 'Wishing You the Best Always 🚀',
  },
];

const FAQS = [
  {
    q: 'How does LovelyCrafts for Business work?',
    a: 'You upload your employee roster once via Excel or CSV. Our Occasion Engine automatically detects upcoming birthdays and work anniversaries, queues them up with prefilled employee data, and allows HR to review, approve, and share personalized interactive experiences in 1 click.',
  },
  {
    q: 'Can we customize company branding, colors, and logos?',
    a: 'Yes! Every corporate workspace includes custom branding controls. Your company logo, primary brand colors, and approved signature messages are automatically integrated into all generated employee experiences.',
  },
  {
    q: 'How are recipient links delivered to employees?',
    a: 'Experiences are served via secure, unguessable links (e.g., lovelycrafts.in/acme-corp/p/random-token) that can be sent automatically via work email, copied for Slack/Teams messages, or embedded via QR code.',
  },
  {
    q: 'Is employee data kept strictly private and isolated?',
    a: 'Absolutely. We enforce strict multi-tenant isolation on the server. Recipient links never expose internal employee codes or database IDs, and all private experience pages are configured with noindex/nofollow headers.',
  },
  {
    q: 'Do you support approval workflows for managers or HR leadership?',
    a: 'Yes. Organizations can configure optional or mandatory approval workflows so designated approvers can review custom messages and uploaded media before links are published.',
  },
];

export default function BusinessLandingClient() {
  const [activeTab, setActiveTab] = useState('birthday');
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    website: '',
    business_email: '',
    contact_name: '',
    designation: '',
    employee_count: '10-50',
    use_cases: ['birthdays', 'work_anniversaries'],
    estimated_frequency: 'monthly',
    message: '',
    terms_accepted: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [formError, setFormError] = useState(null);

  const handleCheckboxChange = (useCase) => {
    setFormData((prev) => {
      const current = prev.use_cases || [];
      const updated = current.includes(useCase)
        ? current.filter((item) => item !== useCase)
        : [...current, useCase];
      return { ...prev, use_cases: updated };
    });
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setSubmitResult(null);

    try {
      const res = await fetch('/api/business/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setSubmitResult(data);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedShowcase = OCCASIONS_SHOWCASE.find((item) => item.id === activeTab) || OCCASIONS_SHOWCASE[0];

  return (
    <div className="b2b-wrapper">
      {/* ── HERO SECTION ── */}
      <section className="b2b-hero">
        <div className="b2b-container">
          <div className="hero-badge-pill">
            <span className="badge-sparkle">✨</span>
            <span>LovelyCrafts for Business — Now in Early Access</span>
          </div>

          <h1 className="b2b-hero-title">
            Make Every Important Moment at Work <span className="gradient-text">Feel Personal.</span>
          </h1>

          <p className="b2b-hero-subtitle">
            Create personalized digital experiences for employee birthdays, work anniversaries, welcoming new team members,
            farewells, achievements, and company celebrations — all from one workspace.
          </p>

          <div className="hero-cta-group">
            <a href="#apply-section" className="b2b-btn-primary">
              <span>Get Started</span>
              <span className="arrow-icon">→</span>
            </a>
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="b2b-btn-secondary"
            >
              <span>Book a Demo</span>
              <span className="play-icon">▶</span>
            </button>
          </div>

          {/* Value Props Strip */}
          <div className="value-strip">
            <div className="value-item">
              <span className="value-icon">⚡</span>
              <span><strong>1-Click</strong> Experience Generation</span>
            </div>
            <div className="value-item">
              <span className="value-icon">📅</span>
              <span><strong>Automated</strong> Occasion Calendar</span>
            </div>
            <div className="value-item">
              <span className="value-icon">🎨</span>
              <span><strong>Custom</strong> Corporate Branding</span>
            </div>
            <div className="value-item">
              <span className="value-icon">🔒</span>
              <span><strong>Enterprise</strong> Data Isolation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE OCCASION SHOWCASE ── */}
      <section className="b2b-section showcase-section">
        <div className="b2b-container">
          <div className="section-header text-center">
            <span className="section-tag">Interactive Experiences</span>
            <h2 className="section-heading">Celebrations tailored for modern teams</h2>
            <p className="section-desc">
              Transform standard corporate emails into interactive, emotional milestones employees actually remember.
            </p>
          </div>

          {/* Showcase Tabs */}
          <div className="showcase-tabs">
            {OCCASIONS_SHOWCASE.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`showcase-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Showcase Card */}
          <div className="showcase-card glass-panel">
            <div className="showcase-grid">
              <div className="showcase-content">
                <span className="showcase-badge">{selectedShowcase.badge}</span>
                <h3 className="showcase-title">{selectedShowcase.headline}</h3>
                <p className="showcase-text">{selectedShowcase.description}</p>

                <div className="showcase-highlights">
                  {selectedShowcase.highlights.map((item, idx) => (
                    <div key={idx} className="highlight-pill">
                      <span className="check-icon">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="showcase-action">
                  <a href="#apply-section" className="b2b-btn-small">
                    Explore This Template in Workspace →
                  </a>
                </div>
              </div>

              {/* Interactive Mockup Visual */}
              <div className="showcase-visual-wrapper">
                <div className="preview-phone-frame">
                  <div className="phone-screen">
                    <div className="preview-top-bar">
                      <span className="preview-logo-dot"></span>
                      <span className="preview-company-name">Acme Technologies</span>
                    </div>

                    <div className="preview-experience-card">
                      <div className="preview-badge-row">
                        <span className="preview-tag">{selectedShowcase.icon} {selectedShowcase.title}</span>
                      </div>
                      <h4 className="preview-employee-name">{selectedShowcase.sampleRecipient}</h4>
                      <p className="preview-occasion-text">{selectedShowcase.sampleOccasion}</p>

                      <div className="preview-interactive-scene">
                        <div className="scene-particle p1">🎈</div>
                        <div className="scene-particle p2">✨</div>
                        <div className="scene-particle p3">🎉</div>
                        <div className="scene-box">
                          <span className="scene-box-icon">{selectedShowcase.icon}</span>
                          <span className="scene-box-cta">Tap to unwrap surprise</span>
                        </div>
                      </div>

                      <div className="preview-footer-note">
                        <span>Crafted with love by the Acme Team ❤️</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (4-STEP WORKFLOW) ── */}
      <section className="b2b-section how-it-works-section">
        <div className="b2b-container">
          <div className="section-header text-center">
            <span className="section-tag">Frictionless Workflow</span>
            <h2 className="section-heading">How LovelyCrafts for Business Works</h2>
            <p className="section-desc">
              From employee import to unforgettable celebrations in four effortless steps.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">🏢</div>
              <h3 className="step-title">Activate Workspace</h3>
              <p className="step-desc">
                Submit your corporate application. Receive a secure invitation to configure your dedicated workspace and branding.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">📊</div>
              <h3 className="step-title">Import Employees</h3>
              <p className="step-desc">
                Upload your team roster via Excel or CSV with intelligent column mapping and safe duplicate detection.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">🤖</div>
              <h3 className="step-title">Automated Occasions</h3>
              <p className="step-desc">
                Our Occasion Engine calculates upcoming birthdays &amp; tenure milestones, generating a prioritized HR action queue.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon">🎁</div>
              <h3 className="step-title">1-Click Personalization</h3>
              <p className="step-desc">
                Prefill known employee details, select approved templates, add optional photos or manager notes, and deliver with a unique link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="b2b-section dashboard-preview-section">
        <div className="b2b-container">
          <div className="dashboard-hero-mockup glass-panel">
            <div className="mockup-header-bar">
              <div className="mockup-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="mockup-address">business.lovelycrafts.in/acme-technologies</div>
            </div>

            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-brand">Acme Workspace</div>
                <div className="mockup-nav-item active">📊 Overview</div>
                <div className="mockup-nav-item">👥 Employee Directory</div>
                <div className="mockup-nav-item">📅 Occasion Calendar</div>
                <div className="mockup-nav-item">⚡ Experience Queue</div>
                <div className="mockup-nav-item">🎨 Brand Settings</div>
              </div>

              <div className="mockup-main">
                <div className="mockup-stats-row">
                  <div className="stat-box">
                    <span className="stat-label">Active Employees</span>
                    <span className="stat-val">342</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Occasions This Month</span>
                    <span className="stat-val">28</span>
                  </div>
                  <div className="stat-box highlighted">
                    <span className="stat-label">Ready to Create</span>
                    <span className="stat-val">3 Due</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Available Credits</span>
                    <span className="stat-val">120</span>
                  </div>
                </div>

                <div className="mockup-queue-card">
                  <div className="queue-header">
                    <h4>Upcoming Experience Queue</h4>
                    <span className="queue-badge">3 Actions Needed</span>
                  </div>

                  <div className="queue-item">
                    <div className="queue-avatar">👩</div>
                    <div className="queue-info">
                      <strong>Sneha Rao • Senior Frontend Engineer</strong>
                      <span>🎂 Birthday Tomorrow • Department: Engineering</span>
                    </div>
                    <span className="queue-btn">Create Experience ✨</span>
                  </div>

                  <div className="queue-item">
                    <div className="queue-avatar">👨</div>
                    <div className="queue-info">
                      <strong>Aditya Kulkarni • Product Manager</strong>
                      <span>🥂 3-Year Work Anniversary • Department: Product</span>
                    </div>
                    <span className="queue-btn">Create Experience ✨</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS & SECURITY ── */}
      <section className="b2b-section benefits-section">
        <div className="b2b-container">
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">⏱️</div>
              <h3 className="benefit-title">Zero Missed Occasions</h3>
              <p className="benefit-desc">
                Automated lead times alert your HR team 7 days in advance. No last-minute scrambles or forgotten employee moments.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">❤️</div>
              <h3 className="benefit-title">Deep Emotional Connection</h3>
              <p className="benefit-desc">
                Unlike sterile gift cards or boilerplate emails, LovelyCrafts creates rich, interactive memories that boost employee loyalty.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🛡️</div>
              <h3 className="benefit-title">Strict Tenant Isolation</h3>
              <p className="benefit-desc">
                Full server-side access controls, unindexed private URLs, and cryptographically random tokens ensure company data stays safe.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">👥</div>
              <h3 className="benefit-title">Role-Based Collaboration</h3>
              <p className="benefit-desc">
                Multi-tier permissions for Business Owners, HR Admins, Operators, and Approvers with full audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── APPLICATION & ONBOARDING FORM ── */}
      <section id="apply-section" className="b2b-section form-section">
        <div className="b2b-container max-w-form">
          <div className="section-header text-center">
            <span className="section-tag">Apply for Early Access</span>
            <h2 className="section-heading">Get Started with LovelyCrafts for Business</h2>
            <p className="section-desc">
              Fill out the form below. Our platform team reviews all applications within 24 hours to provision your dedicated workspace.
            </p>
          </div>

          <div className="form-card glass-panel">
            {submitResult ? (
              <div className="submit-success-state text-center">
                <div className="success-icon-circle">🎉</div>
                <h3 className="success-title">Application Received!</h3>
                <p className="success-desc">
                  Thank you for applying. We have registered <strong>{formData.company_name}</strong> for review.
                  An invitation link will be sent to <strong>{formData.business_email}</strong> once approved.
                </p>
                <div className="success-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitResult(null);
                      setFormData({
                        company_name: '',
                        website: '',
                        business_email: '',
                        contact_name: '',
                        designation: '',
                        employee_count: '10-50',
                        use_cases: ['birthdays', 'work_anniversaries'],
                        estimated_frequency: 'monthly',
                        message: '',
                        terms_accepted: true,
                      });
                    }}
                    className="b2b-btn-secondary"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="application-form">
                {formError && (
                  <div className="form-alert error">
                    <span>⚠️ {formError}</span>
                  </div>
                )}

                <div className="form-row two-col">
                  <div className="form-group">
                    <label htmlFor="company_name">Company Name *</label>
                    <input
                      type="text"
                      id="company_name"
                      required
                      placeholder="e.g. Acme Technologies Pvt Ltd"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Company Website (Optional)</label>
                    <input
                      type="url"
                      id="website"
                      placeholder="https://acme.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row two-col">
                  <div className="form-group">
                    <label htmlFor="business_email">Work / Business Email *</label>
                    <input
                      type="email"
                      id="business_email"
                      required
                      placeholder="you@company.com"
                      value={formData.business_email}
                      onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact_name">Your Full Name *</label>
                    <input
                      type="text"
                      id="contact_name"
                      required
                      placeholder="e.g. Aditi Sharma"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row two-col">
                  <div className="form-group">
                    <label htmlFor="designation">Job Title / Role *</label>
                    <input
                      type="text"
                      id="designation"
                      required
                      placeholder="e.g. Head of HR / People Operations"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="employee_count">Approximate Employee Count *</label>
                    <select
                      id="employee_count"
                      value={formData.employee_count}
                      onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                    >
                      <option value="10-50">10 – 50 Employees</option>
                      <option value="51-200">51 – 200 Employees</option>
                      <option value="201-500">201 – 500 Employees</option>
                      <option value="501-2000">501 – 2,000 Employees</option>
                      <option value="2000+">2,000+ Employees (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Primary Use Cases (Select all that apply)</label>
                  <div className="checkbox-grid">
                    {[
                      { id: 'birthdays', label: '🎂 Employee Birthdays' },
                      { id: 'work_anniversaries', label: '🥂 Work Anniversaries' },
                      { id: 'welcome', label: '🚀 Welcome & Onboarding' },
                      { id: 'farewell', label: '💐 Farewells & Goodbyes' },
                      { id: 'appreciation', label: '🌟 Spot Recognition' },
                      { id: 'festivals', label: '🪔 Festival Greetings' },
                    ].map((item) => (
                      <label key={item.id} className="checkbox-pill">
                        <input
                          type="checkbox"
                          checked={formData.use_cases.includes(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Optional Message or Specific Requirements</label>
                  <textarea
                    id="message"
                    rows="3"
                    placeholder="Tell us about your team or any specific custom branding needs..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="form-group terms-checkbox">
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      required
                      checked={formData.terms_accepted}
                      onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                    />
                    <span>
                      I agree to the LovelyCrafts <Link href="/terms" target="_blank">Terms of Service</Link> and{' '}
                      <Link href="/privacy" target="_blank">Privacy Policy</Link>.
                    </span>
                  </label>
                </div>

                <button type="submit" disabled={loading} className="b2b-btn-primary full-width">
                  {loading ? 'Submitting Application...' : 'Submit Application for Corporate Account →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section className="b2b-section faq-section">
        <div className="b2b-container max-w-form">
          <div className="section-header text-center">
            <span className="section-tag">Frequently Asked Questions</span>
            <h2 className="section-heading">Everything you need to know</h2>
          </div>

          <div className="faq-list">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="faq-item glass-panel">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <span className="faq-toggle-icon">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOK A DEMO MODAL ── */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="modal-backdrop" onClick={() => setDemoModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="demo-modal glass-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Book a Live Product Tour</h3>
                <button type="button" className="close-btn" onClick={() => setDemoModalOpen(false)}>
                  ✕
                </button>
              </div>

              <p className="modal-desc">
                See how LovelyCrafts automates celebrations for your team in a quick 15-minute walkthrough.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you! Our corporate solution team will reach out to schedule your demo.');
                  setDemoModalOpen(false);
                }}
                className="demo-form"
              >
                <div className="form-group">
                  <label>Work Email</label>
                  <input type="email" required placeholder="name@company.com" />
                </div>
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" required placeholder="Acme Inc." />
                </div>
                <button type="submit" className="b2b-btn-primary full-width">
                  Request Demo Slot →
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .b2b-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 60%, #090d16 100%);
          color: #f8fafc;
          font-family: inherit;
          padding-bottom: 80px;
        }

        .b2b-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .max-w-form {
          max-width: 780px;
        }

        .b2b-hero {
          padding: 90px 0 60px;
          text-align: center;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.35);
          color: #a5b4fc;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .b2b-hero-title {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
          color: #ffffff;
        }

        .gradient-text {
          background: linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .b2b-hero-subtitle {
          font-size: 1.2rem;
          color: #94a3b8;
          max-width: 720px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }

        .b2b-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 1.05rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(244, 63, 94, 0.35);
          transition: all 0.2s ease;
        }

        .b2b-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(244, 63, 94, 0.5);
        }

        .b2b-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .b2b-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .value-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .value-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .b2b-section {
          padding: 70px 0;
        }

        .section-header {
          margin-bottom: 40px;
        }

        .section-tag {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f43f5e;
          display: block;
          margin-bottom: 8px;
        }

        .section-heading {
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .section-desc {
          color: #94a3b8;
          font-size: 1.05rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .glass-panel {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }

        /* Showcase */
        .showcase-tabs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .showcase-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .showcase-tab.active {
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.1) 100%);
          border-color: #f43f5e;
          color: #ffffff;
        }

        .showcase-card {
          padding: 40px;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .showcase-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.15);
          padding: 4px 10px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .showcase-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 14px;
          line-height: 1.25;
        }

        .showcase-text {
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .showcase-highlights {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
        }

        .highlight-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #e2e8f0;
          font-size: 0.95rem;
        }

        .check-icon {
          color: #10b981;
          font-weight: 800;
        }

        .b2b-btn-small {
          display: inline-flex;
          padding: 10px 18px;
          border-radius: 8px;
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.4);
          color: #f43f5e;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
        }

        /* Phone mockup visual */
        .showcase-visual-wrapper {
          display: flex;
          justify-content: center;
        }

        .preview-phone-frame {
          width: 320px;
          background: #020617;
          border-radius: 36px;
          padding: 12px;
          border: 4px solid #334155;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .phone-screen {
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          border-radius: 28px;
          padding: 18px 14px;
          min-height: 380px;
          display: flex;
          flex-direction: column;
        }

        .preview-top-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 14px;
        }

        .preview-logo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f43f5e;
        }

        .preview-experience-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: space-between;
        }

        .preview-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
          padding: 3px 10px;
          border-radius: 999px;
        }

        .preview-employee-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          margin: 8px 0 2px;
        }

        .preview-occasion-text {
          font-size: 0.8rem;
          color: #cbd5e1;
        }

        .preview-interactive-scene {
          position: relative;
          width: 100%;
          padding: 30px 10px;
          margin: 10px 0;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px dashed rgba(255, 255, 255, 0.15);
        }

        .scene-particle {
          position: absolute;
          font-size: 1.2rem;
          animation: floatParticle 3s infinite ease-in-out alternate;
        }

        .p1 { top: 10px; left: 20px; }
        .p2 { top: 15px; right: 25px; animation-delay: 0.5s; }
        .p3 { bottom: 10px; left: 40px; animation-delay: 1s; }

        @keyframes floatParticle {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-8px) rotate(15deg); }
        }

        .scene-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .scene-box-icon {
          font-size: 2.2rem;
        }

        .scene-box-cta {
          font-size: 0.75rem;
          font-weight: 700;
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.15);
          padding: 4px 10px;
          border-radius: 999px;
        }

        .preview-footer-note {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* How it works */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .step-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 28px 20px;
          position: relative;
        }

        .step-number {
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 12px;
        }

        .step-icon {
          font-size: 2rem;
          margin-bottom: 12px;
        }

        .step-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .step-desc {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        /* Dashboard Mockup */
        .dashboard-hero-mockup {
          overflow: hidden;
        }

        .mockup-header-bar {
          background: #0b0f19;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid #1e293b;
        }

        .mockup-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot.red { background: #ef4444; }
        .dot.yellow { background: #f59e0b; }
        .dot.green { background: #10b981; }

        .mockup-address {
          font-size: 0.75rem;
          color: #64748b;
          background: #1e293b;
          padding: 3px 12px;
          border-radius: 6px;
        }

        .mockup-body {
          display: grid;
          grid-template-columns: 220px 1fr;
          min-height: 380px;
        }

        .mockup-sidebar {
          background: #090d16;
          padding: 20px 16px;
          border-right: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mockup-brand {
          font-size: 0.85rem;
          font-weight: 800;
          color: #38bdf8;
          margin-bottom: 16px;
        }

        .mockup-nav-item {
          font-size: 0.8rem;
          color: #94a3b8;
          padding: 8px 12px;
          border-radius: 6px;
        }

        .mockup-nav-item.active {
          background: #1e293b;
          color: #ffffff;
          font-weight: 700;
        }

        .mockup-main {
          padding: 24px;
        }

        .mockup-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: #131c2e;
          border: 1px solid #1e293b;
          padding: 14px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-box.highlighted {
          border-color: rgba(244, 63, 94, 0.4);
          background: rgba(244, 63, 94, 0.08);
        }

        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 600;
        }

        .stat-val {
          font-size: 1.2rem;
          font-weight: 800;
          color: #ffffff;
        }

        .mockup-queue-card {
          background: #131c2e;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 16px;
        }

        .queue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .queue-header h4 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .queue-badge {
          font-size: 0.7rem;
          font-weight: 700;
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.15);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .queue-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: #0d1322;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .queue-avatar {
          font-size: 1.3rem;
        }

        .queue-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          font-size: 0.8rem;
        }

        .queue-info strong {
          color: #f8fafc;
        }

        .queue-info span {
          color: #94a3b8;
          font-size: 0.72rem;
        }

        .queue-btn {
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
        }

        /* Benefits Grid */
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .benefit-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
        }

        .benefit-icon {
          font-size: 1.8rem;
          margin-bottom: 12px;
        }

        .benefit-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .benefit-desc {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        /* Application Form */
        .form-card {
          padding: 36px;
        }

        .application-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-row.two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #cbd5e1;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 10px 14px;
          color: #ffffff;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #f43f5e;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .checkbox-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          background: #0f172a;
          border: 1px solid #334155;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .checkbox-inline {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.82rem;
          color: #94a3b8;
          cursor: pointer;
        }

        .checkbox-inline a {
          color: #f43f5e;
          text-decoration: underline;
        }

        .full-width {
          width: 100%;
          justify-content: center;
        }

        .form-alert.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .submit-success-state {
          padding: 20px 0;
        }

        .success-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .success-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .success-desc {
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto 24px;
        }

        /* FAQ */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: transparent;
          border: none;
          color: #f8fafc;
          font-weight: 700;
          font-size: 1rem;
          text-align: left;
          cursor: pointer;
        }

        .faq-toggle-icon {
          font-size: 1.3rem;
          color: #f43f5e;
        }

        .faq-answer {
          padding: 0 24px 20px;
          color: #94a3b8;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .demo-modal {
          width: 100%;
          max-width: 480px;
          padding: 30px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .modal-header h3 {
          font-size: 1.3rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .modal-desc {
          font-size: 0.9rem;
          color: #94a3b8;
          margin-bottom: 20px;
        }

        .demo-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (max-width: 900px) {
          .b2b-hero-title {
            font-size: 2.4rem;
          }
          .showcase-grid {
            grid-template-columns: 1fr;
          }
          .steps-grid,
          .benefits-grid {
            grid-template-columns: 1fr 1fr;
          }
          .mockup-body {
            grid-template-columns: 1fr;
          }
          .mockup-sidebar {
            display: none;
          }
          .mockup-stats-row {
            grid-template-columns: 1fr 1fr;
          }
          .form-row.two-col {
            grid-template-columns: 1fr;
          }
          .checkbox-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .b2b-hero-title {
            font-size: 2rem;
          }
          .steps-grid,
          .benefits-grid {
            grid-template-columns: 1fr;
          }
          .checkbox-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
