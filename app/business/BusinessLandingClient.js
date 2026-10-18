'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { templates } from '@/lib/templates';

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

      {/* ── STANDARDIZED CORPORATE SUBSCRIPTION ── */}
      <section id="pricing-section" className="b2b-section pricing-section">
        <div className="b2b-container">
          <div className="section-header text-center">
            <span className="section-tag">Simple &amp; Transparent Pricing</span>
            <h2 className="section-heading">LovelyCrafts Business Plan</h2>
            <p className="section-desc">
              One predictable subscription for modern workplace recognition. Celebrate all milestones with zero hidden fees.
            </p>
          </div>

          <div className="corporate-plan-card glass-panel">
            <div className="corporate-plan-main">
              <div className="plan-badge-row">
                <span className="pricing-popular-badge-static">🏢 Standard Corporate Plan</span>
                <span className="plan-billing-badge">Postpaid Monthly Billing</span>
              </div>

              <div className="plan-price-header">
                <div className="price-block">
                  <div className="price-number-row">
                    <span className="currency">₹</span>
                    <span className="price-amount">2,499</span>
                    <span className="price-period">+ applicable GST / month</span>
                  </div>
                  <p className="price-subtext">Includes <strong>20 celebration credits</strong> every month</p>
                </div>

                <div className="additional-credit-pill">
                  <span className="pill-label">Need more celebrations?</span>
                  <span className="pill-value">₹99 + GST</span>
                  <span className="pill-desc">per additional credit</span>
                </div>
              </div>

              <div className="plan-inclusions-grid">
                <div className="inclusion-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>20 Monthly Credits Included</strong>
                    <p>1 credit = 1 customized interactive surprise generated and delivered for an employee.</p>
                  </div>
                </div>

                <div className="inclusion-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Full Interactive Template Access</strong>
                    <p>Unlimited access to our complete catalog of {templates.length} interactive experiences.</p>
                  </div>
                </div>

                <div className="inclusion-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Automated Occasion Engine</strong>
                    <p>Sync Excel/CSV rosters to automatically track birthdays, work anniversaries, and tenure milestones.</p>
                  </div>
                </div>

                <div className="inclusion-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Custom Company Branding</strong>
                    <p>Incorporate your company logo, greeting tone, manager signatures, and brand accent colors.</p>
                  </div>
                </div>

                <div className="inclusion-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Dedicated Corporate Workspace</strong>
                    <p>Dedicated workspace portal at business.lovelycrafts.in/[your-company] with multi-admin roles.</p>
                  </div>
                </div>

                <div className="inclusion-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Unified GST Invoicing</strong>
                    <p>Postpaid billing with unified monthly invoices and detailed audit log reports.</p>
                  </div>
                </div>
              </div>

              {/* Billing Rules & Real Example Box */}
              <div className="plan-rules-box">
                <h4 className="rules-heading">📋 How Billing &amp; Credits Work:</h4>
                <div className="rules-grid">
                  <div className="rule-point">
                    <span className="rule-icon">⚡</span>
                    <div>
                      <strong>Credit Usage:</strong> 1 credit is consumed whenever an interactive employee celebration is generated and delivered.
                    </div>
                  </div>
                  <div className="rule-point">
                    <span className="rule-icon">📅</span>
                    <div>
                      <strong>Monthly Reset &amp; Expiry:</strong> 20 base credits are replenished on the 1st of each month. Unused credits expire at month-end.
                    </div>
                  </div>
                  <div className="rule-point">
                    <span className="rule-icon">🔄</span>
                    <div>
                      <strong>Auto-Renewal &amp; Flexibility:</strong> Subscription auto-renews monthly postpaid. You can pause or cancel anytime with zero lock-in.
                    </div>
                  </div>
                </div>

                <div className="billing-example-banner">
                  <span className="example-badge">💡 Real Monthly Billing Example</span>
                  <p>
                    A 35-person team celebrates <strong>35 occasions</strong> this month:
                    <br />
                    <code>Base Plan (includes 20 credits) = ₹2,499</code> + <code>15 extra credits @ ₹99 = ₹1,485</code>
                    <br />
                    <strong>Total Monthly Invoice: ₹3,984 + applicable GST</strong> (No hidden fees).
                  </p>
                </div>
              </div>

              <div className="plan-actions-row">
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(true)}
                  className="b2b-btn-primary"
                >
                  <span>Book a Free 15-Min Demo</span>
                  <span>🎬</span>
                </button>
                <a href="#apply-section" className="b2b-btn-secondary">
                  <span>Apply for Business Access</span>
                  <span>↓</span>
                </a>
              </div>
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

        /* ── GLOBAL WRAPPER & ATMOSPHERE ── */
        .b2b-wrapper {
          min-height: 100vh;
          background-color: #05050e;
          background-image: 
            radial-gradient(ellipse 90% 60% at 50% -10%, rgba(244, 63, 94, 0.15), transparent 70%),
            radial-gradient(circle 600px at 100% 20%, rgba(139, 92, 246, 0.12), transparent 60%),
            radial-gradient(circle 700px at 0% 60%, rgba(236, 72, 153, 0.08), transparent 60%),
            radial-gradient(circle 800px at 50% 100%, rgba(99, 102, 241, 0.08), transparent 70%);
          color: #f1f5f9;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding-bottom: 100px;
          position: relative;
          overflow-x: hidden;
        }

        .b2b-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, #000 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 30%, #000 30%, transparent 100%);
        }

        .b2b-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 28px;
          position: relative;
          z-index: 1;
        }

        .max-w-form {
          max-width: 820px;
        }

        /* ── HERO SECTION ── */
        .b2b-hero {
          padding: 120px 0 80px;
          text-align: center;
          position: relative;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 22px;
          border-radius: 9999px;
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: #fda4af;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 28px;
          box-shadow: 0 0 25px rgba(244, 63, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          letter-spacing: 0.01em;
          transition: all 0.3s ease;
        }

        .hero-badge-pill:hover {
          border-color: rgba(244, 63, 94, 0.5);
          box-shadow: 0 0 35px rgba(244, 63, 94, 0.25);
          transform: translateY(-1px);
        }

        .badge-sparkle {
          animation: sparkle 2.5s infinite ease-in-out;
          display: inline-block;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.3) rotate(20deg); filter: drop-shadow(0 0 8px #f43f5e); }
        }

        .b2b-hero-title {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.12;
          letter-spacing: -0.035em;
          margin-bottom: 24px;
          color: #ffffff;
          max-width: 950px;
          margin-left: auto;
          margin-right: auto;
          text-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .gradient-text {
          background: linear-gradient(135deg, #f43f5e 0%, #fb7185 30%, #e879f9 70%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 250% auto;
          animation: shimmer 5s ease infinite alternate;
          display: inline;
        }

        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        .b2b-hero-subtitle {
          font-size: 1.2rem;
          color: #94a3b8;
          max-width: 740px;
          margin: 0 auto 44px;
          line-height: 1.75;
          font-weight: 450;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 64px;
        }

        .b2b-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 14px;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 1.05rem;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.25);
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(244, 63, 94, 0.45), 0 0 0 1px rgba(244, 63, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .b2b-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .b2b-btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 14px 40px rgba(244, 63, 94, 0.6), 0 0 20px rgba(244, 63, 94, 0.4);
        }

        .b2b-btn-primary:hover::after {
          transform: translateX(100%);
        }

        .b2b-btn-primary:active {
          transform: translateY(0) scale(0.98);
        }

        .b2b-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 30px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #f1f5f9;
          font-weight: 700;
          font-size: 1.02rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(14px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .b2b-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(244, 63, 94, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 25px rgba(244, 63, 94, 0.15);
        }

        .b2b-btn-secondary:active {
          transform: translateY(0);
        }

        .value-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          padding: 24px 32px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          backdrop-filter: blur(16px);
          max-width: 980px;
          margin: 0 auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .value-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .value-item strong {
          color: #ffffff;
          font-weight: 700;
        }

        .value-icon {
          font-size: 1.15rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
        }

        /* ── SECTION COMMON STYLES ── */
        .b2b-section {
          padding: 100px 0;
          position: relative;
        }

        .section-header {
          margin-bottom: 56px;
        }

        .section-tag {
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #f43f5e;
          display: inline-block;
          margin-bottom: 12px;
          padding: 4px 14px;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.25);
          border-radius: 999px;
        }

        .section-heading {
          font-size: 2.75rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 16px;
          letter-spacing: -0.03em;
          line-height: 1.15;
        }

        .section-desc {
          color: #94a3b8;
          font-size: 1.08rem;
          max-width: 640px;
          margin: 0 auto;
          line-height: 1.7;
          font-weight: 450;
        }

        .glass-panel {
          background: rgba(15, 17, 30, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 80px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
          border-radius: 28px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        /* ── INTERACTIVE OCCASION SHOWCASE ── */
        .showcase-tabs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }

        .showcase-tab {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 22px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.94rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
        }

        .showcase-tab:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-2px);
        }

        .showcase-tab.active {
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
          border-color: rgba(244, 63, 94, 0.5);
          color: #ffffff;
          font-weight: 800;
          box-shadow: 0 8px 30px rgba(244, 63, 94, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .showcase-card {
          padding: 48px;
          position: relative;
          overflow: hidden;
        }

        .showcase-card::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 52px;
          align-items: center;
        }

        .showcase-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 16px;
          letter-spacing: 0.03em;
        }

        .showcase-title {
          font-size: 2.2rem;
          font-weight: 900;
          color: #ffffff !important;
          margin-bottom: 16px;
          line-height: 1.22;
          letter-spacing: -0.025em;
        }

        .showcase-text {
          color: #cbd5e1 !important;
          font-size: 1.05rem;
          line-height: 1.7;
          margin-bottom: 28px;
          font-weight: 400;
        }

        .showcase-highlights {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .highlight-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #e2e8f0;
          font-size: 0.96rem;
          font-weight: 500;
        }

        .check-icon {
          color: #10b981;
          font-weight: 900;
          font-size: 0.82rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
        }

        .b2b-btn-small {
          display: inline-flex;
          padding: 12px 22px;
          border-radius: 10px;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.35);
          color: #fda4af;
          font-weight: 700;
          font-size: 0.92rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .b2b-btn-small:hover {
          background: rgba(244, 63, 94, 0.22);
          color: #ffffff;
          transform: translateX(3px);
        }

        /* ── PHONE MOCKUP FRAME ── */
        .showcase-visual-wrapper {
          display: flex;
          justify-content: center;
        }

        .preview-phone-frame {
          width: 320px;
          background: #090a14;
          border-radius: 44px;
          padding: 12px;
          border: 2px solid rgba(255, 255, 255, 0.14);
          box-shadow: 
            0 40px 90px -15px rgba(0, 0, 0, 0.9),
            0 0 0 1px rgba(244, 63, 94, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          position: relative;
        }

        .phone-screen {
          background: linear-gradient(180deg, #16182c 0%, #0d0f1e 100%);
          border-radius: 34px;
          padding: 22px 18px;
          min-height: 420px;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .preview-top-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #cbd5e1;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 16px;
        }

        .preview-logo-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f43f5e;
          box-shadow: 0 0 12px #f43f5e;
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
          font-size: 0.78rem;
          font-weight: 800;
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 5px 12px;
          border-radius: 999px;
        }

        .preview-employee-name {
          font-size: 1.35rem;
          font-weight: 900;
          color: #ffffff;
          margin: 12px 0 4px;
          letter-spacing: -0.02em;
        }

        .preview-occasion-text {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-bottom: 18px;
        }

        .preview-interactive-scene {
          position: relative;
          width: 100%;
          padding: 28px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          margin: 10px 0;
          overflow: hidden;
        }

        .scene-particle {
          position: absolute;
          font-size: 1.4rem;
          animation: floatParticle 3s infinite ease-in-out alternate;
        }

        .p1 { top: 12px; left: 18px; animation-delay: 0s; }
        .p2 { top: 16px; right: 20px; animation-delay: 0.8s; }
        .p3 { bottom: 14px; left: 30px; animation-delay: 1.4s; }

        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-8px) scale(1.15); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); }
        }

        .scene-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .scene-box-icon {
          font-size: 2.4rem;
          filter: drop-shadow(0 6px 12px rgba(244, 63, 94, 0.4));
        }

        .scene-box-cta {
          font-size: 0.76rem;
          font-weight: 700;
          color: #fda4af;
          background: rgba(244, 63, 94, 0.15);
          padding: 4px 10px;
          border-radius: 999px;
        }

        .preview-footer-note {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 500;
        }

        /* ── 4-STEP WORKFLOW CARDS ── */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .step-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          padding: 32px 24px;
          position: relative;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(16px);
        }

        .step-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(244, 63, 94, 0.35);
          transform: translateY(-6px);
          box-shadow: 0 25px 50px -10px rgba(244, 63, 94, 0.2);
        }

        .step-number {
          font-size: 0.78rem;
          font-weight: 900;
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.25);
          display: inline-block;
          padding: 4px 10px;
          border-radius: 8px;
          margin-bottom: 18px;
          letter-spacing: 0.05em;
        }

        .step-icon {
          font-size: 2.4rem;
          margin-bottom: 16px;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));
        }

        .step-title {
          font-size: 1.18rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }

        .step-desc {
          font-size: 0.9rem;
          color: #94a3b8;
          line-height: 1.65;
        }

        /* ── DASHBOARD MOCKUP ── */
        .dashboard-hero-mockup {
          overflow: hidden;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8), 0 0 60px rgba(244, 63, 94, 0.08);
        }

        .mockup-header-bar {
          background: rgba(10, 12, 22, 0.8);
          padding: 14px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mockup-dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }

        .dot.red { background: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
        .dot.yellow { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
        .dot.green { background: #10b981; box-shadow: 0 0 6px #10b981; }

        .mockup-address {
          font-size: 0.8rem;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 4px 16px;
          border-radius: 8px;
          font-family: monospace;
        }

        .mockup-body {
          display: grid;
          grid-template-columns: 220px 1fr;
          min-height: 420px;
        }

        .mockup-sidebar {
          background: rgba(10, 12, 22, 0.4);
          padding: 24px 18px;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mockup-brand {
          font-size: 0.92rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mockup-nav-item {
          font-size: 0.84rem;
          color: #94a3b8;
          padding: 9px 14px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .mockup-nav-item.active {
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: #fda4af;
          font-weight: 700;
        }

        .mockup-main {
          padding: 28px;
          background: transparent;
        }

        .mockup-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .stat-box.highlighted {
          border-color: rgba(244, 63, 94, 0.4);
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.04) 100%);
          box-shadow: 0 0 25px rgba(244, 63, 94, 0.15);
        }

        .stat-label {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-val {
          font-size: 1.4rem;
          font-weight: 900;
          color: #ffffff;
        }

        .mockup-queue-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
        }

        .queue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .queue-header h4 {
          font-size: 0.98rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .queue-badge {
          font-size: 0.72rem;
          font-weight: 800;
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.3);
          padding: 3px 10px;
          border-radius: 999px;
        }

        .queue-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }

        .queue-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .queue-avatar {
          font-size: 1.5rem;
        }

        .queue-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          font-size: 0.84rem;
        }

        .queue-info strong {
          color: #f1f5f9;
          font-weight: 700;
        }

        .queue-info span {
          color: #94a3b8;
          font-size: 0.74rem;
        }

        .queue-btn {
          font-size: 0.76rem;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
          border: none;
          box-shadow: 0 2px 10px rgba(244, 63, 94, 0.3);
        }

        /* ── ENTERPRISE BENEFITS ── */
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .benefit-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          padding: 32px 26px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(14px);
        }

        .benefit-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .benefit-icon {
          font-size: 2.2rem;
          margin-bottom: 16px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
        }

        .benefit-title {
          font-size: 1.12rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }

        .benefit-desc {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.65;
        }

        /* ── PRICING MODEL SECTION ── */
        .pricing-section {
          background: radial-gradient(circle 800px at 50% 50%, rgba(244, 63, 94, 0.07), transparent 70%);
        }

        /* ── STANDARDIZED CORPORATE PLAN CARD ── */
        .corporate-plan-card {
          max-width: 960px;
          margin: 0 auto;
          background: linear-gradient(180deg, rgba(244, 63, 94, 0.08) 0%, rgba(15, 17, 30, 0.85) 100%);
          border: 1.5px solid rgba(244, 63, 94, 0.4);
          border-radius: 28px;
          padding: 48px;
          box-shadow: 0 35px 90px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(244, 63, 94, 0.15);
          position: relative;
          backdrop-filter: blur(24px);
        }

        .plan-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pricing-popular-badge-static {
          background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 6px 16px;
          border-radius: 999px;
          box-shadow: 0 4px 15px rgba(244, 63, 94, 0.4);
        }

        .plan-billing-badge {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 999px;
        }

        .plan-price-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding-bottom: 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .price-number-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .price-number-row .currency {
          font-size: 2.2rem;
          font-weight: 800;
          color: #fda4af;
        }

        .price-number-row .price-amount {
          font-size: 3.8rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .price-number-row .price-period {
          font-size: 1rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .price-subtext {
          margin: 10px 0 0;
          font-size: 1.05rem;
          color: #cbd5e1;
        }

        .price-subtext strong {
          color: #f43f5e;
        }

        .additional-credit-pill {
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.35);
          border-radius: 18px;
          padding: 16px 24px;
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pill-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: #fda4af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .pill-value {
          font-size: 1.6rem;
          font-weight: 900;
          color: #ffffff;
        }

        .pill-desc {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .plan-inclusions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 36px;
        }

        .inclusion-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .inclusion-item .chk {
          color: #10b981;
          font-weight: 900;
          font-size: 0.95rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .inclusion-item strong {
          display: block;
          color: #ffffff;
          font-size: 1.02rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .inclusion-item p {
          margin: 0;
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.55;
        }

        /* Rules & Billing Example */
        .plan-rules-box {
          background: rgba(10, 12, 22, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px 28px;
          margin-bottom: 36px;
        }

        .rules-heading {
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 16px;
        }

        .rules-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 20px;
        }

        .rule-point {
          display: flex;
          gap: 10px;
          font-size: 0.86rem;
          color: #cbd5e1;
          line-height: 1.5;
        }

        .rule-point strong {
          color: #ffffff;
        }

        .rule-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .billing-example-banner {
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.25);
          border-radius: 14px;
          padding: 16px 20px;
        }

        .example-badge {
          display: inline-block;
          font-size: 0.74rem;
          font-weight: 800;
          color: #fda4af;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .billing-example-banner p {
          margin: 0;
          font-size: 0.92rem;
          color: #e2e8f0;
          line-height: 1.6;
        }

        .billing-example-banner code {
          background: rgba(0, 0, 0, 0.4);
          padding: 2px 8px;
          border-radius: 6px;
          color: #fb7185;
          font-family: monospace;
          font-size: 0.88rem;
        }

        .plan-actions-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        /* ── APPLICATION FORM SECTION ── */
        .form-section {
          background: radial-gradient(circle 800px at 50% 50%, rgba(139, 92, 246, 0.06), transparent 70%);
        }

        .form-card {
          padding: 48px;
          background: rgba(15, 17, 30, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .application-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row.two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #cbd5e1;
          letter-spacing: 0.01em;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 13px 16px;
          color: #ffffff;
          font-size: 0.96rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .form-group select option {
          background: #111322;
          color: #ffffff;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #64748b;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: rgba(244, 63, 94, 0.6);
          box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 0.07);
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .checkbox-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.84rem;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.2s ease;
        }

        .checkbox-pill:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #f1f5f9;
          border-color: rgba(255, 255, 255, 0.16);
        }

        .checkbox-inline {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
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
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .submit-success-state {
          padding: 30px 0;
          text-align: center;
        }

        .success-icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.12);
          border: 2px solid rgba(16, 185, 129, 0.35);
          font-size: 2.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 0 35px rgba(16, 185, 129, 0.25);
        }

        .success-title {
          font-size: 1.8rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .success-desc {
          color: #cbd5e1;
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 28px;
        }

        /* ── FAQ ACCORDION ── */
        .faq-section {
          background: transparent;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          transition: all 0.25s ease;
          backdrop-filter: blur(12px);
        }

        .faq-item:hover {
          border-color: rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.045);
        }

        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 28px;
          background: transparent;
          border: none;
          color: #ffffff;
          font-weight: 700;
          font-size: 1.05rem;
          text-align: left;
          cursor: pointer;
          gap: 20px;
          font-family: inherit;
        }

        .faq-toggle-icon {
          font-size: 1.4rem;
          color: #f43f5e;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .faq-answer {
          padding: 0 28px 24px;
          color: #cbd5e1;
          font-size: 0.95rem;
          line-height: 1.75;
        }

        /* ── BOOK A DEMO MODAL ── */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(4, 5, 12, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .demo-modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 40px;
          background: #0f1122;
          border: 1px solid rgba(244, 63, 94, 0.3);
          border-radius: 28px;
          box-shadow: 
            0 40px 100px -20px rgba(0, 0, 0, 0.9),
            0 0 80px rgba(244, 63, 94, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .demo-modal::-webkit-scrollbar {
          width: 5px;
        }
        .demo-modal::-webkit-scrollbar-track { background: transparent; }
        .demo-modal::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 999px; }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
        }

        .modal-tag {
          font-size: 0.78rem;
          font-weight: 800;
          color: #f43f5e;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }

        .modal-header h3 {
          font-size: 1.55rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(244, 63, 94, 0.2);
          color: #ffffff;
          border-color: rgba(244, 63, 94, 0.4);
        }

        .demo-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .demo-success {
          text-align: center;
          padding: 24px 0;
        }

        .demo-success-icon {
          font-size: 3.4rem;
          margin-bottom: 18px;
        }

        .demo-success h4 {
          font-size: 1.6rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .demo-success p {
          font-size: 1rem;
          color: #cbd5e1;
          line-height: 1.7;
          margin-bottom: 28px;
        }

        /* ── RESPONSIVE ADAPTATIONS ── */
        @media (max-width: 1024px) {
          .b2b-hero-title {
            font-size: 3.2rem;
          }
        }

        @media (max-width: 900px) {
          .b2b-hero-title {
            font-size: 2.6rem;
          }
          .showcase-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .steps-grid,
          .benefits-grid {
            grid-template-columns: 1fr 1fr;
          }
          .corporate-plan-card {
            padding: 32px 24px;
          }
          .plan-inclusions-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .rules-grid {
            grid-template-columns: 1fr;
            gap: 14px;
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
          .value-strip {
            border-radius: 20px;
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .b2b-hero-title {
            font-size: 2.1rem;
          }
          .section-heading {
            font-size: 2rem;
          }
          .plan-price-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 18px;
          }
          .additional-credit-pill {
            width: 100%;
            text-align: left;
          }
          .steps-grid,
          .benefits-grid {
            grid-template-columns: 1fr;
          }
          .checkbox-grid {
            grid-template-columns: 1fr;
          }
          .demo-modal {
            padding: 24px;
          }
          .form-card {
            padding: 28px 20px;
          }
          .showcase-card {
            padding: 28px 20px;
          }
        }
      `}</style>
    </div>
  );
}
