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

  // Application Form State
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

  // Demo Modal Form State
  const [demoForm, setDemoForm] = useState({
    contact_name: '',
    business_email: '',
    company_name: '',
    phone: '',
    designation: '',
    employee_count: '10-50',
    message: '',
  });
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState(null);
  const [demoError, setDemoError] = useState(null);

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

      {/* ── PRICING MODEL / DEMO CTA ── */}
      <section id="pricing-section" className="b2b-section pricing-section">
        <div className="b2b-container">
          <div className="section-header text-center">
            <span className="section-tag">Transparent Pricing</span>
            <h2 className="section-heading">Built for Teams of All Sizes</h2>
            <p className="section-desc">
              Custom pricing tailored to your team. No surprise bills — pay only for what your team celebrates.
            </p>
          </div>

          <div className="pricing-model-grid">
            <div className="pricing-model-card">
              <div className="pricing-model-icon">🎯</div>
              <h3 className="pricing-model-title">Per-Experience Model</h3>
              <p className="pricing-model-desc">
                Pay per unique employee experience created. Birthdays, anniversaries, welcomes — each counts as one credit.
              </p>
              <div className="pricing-model-badge">₹199 / experience</div>
            </div>

            <div className="pricing-model-card featured">
              <div className="pricing-model-icon">🏢</div>
              <h3 className="pricing-model-title">Volume-Based Plans</h3>
              <p className="pricing-model-desc">
                Teams with 50+ employees get bonus credits. The more you celebrate, the more you save — with no credit expiry.
              </p>
              <div className="pricing-model-badge">Up to 25% bonus credits</div>
            </div>

            <div className="pricing-model-card">
              <div className="pricing-model-icon">🤝</div>
              <h3 className="pricing-model-title">Enterprise Contracts</h3>
              <p className="pricing-model-desc">
                Annual agreements with dedicated support, custom branding, multi-admin roles, and SLA guarantees.
              </p>
              <div className="pricing-model-badge">Custom quote</div>
            </div>
          </div>

          <div className="demo-cta-banner">
            <div className="demo-cta-content">
              <span className="demo-cta-tag">🎬 Live Walkthrough</span>
              <h3 className="demo-cta-title">See LovelyCrafts for Business in Action</h3>
              <p className="demo-cta-desc">
                Book a free 15-minute demo. We will show you how it works for your team size, and give you a custom pricing quote.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="b2b-btn-primary demo-cta-btn"
            >
              <span>Book a Free Demo</span>
              <span>→</span>
            </button>
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
          <div className="modal-backdrop" onClick={() => { setDemoModalOpen(false); setDemoResult(null); setDemoError(null); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="demo-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <div className="modal-tag">🎬 Free 15-min Walkthrough</div>
                  <h3>Book a Live Product Demo</h3>
                </div>
                <button type="button" className="close-btn" onClick={() => { setDemoModalOpen(false); setDemoResult(null); setDemoError(null); }}>
                  ✕
                </button>
              </div>

              {demoResult ? (
                <div className="demo-success">
                  <div className="demo-success-icon">🎉</div>
                  <h4>Demo Booked!</h4>
                  <p>Thanks <strong>{demoForm.contact_name}</strong>! Our team will reach out to <strong>{demoForm.business_email}</strong> within 24 hours to schedule your demo.</p>
                  <button type="button" className="b2b-btn-secondary" onClick={() => { setDemoModalOpen(false); setDemoResult(null); setDemoForm({ contact_name: '', business_email: '', company_name: '', phone: '', designation: '', employee_count: '10-50', message: '' }); }}>
                    Close
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setDemoLoading(true);
                    setDemoError(null);
                    try {
                      const res = await fetch('/api/business/demo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(demoForm),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Failed to submit demo request.');
                      setDemoResult(data);
                    } catch (err) {
                      setDemoError(err.message);
                    } finally {
                      setDemoLoading(false);
                    }
                  }}
                  className="demo-form"
                >
                  {demoError && (
                    <div className="form-alert error"><span>⚠️ {demoError}</span></div>
                  )}
                  <div className="form-row two-col">
                    <div className="form-group">
                      <label>Your Full Name *</label>
                      <input type="text" required placeholder="Aditi Sharma" value={demoForm.contact_name} onChange={(e) => setDemoForm({ ...demoForm, contact_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Work Email *</label>
                      <input type="email" required placeholder="you@company.com" value={demoForm.business_email} onChange={(e) => setDemoForm({ ...demoForm, business_email: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row two-col">
                    <div className="form-group">
                      <label>Company Name *</label>
                      <input type="text" required placeholder="Acme Technologies" value={demoForm.company_name} onChange={(e) => setDemoForm({ ...demoForm, company_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" placeholder="+91 98765 43210" value={demoForm.phone} onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row two-col">
                    <div className="form-group">
                      <label>Your Role / Designation</label>
                      <input type="text" placeholder="Head of HR" value={demoForm.designation} onChange={(e) => setDemoForm({ ...demoForm, designation: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Team Size</label>
                      <select value={demoForm.employee_count} onChange={(e) => setDemoForm({ ...demoForm, employee_count: e.target.value })}>
                        <option value="10-50">10 – 50 employees</option>
                        <option value="51-200">51 – 200 employees</option>
                        <option value="201-500">201 – 500 employees</option>
                        <option value="501-2000">501 – 2,000 employees</option>
                        <option value="2000+">2,000+ employees</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Anything specific you'd like to see?</label>
                    <textarea rows="2" placeholder="e.g. Custom branding, birthday automations, bulk imports..." value={demoForm.message} onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })} />
                  </div>
                  <button type="submit" disabled={demoLoading} className="b2b-btn-primary full-width">
                    {demoLoading ? 'Booking Demo...' : 'Book My Free Demo →'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .b2b-wrapper {
          min-height: 100vh;
          background: #06060f;
          color: #e2e8f0;
          font-family: 'Inter', -apple-system, sans-serif;
          padding-bottom: 80px;
        }

        .b2b-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px;
        }

        .max-w-form {
          max-width: 780px;
        }

        .b2b-hero {
          padding: 100px 0 70px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .b2b-hero::before {
          content: '';
          position: absolute;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%);
          pointer-events: none;
        }

        .b2b-hero::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(244, 63, 94, 0.3), transparent);
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border-radius: 999px;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.25);
          color: #fb7185;
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 24px;
          letter-spacing: 0.02em;
        }

        .badge-sparkle {
          animation: sparkle 2s infinite ease-in-out;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(15deg); }
        }

        .b2b-hero-title {
          font-size: 3.6rem;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 22px;
          color: #f1f5f9;
        }

        .gradient-text {
          background: linear-gradient(135deg, #f43f5e 0%, #e879f9 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        .b2b-hero-subtitle {
          font-size: 1.15rem;
          color: #94a3b8;
          max-width: 680px;
          margin: 0 auto 40px;
          line-height: 1.7;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 56px;
        }

        .b2b-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 60%, #be185d 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 24px rgba(244, 63, 94, 0.35), 0 0 0 1px rgba(244, 63, 94, 0.2);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .b2b-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .b2b-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px rgba(244, 63, 94, 0.5), 0 0 0 1px rgba(244, 63, 94, 0.3);
        }

        .b2b-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .b2b-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: #f1f5f9;
        }

        .value-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          padding-top: 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .value-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          color: #64748b;
          font-weight: 500;
        }

        .value-icon {
          font-size: 1.1rem;
        }

        .b2b-section {
          padding: 80px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .section-header {
          margin-bottom: 48px;
        }

        .section-tag {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f43f5e;
          display: block;
          margin-bottom: 10px;
        }

        .section-heading {
          font-size: 2.4rem;
          font-weight: 900;
          color: #f1f5f9;
          margin-bottom: 14px;
          letter-spacing: -0.02em;
        }

        .section-desc {
          color: #64748b;
          font-size: 1rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.5);
          border-radius: 20px;
          backdrop-filter: blur(20px);
        }

        /* Showcase */
        .showcase-tabs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .showcase-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #64748b;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .showcase-tab:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #94a3b8;
        }

        .showcase-tab.active {
          background: rgba(244, 63, 94, 0.12);
          border-color: rgba(244, 63, 94, 0.3);
          color: #f43f5e;
          font-weight: 700;
          box-shadow: 0 0 20px rgba(244, 63, 94, 0.1);
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
          color: #0284c7;
          background: #e0f2fe;
          padding: 4px 10px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .showcase-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 14px;
          line-height: 1.25;
        }

        .showcase-text {
          color: #475569;
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
          color: #94a3b8;
          font-size: 0.92rem;
        }

        .check-icon {
          color: #10b981;
          font-weight: 800;
          font-size: 0.8rem;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(16, 185, 129, 0.12);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .b2b-btn-small {
          display: inline-flex;
          padding: 10px 18px;
          border-radius: 8px;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.25);
          color: #f43f5e;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .b2b-btn-small:hover {
          background: rgba(244, 63, 94, 0.18);
        }

        /* Phone mockup visual */
        .showcase-visual-wrapper {
          display: flex;
          justify-content: center;
        }

        .preview-phone-frame {
          width: 300px;
          background: #0d0d1a;
          border-radius: 36px;
          padding: 10px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 60px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(244, 63, 94, 0.1), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .phone-screen {
          background: linear-gradient(180deg, #12121f 0%, #0a0a16 100%);
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
        .how-it-works-section {
          background: rgba(255,255,255,0.01);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          counter-reset: step-counter;
        }

        .step-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          padding: 28px 22px;
          position: relative;
          transition: all 0.3s ease;
        }

        .step-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(244, 63, 94, 0.2);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(244, 63, 94, 0.12);
        }

        .step-number {
          font-size: 0.72rem;
          font-weight: 900;
          color: #f43f5e;
          margin-bottom: 14px;
          opacity: 0.7;
          letter-spacing: 0.05em;
        }

        .step-icon {
          font-size: 2.2rem;
          margin-bottom: 14px;
        }

        .step-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #e2e8f0;
          margin-bottom: 8px;
        }

        .step-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* Dashboard Mockup */
        .dashboard-hero-mockup {
          overflow: hidden;
        }

        .mockup-header-bar {
          background: rgba(255,255,255,0.03);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
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
          color: #475569;
          background: rgba(255,255,255,0.05);
          padding: 3px 12px;
          border-radius: 6px;
        }

        .mockup-body {
          display: grid;
          grid-template-columns: 200px 1fr;
          min-height: 380px;
        }

        .mockup-sidebar {
          background: rgba(255,255,255,0.02);
          padding: 20px 16px;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mockup-brand {
          font-size: 0.85rem;
          font-weight: 800;
          color: #f43f5e;
          margin-bottom: 16px;
        }

        .mockup-nav-item {
          font-size: 0.78rem;
          color: #475569;
          padding: 7px 12px;
          border-radius: 6px;
        }

        .mockup-nav-item.active {
          background: rgba(244, 63, 94, 0.12);
          color: #f43f5e;
          font-weight: 700;
        }

        .mockup-main {
          background: transparent;
          padding: 24px;
        }

        .mockup-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 14px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-box.highlighted {
          border-color: rgba(244, 63, 94, 0.35);
          background: rgba(244, 63, 94, 0.07);
        }

        .stat-label {
          font-size: 0.68rem;
          color: #475569;
          font-weight: 600;
        }

        .stat-val {
          font-size: 1.2rem;
          font-weight: 800;
          color: #e2e8f0;
        }

        .mockup-queue-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
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
          font-size: 0.9rem;
          font-weight: 800;
          color: #e2e8f0;
          margin: 0;
        }

        .queue-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.12);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .queue-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
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
          font-size: 0.78rem;
        }

        .queue-info strong {
          color: #cbd5e1;
        }

        .queue-info span {
          color: #475569;
          font-size: 0.7rem;
        }

        .queue-btn {
          font-size: 0.72rem;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          padding: 5px 10px;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
        }

        /* Benefits Grid */
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .benefit-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          padding: 26px;
          transition: all 0.3s ease;
        }

        .benefit-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-3px);
        }

        .benefit-icon {
          font-size: 2rem;
          margin-bottom: 14px;
        }

        .benefit-title {
          font-size: 1rem;
          font-weight: 800;
          color: #e2e8f0;
          margin-bottom: 8px;
        }

        .benefit-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* Pricing Model Section */
        .pricing-section {
          background: linear-gradient(180deg, transparent, rgba(244, 63, 94, 0.03) 50%, transparent);
        }

        .pricing-model-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .pricing-model-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 32px 28px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .pricing-model-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(244, 63, 94, 0.3), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .pricing-model-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(244, 63, 94, 0.2);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(244, 63, 94, 0.12);
        }

        .pricing-model-card:hover::before {
          opacity: 1;
        }

        .pricing-model-card.featured {
          background: rgba(244, 63, 94, 0.06);
          border-color: rgba(244, 63, 94, 0.25);
          box-shadow: 0 0 40px rgba(244, 63, 94, 0.08);
        }

        .pricing-model-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .pricing-model-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #e2e8f0;
          margin-bottom: 10px;
        }

        .pricing-model-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.65;
          margin-bottom: 20px;
        }

        .pricing-model-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          padding: 5px 12px;
          border-radius: 999px;
        }

        /* Demo CTA Banner */
        .demo-cta-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(124, 58, 237, 0.08) 100%);
          border: 1px solid rgba(244, 63, 94, 0.2);
          border-radius: 20px;
          padding: 36px 40px;
          flex-wrap: wrap;
        }

        .demo-cta-content {
          flex: 1;
          min-width: 280px;
        }

        .demo-cta-tag {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          color: #f43f5e;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }

        .demo-cta-title {
          font-size: 1.6rem;
          font-weight: 900;
          color: #f1f5f9;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .demo-cta-desc {
          font-size: 0.92rem;
          color: #64748b;
          line-height: 1.6;
        }

        .demo-cta-btn {
          flex-shrink: 0;
          font-size: 1rem !important;
          padding: 16px 32px !important;
        }

        /* Application Form */
        .form-section {
          background: linear-gradient(180deg, transparent, rgba(37, 99, 235, 0.02) 50%, transparent);
        }

        .form-card {
          padding: 40px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
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
          font-size: 0.82rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.01em;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 11px 14px;
          color: #e2e8f0;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-group select option {
          background: #1e293b;
          color: #e2e8f0;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #475569;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: rgba(244, 63, 94, 0.4);
          box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.08);
          background: rgba(255, 255, 255, 0.06);
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
          font-size: 0.8rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          color: #64748b;
          transition: all 0.15s ease;
        }

        .checkbox-pill:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #94a3b8;
        }

        .checkbox-inline {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.82rem;
          color: #475569;
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
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.88rem;
        }

        .submit-success-state {
          padding: 20px 0;
        }

        .success-icon-circle {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .success-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #e2e8f0;
          margin-bottom: 12px;
        }

        .success-desc {
          color: #64748b;
          font-size: 1rem;
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto 24px;
        }

        /* FAQ */
        .faq-section {
          background: rgba(255,255,255,0.01);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .faq-item {
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          transition: all 0.2s ease;
        }

        .faq-item:hover {
          border-color: rgba(255, 255, 255, 0.12);
        }

        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-weight: 700;
          font-size: 0.95rem;
          text-align: left;
          cursor: pointer;
          gap: 16px;
        }

        .faq-toggle-icon {
          font-size: 1.3rem;
          color: #f43f5e;
          flex-shrink: 0;
        }

        .faq-answer {
          padding: 0 24px 20px;
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.7;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(16px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .demo-modal {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 36px;
          background: #0f0f1a;
          border: 1px solid rgba(244, 63, 94, 0.2);
          border-radius: 24px;
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.8), 0 0 60px rgba(244, 63, 94, 0.05);
        }

        .demo-modal::-webkit-scrollbar {
          width: 4px;
        }
        .demo-modal::-webkit-scrollbar-track { background: transparent; }
        .demo-modal::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 12px;
        }

        .modal-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: #f43f5e;
          margin-bottom: 6px;
          letter-spacing: 0.05em;
        }

        .modal-header h3 {
          font-size: 1.35rem;
          font-weight: 900;
          color: #f1f5f9;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #64748b;
          font-size: 1rem;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }

        .modal-desc {
          font-size: 0.88rem;
          color: #64748b;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .demo-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .demo-success {
          text-align: center;
          padding: 20px 0;
        }

        .demo-success-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .demo-success h4 {
          font-size: 1.4rem;
          font-weight: 900;
          color: #f1f5f9;
          margin-bottom: 10px;
        }

        .demo-success p {
          font-size: 0.92rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        @media (max-width: 900px) {
          .b2b-hero-title {
            font-size: 2.4rem;
          }
          .showcase-grid {
            grid-template-columns: 1fr;
          }
          .steps-grid,
          .benefits-grid,
          .pricing-model-grid {
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
          .demo-cta-banner {
            flex-direction: column;
            padding: 28px 24px;
          }
          .demo-cta-title {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 600px) {
          .b2b-hero-title {
            font-size: 2rem;
          }
          .steps-grid,
          .benefits-grid,
          .pricing-model-grid {
            grid-template-columns: 1fr;
          }
          .checkbox-grid {
            grid-template-columns: 1fr;
          }
          .demo-modal {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
