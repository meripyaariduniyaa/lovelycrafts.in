'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// Bump this version string whenever the T&C content materially changes.
// Any creator whose stored terms_version !== CURRENT_VERSION will be shown the modal again.
export const CREATOR_TERMS_VERSION = 'v1.0-2025';

const EFFECTIVE_DATE = '03 November 2025';
const COMPANY_NAME = 'Lovely Crafts';
const PLATFORM_URL = 'lovelycrafts.in';
const JURISDICTION_CITY = 'India';
const SUPPORT_EMAIL = 'meri.pyaari.duniyaa@gmail.com';

// ─────────────────────────────────────────────
// Section helper
// ─────────────────────────────────────────────
function Section({ num, title, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h3 style={{
        fontSize: '0.95rem',
        fontWeight: 800,
        color: '#0f172a',
        margin: '0 0 10px',
        paddingBottom: '6px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        gap: '8px',
        alignItems: 'baseline',
      }}>
        <span style={{
          background: '#f8f3eb',
          color: '#fff',
          borderRadius: '4px',
          fontSize: '0.72rem',
          padding: '2px 7px',
          fontWeight: 800,
          flexShrink: 0,
        }}>
          {num}
        </span>
        {title}
      </h3>
      <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

function Clause({ children }) {
  return (
    <p style={{ margin: '6px 0', paddingLeft: '16px', borderLeft: '2px solid #e2e8f0' }}>
      {children}
    </p>
  );
}

function SubList({ items }) {
  return (
    <ul style={{ margin: '8px 0 8px 24px', padding: 0, listStyleType: 'disc' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '4px', color: '#374151' }}>{item}</li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────
export default function CreatorTermsModal({ creatorName, creatorEmail, onAccept }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checked, setChecked] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const scrollRef = useRef(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom <= 60) {
      setHasScrolledToBottom(true);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const handleAccept = async () => {
    if (!checked || !hasScrolledToBottom) return;
    setAccepting(true);
    await onAccept();
    setAccepting(false);
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const canAgree = hasScrolledToBottom && checked;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(247, 238, 228, 0.96)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9998,
      }} />

      {/* Modal Shell */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '820px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f3eb 0%, #f8f3eb 100%)',
            padding: '24px 28px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>📋</div>
              <div>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '4px',
                }}>
                  Legal Agreement — Action Required Before Access
                </div>
                <h1 style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: '#f1f5f9',
                  margin: '0 0 4px',
                  lineHeight: 1.2,
                }}>
                  {COMPANY_NAME} Creator Partner Agreement
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                  Agreement Version:&nbsp;
                  <strong style={{ color: '#cbd5e1' }}>{CREATOR_TERMS_VERSION}</strong>
                  &nbsp;·&nbsp;Effective: {EFFECTIVE_DATE}
                </p>
              </div>
            </div>

            {!hasScrolledToBottom ? (
              <div style={{
                marginTop: '14px',
                background: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.4)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>📜</span>
                <span>Please scroll through the entire agreement to enable the acceptance button.</span>
              </div>
            ) : (
              <div style={{
                marginTop: '14px',
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.4)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>✅</span>
                <span>You have read the full agreement. Please tick the checkbox below to confirm your acceptance.</span>
              </div>
            )}
          </div>

          {/* Scrollable Document Body */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '28px',
              background: '#fafafa',
            }}
          >
            {/* Preamble Box */}
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '28px',
            }}>
              <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.8, margin: 0 }}>
                This <strong>Creator Partner Agreement</strong> (&ldquo;<strong>Agreement</strong>&rdquo;) is entered
                into as of the date of acceptance between <strong>{COMPANY_NAME}</strong> (&ldquo;<strong>Company</strong>&rdquo;,
                &ldquo;<strong>Platform</strong>&rdquo;, &ldquo;<strong>We</strong>&rdquo;, &ldquo;<strong>Us</strong>&rdquo;),
                a digital platform operating at <strong>{PLATFORM_URL}</strong>, and the individual identified
                during registration (&ldquo;<strong>Creator</strong>&rdquo;, &ldquo;<strong>You</strong>&rdquo;).
              </p>
              <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.8, margin: '12px 0 0' }}>
                By clicking &ldquo;<strong>I Agree &amp; Continue</strong>&rdquo;, you acknowledge that you have read,
                understood, and agree to be legally bound by all terms contained herein. If you do not agree,
                you must not access the Creator Partner Dashboard.
              </p>
              <div style={{
                marginTop: '14px',
                padding: '10px 14px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                color: '#64748b',
              }}>
                <strong>Creator:</strong> {creatorName || '(as registered)'}&nbsp;·&nbsp;
                <strong>Email:</strong> {creatorEmail || '(as registered)'}&nbsp;·&nbsp;
                <strong>Acceptance Date:</strong> {today}
              </div>
            </div>

            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '24px',
            }}>

              <Section num="1" title="Program Overview &amp; Eligibility">
                <Clause>
                  The {COMPANY_NAME} Creator Partner Program (&ldquo;<strong>Program</strong>&rdquo;) allows approved
                  content creators, influencers, and digital community managers to earn commission by
                  referring customers to purchase digital note products on the Platform.
                </Clause>
                <Clause>
                  Membership in the Program is by invitation or application only. The Company reserves the
                  sole right to approve, deny, suspend, or terminate any Creator&apos;s participation at
                  its absolute discretion, including but not limited to for breach of this Agreement, fraudulent
                  activity, or reputational harm to the Platform.
                </Clause>
                <Clause>
                  You must be at least 18 years of age and legally capable of entering into binding contracts
                  under Indian law to participate in this Program.
                </Clause>
                <Clause>
                  You represent and warrant that all information provided during application is accurate,
                  complete, and up-to-date, and you undertake to promptly update the same if it changes.
                </Clause>
              </Section>

              <Section num="2" title="Commission Structure &amp; Tier System">
                <Clause>
                  Commissions are calculated as a percentage of the net transaction value (excluding
                  applicable taxes and platform gateway charges) of each qualifying completed purchase
                  attributed to your referral link or coupon code within the attribution window.
                </Clause>
                <Clause>The current commission tiers and progressive brackets are as follows (subject to revision per Section 11):</Clause>
                <SubList items={[
                  'Starter Tier — 10% commission on orders 1 to 100 in the calendar month (0–99 monthly orders)',
                  'Rising Tier — 15% commission on orders 101 to 300 in the calendar month (100–299 monthly orders)',
                  'Creator Tier — 16% commission on orders 301 to 700 in the calendar month (300–699 monthly orders)',
                  'Partner Tier — 17% commission on orders 701 to 1,500 in the calendar month (700–1,499 monthly orders)',
                  'Elite Tier — 18% commission on orders 1,501+ in the calendar month (1,500+ monthly orders)',
                ]} />
                <Clause>
                  <strong>Monthly Volume Maintenance &amp; Tier Consistency:</strong> Tier rank and active commission brackets are evaluated dynamically based on order volume in each active calendar month. Creators must maintain qualifying monthly purchase volume to sustain higher tiers. If monthly order volume drops below a tier threshold in any subsequent month, the account&apos;s active tier adjusts down accordingly for that month.
                </Clause>
                <Clause>
                  <strong>Tier-Wise (Graduated) Commission Calculation:</strong> Commissions are paid on a progressive bracket basis. When an account advances to a higher tier within a month, purchases in each bracket are compensated at that bracket&apos;s designated rate (e.g. the first 100 orders earn 10%, orders 101–300 earn 15%, etc.), rather than applying a higher tier rate retroactively to lower-tier purchases.
                </Clause>
                <Clause>
                  Commissions are earned only on <strong>paid and completed</strong> orders. Refunded,
                  fraudulent, disputed, or self-referred orders are not eligible for commission and any
                  commission credited for such orders shall be reversed.
                </Clause>
                <Clause>
                  The 30-day cookie/referral attribution window begins on the date a prospective customer
                  first clicks your referral link. Only one Creator may be attributed per transaction.
                  In the event of a conflict, the most recent coupon code used at checkout shall take
                  precedence for attribution.
                </Clause>
              </Section>

              <Section num="3" title="Payment Terms &amp; Payout Conditions">
                <Clause>
                  Commissions accrue in your Creator Dashboard on a real-time basis. Payouts are processed
                  by the Company in periodic batches at the Company&apos;s discretion, provided your
                  pending balance has reached the minimum payout threshold of <strong>&#8377;500 (Indian Rupees Five Hundred)</strong>.
                </Clause>
                <Clause>
                  Payouts are made exclusively via UPI transfer or direct bank transfer (NEFT/IMPS) to
                  the payment details you provide. You are solely responsible for the accuracy of your
                  payment details. The Company shall not be liable for any misdirected payments resulting
                  from incorrect information supplied by you.
                </Clause>
                <Clause>
                  Processing time for approved payout batches is 7–10 business days from the payout
                  confirmation date. The Company reserves the right to place a payout on hold pending
                  compliance verification or fraud investigation.
                </Clause>
                <Clause>
                  All payout amounts are in Indian Rupees (INR). Tax Deducted at Source (TDS) under
                  applicable Indian income tax laws may be deducted from your payout at the applicable
                  rate. You are responsible for your own tax filings and compliance obligations.
                </Clause>
                <Clause>
                  In the event of termination for cause (as defined in Section 9), any unpaid commission
                  balance shall be forfeited in its entirety. In the event of termination without cause by
                  the Company, any pending balance above the minimum threshold shall be paid out within
                  30 business days of termination.
                </Clause>
              </Section>

              <Section num="4" title="Confidentiality &amp; Non-Disclosure of Transaction Data">
                <Clause>
                  <strong style={{ color: '#dc2626' }}>
                    You acknowledge that by virtue of participating in this Program, you may have access
                    to confidential and commercially sensitive information including but not limited to:
                  </strong>
                </Clause>
                <SubList items={[
                  'Your own commission rates, payout amounts, and earnings data',
                  'Transaction volumes, order counts, and referral conversion rates visible in your dashboard',
                  'Information about other creators in the Program (if incidentally disclosed)',
                  'Pricing strategies, discount structures, and coupon configurations',
                  'Platform revenue metrics, internal tools, and business strategy communicated to you',
                  'Any non-public technical or operational information of the Company',
                ]} />
                <Clause>
                  You agree to hold all Confidential Information in strict confidence and not to disclose,
                  publish, share, or distribute any Confidential Information to any third party — including
                  publicly on social media, in YouTube videos, in Discord communities, or in any other
                  medium — without the prior written consent of the Company.
                </Clause>
                <Clause>
                  This obligation of confidentiality shall survive the termination of this Agreement
                  for a period of <strong>3 (three) years</strong> from the date of termination or
                  indefinitely for trade secrets under applicable law.
                </Clause>
                <Clause>
                  You may disclose that you are a Creator Partner of {COMPANY_NAME} for the purpose
                  of promotional content, subject to the affiliate disclosure requirements in Section 7.
                  You must not disclose specific financial terms of this Agreement.
                </Clause>
                <Clause>
                  Breach of this confidentiality obligation shall be grounds for immediate termination
                  under Section 9 and may give rise to a civil claim for damages.
                </Clause>
              </Section>

              <Section num="5" title="Prohibited Conduct &amp; Content Standards">
                <Clause>As a Creator Partner, you agree <strong>not to</strong> engage in any of the following:</Clause>
                <SubList items={[
                  'Make false, misleading, or unsubstantiated claims about the Platform, its products, pricing, or quality',
                  'Use spam, unsolicited messaging, email blasts, or automated bots to drive referral clicks',
                  'Self-purchase using your own referral link or coupon code to generate fraudulent commission',
                  'Facilitate, encourage, or assist any other person in placing fraudulent orders for commission',
                  'Share your coupon code on coupon-aggregator websites, deal forums, or discount platforms (e.g. CouponDunia, GrabOn)',
                  'Impersonate the Company or claim to be an employee, officer, or representative of the Company',
                  'Create content that is defamatory, obscene, sexually explicit, hateful, discriminatory, or unlawful',
                  'Promote competing digital gifting or emotional note platforms simultaneously using Lovely Crafts brand assets',
                  'Conduct activities that could harm the brand reputation, goodwill, or intellectual property of the Company',
                  'Offer additional discounts, cash-back, or incentives to customers beyond the authorised coupon code discount',
                ]} />
                <Clause>
                  Violation of any of the above prohibited conduct provisions will result in immediate
                  termination and forfeiture of unpaid commissions, without prejudice to any other
                  remedy available to the Company.
                </Clause>
              </Section>

              <Section num="6" title="Intellectual Property &amp; Brand Usage Licence">
                <Clause>
                  The Company grants you a limited, non-exclusive, non-transferable, revocable licence
                  to use the {COMPANY_NAME} brand name, logo, and approved marketing materials solely
                  for the purpose of creating authentic promotional content under this Agreement.
                </Clause>
                <Clause>
                  You must not alter, modify, distort, or create derivative works from the Company&apos;s
                  logos, trademarks, or brand assets without written authorisation.
                </Clause>
                <Clause>
                  By publishing promotional content featuring the {COMPANY_NAME} brand, you grant the
                  Company a non-exclusive, royalty-free, worldwide licence to repost, feature, or
                  republish such content (with appropriate credit to you) on the Company&apos;s own
                  social media channels, website, or marketing materials.
                </Clause>
                <Clause>
                  All intellectual property rights in the Platform, its products, underlying technology,
                  and content remain exclusively with the Company. Nothing in this Agreement transfers
                  any IP rights to you.
                </Clause>
              </Section>

              <Section num="7" title="Affiliate Disclosure &amp; Advertising Standards Compliance">
                <Clause>
                  You are required by law and by this Agreement to clearly disclose your commercial
                  relationship with {COMPANY_NAME} in all promotional content, in compliance with the
                  Advertising Standards Council of India (&ldquo;<strong>ASCI</strong>&rdquo;) Guidelines for
                  Influencer Advertising (2021) and any amendments thereto.
                </Clause>
                <Clause>Acceptable disclosure formats include:</Clause>
                <SubList items={[
                  '"Ad", "#ad", or "#sponsored" prominently in the caption or title of the content',
                  '"Paid Partnership with Lovely Crafts" label (where the platform supports it, e.g. Instagram)',
                  'A clear spoken or on-screen disclosure at the beginning of video content',
                ]} />
                <Clause>
                  Burying disclosures below the &ldquo;read more&rdquo; fold, using ambiguous terms like &ldquo;#collab&rdquo;
                  without further context, or omitting disclosures entirely is a breach of this Agreement
                  and may expose you to regulatory liability under ASCI and Consumer Protection (E-Commerce)
                  Rules, 2020.
                </Clause>
                <Clause>
                  The Company shall not be liable for any regulatory action, fine, or penalty imposed
                  on you for failure to comply with disclosure obligations. You shall indemnify the Company
                  against any third-party claims arising from your non-disclosure.
                </Clause>
              </Section>

              <Section num="8" title="Data Privacy &amp; Compliance (DPDP Act 2023)">
                <Clause>
                  The Company collects and processes your personal data (including name, email address,
                  phone number, social media profile URLs, and payment UPI/bank details) exclusively
                  for the purposes of administering this Program, calculating commissions, and processing payouts.
                </Clause>
                <Clause>
                  Your data is processed in accordance with the <strong>Digital Personal Data Protection
                    Act, 2023 (DPDP Act)</strong> and the <strong>Information Technology Act, 2000</strong>.
                  You consent to the collection and processing of your personal data for the above purposes
                  by accepting this Agreement.
                </Clause>
                <Clause>
                  You have the right to access, correct, and request erasure of your personal data by
                  contacting us at <strong>{SUPPORT_EMAIL}</strong>. Note that erasure requests will
                  result in termination of your Creator Partner account.
                </Clause>
                <Clause>
                  The Company implements reasonable technical and organisational measures to protect
                  your personal data against unauthorised access, disclosure, or loss. However, no
                  internet-based system is fully secure and the Company makes no absolute guarantee of security.
                </Clause>
                <Clause>
                  Your data shall not be sold, rented, or transferred to third parties except as necessary
                  to process payments (e.g. to our payment service provider) or as required by applicable law.
                </Clause>
              </Section>

              <Section num="9" title="Termination &amp; Suspension">
                <Clause>
                  <strong>Termination for Cause:</strong> The Company may terminate your participation
                  in the Program immediately and without notice upon: (a) breach of any provision of
                  this Agreement; (b) fraudulent activity; (c) conduct that materially damages the
                  Company&apos;s reputation; (d) insolvency or bankruptcy; or (e) any court order or
                  regulatory directive requiring such termination.
                </Clause>
                <Clause>
                  <strong>Termination Without Cause:</strong> The Company may terminate your participation
                  with 24 (twenty-four) hours&apos; written notice (via email to your registered address)
                  for any reason. In such case, your accrued and undisputed commission balance above
                  the minimum threshold shall be paid within 30 business days.
                </Clause>
                <Clause>
                  <strong>Voluntary Termination:</strong> You may terminate this Agreement at any time
                  by ceasing to use the Creator Dashboard and notifying the Company in writing at {SUPPORT_EMAIL}.
                </Clause>
                <Clause>
                  Upon termination for any reason: (a) your Creator dashboard access is immediately
                  revoked; (b) your referral links and coupon codes are deactivated; (c) the licence
                  granted in Section 6 is immediately revoked; (d) your confidentiality obligations
                  survive as specified in Section 4.
                </Clause>
              </Section>

              <Section num="10" title="Representations, Warranties &amp; Indemnification">
                <Clause>
                  You represent and warrant that: (a) you have the full legal right and authority to
                  enter into this Agreement; (b) your participation does not violate any third-party
                  agreement or applicable law; (c) all content you produce is original or properly
                  licenced and does not infringe any third-party intellectual property right.
                </Clause>
                <Clause>
                  You agree to indemnify, defend, and hold harmless the Company, its directors, officers,
                  employees, and agents from and against any and all claims, damages, losses, costs,
                  and expenses (including reasonable legal fees) arising out of or related to: (a) your
                  breach of this Agreement; (b) your promotional content; (c) your violation of any
                  applicable law; or (d) your wilful misconduct or negligence.
                </Clause>
              </Section>

              <Section num="11" title="Limitation of Liability">
                <Clause>
                  To the maximum extent permitted by applicable law, the Company shall not be liable
                  to you for any indirect, incidental, consequential, special, or punitive damages
                  (including loss of earnings, loss of opportunity, or loss of data) arising out of
                  or related to this Agreement or the Program.
                </Clause>
                <Clause>
                  The Company&apos;s total aggregate liability to you under this Agreement shall not
                  exceed the total commissions paid to you in the 3 (three) calendar months immediately
                  preceding the event giving rise to the claim.
                </Clause>
                <Clause>
                  The Company does not guarantee any minimum earnings, referral volumes, or conversion rates.
                  Commission earnings depend entirely on your own promotional efforts and market conditions.
                </Clause>
              </Section>

              <Section num="12" title="Amendments to this Agreement">
                <Clause>
                  The Company reserves the right to amend, modify, or update any terms of this Agreement
                  at any time. Material changes will be notified to you by email and/or by displaying an
                  updated Agreement version in the Creator Dashboard requiring fresh acceptance.
                </Clause>
                <Clause>
                  Your continued use of the Creator Dashboard following notification of an amendment
                  constitutes acceptance of the revised terms. If you do not agree to any amendment,
                  your sole remedy is to discontinue use and request termination under Section 9.
                </Clause>
              </Section>

              <Section num="13" title="Governing Law &amp; Dispute Resolution">
                <Clause>
                  This Agreement shall be governed by and construed in accordance with the laws of
                  <strong> the Republic of India</strong>, without regard to its conflict of law provisions.
                </Clause>
                <Clause>
                  Any dispute arising out of or relating to this Agreement shall first be subject to
                  good-faith negotiation between the parties for a period of 30 days. If unresolved,
                  the dispute shall be submitted to binding arbitration under the Arbitration and
                  Conciliation Act, 1996 (as amended), before a sole arbitrator appointed by mutual agreement.
                </Clause>
                <Clause>
                  The seat of arbitration shall be <strong>{JURISDICTION_CITY}</strong>. The language
                  of arbitration shall be English. The award of the arbitrator shall be final and binding.
                </Clause>
              </Section>

              <Section num="14" title="General Provisions">
                <Clause>
                  <strong>Entire Agreement:</strong> This Agreement constitutes the entire agreement
                  between the parties with respect to the Program and supersedes all prior or
                  contemporaneous understandings, negotiations, or agreements, whether written or oral.
                </Clause>
                <Clause>
                  <strong>Severability:</strong> If any provision of this Agreement is held to be
                  invalid or unenforceable, the remaining provisions shall continue in full force and effect.
                </Clause>
                <Clause>
                  <strong>No Waiver:</strong> The failure of the Company to enforce any right or
                  provision of this Agreement shall not constitute a waiver of such right or provision.
                </Clause>
                <Clause>
                  <strong>Independent Contractor:</strong> You are an independent contractor and not
                  an employee, agent, partner, or joint venturer of the Company. Nothing in this
                  Agreement creates any employment, agency, or partnership relationship.
                </Clause>
                <Clause>
                  <strong>Assignment:</strong> You may not assign, transfer, or sublicence your rights
                  or obligations under this Agreement without the prior written consent of the Company.
                </Clause>
                <Clause>
                  <strong>Force Majeure:</strong> Neither party shall be liable for any failure or
                  delay in performance resulting from circumstances beyond its reasonable control,
                  including natural disasters, acts of government, cyberattacks, or internet outages.
                </Clause>
                <Clause>
                  <strong>Contact:</strong> For any queries regarding this Agreement, please contact
                  the Company at <strong>{SUPPORT_EMAIL}</strong>.
                </Clause>
              </Section>

              {/* Digital Signature Block */}
              <div style={{
                marginTop: '32px',
                padding: '20px 24px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
              }}>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '12px',
                }}>
                  Digital Acceptance Record
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px',
                  fontSize: '0.82rem',
                  color: '#475569',
                }}>
                  <div><strong>Creator:</strong> {creatorName || '—'}</div>
                  <div><strong>Email:</strong> {creatorEmail || '—'}</div>
                  <div><strong>Agreement Version:</strong> {CREATOR_TERMS_VERSION}</div>
                  <div><strong>Acceptance Date:</strong> {today}</div>
                </div>
                <p style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  margin: '12px 0 0',
                  lineHeight: 1.5,
                }}>
                  By clicking &ldquo;I Agree &amp; Continue&rdquo;, you are electronically signing this Agreement.
                  Under the Information Technology Act, 2000, your electronic signature carries the same
                  legal weight as a handwritten signature.
                </p>
              </div>

            </div>
          </div>

          {/* Footer Action Bar */}
          <div style={{
            padding: '20px 28px',
            borderTop: '1px solid #e2e8f0',
            background: '#fff',
            flexShrink: 0,
          }}>
            {/* Checkbox */}
            <label
              htmlFor="tc-checkbox"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
                opacity: hasScrolledToBottom ? 1 : 0.5,
                marginBottom: '16px',
              }}
            >
              <input
                id="tc-checkbox"
                type="checkbox"
                checked={checked}
                disabled={!hasScrolledToBottom}
                onChange={(e) => setChecked(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0f172a', cursor: 'inherit', marginTop: '2px', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
                I confirm that I have <strong>read and understood</strong> the {COMPANY_NAME} Creator
                Partner Agreement (Version {CREATOR_TERMS_VERSION}) in its entirety, and I agree to be
                legally bound by all its terms and conditions, including the confidentiality obligations,
                commission terms, and prohibited conduct standards.
              </span>
            </label>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAccept}
                disabled={!canAgree || accepting}
                style={{
                  background: canAgree
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    : '#cbd5e1',
                  color: '#fff',
                  border: 'none',
                  padding: '13px 28px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: canAgree && !accepting ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  boxShadow: canAgree ? '0 4px 16px rgba(15,23,42,0.3)' : 'none',
                  flex: '1 1 auto',
                  justifyContent: 'center',
                  maxWidth: '360px',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>
                  {accepting ? '⏳' : canAgree ? '✅' : '🔒'}
                </span>
                <span>
                  {accepting
                    ? 'Recording Acceptance...'
                    : !hasScrolledToBottom
                      ? 'Scroll to Bottom to Enable'
                      : !checked
                        ? 'Tick Checkbox to Enable'
                        : 'I Agree & Continue to Dashboard'}
                </span>
              </button>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                🔒 Your acceptance is securely recorded in our systems.<br />
                This constitutes a legally binding digital signature under IT Act 2000.
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
