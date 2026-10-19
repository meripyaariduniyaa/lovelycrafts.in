'use client';

import React from 'react';
import BirthdayExperience from './birthday/BirthdayExperience';
import ProposalExperience from './proposal/ProposalExperience';
import AnniversaryExperience from './anniversary/AnniversaryExperience';
import ApologyExperience from './apology/ApologyExperience';
import IMissYouExperience from './missyou/IMissYouExperience';

/**
 * 5-Template Experience Dispatcher
 * Templates:
 * - 'proposal'           -> ProposalExperience
 * - 'birthday'           -> BirthdayExperience
 * - 'anniversary'        -> AnniversaryExperience
 * - 'emotional-apology'  -> ApologyExperience
 * - 'i-miss-you'         -> IMissYouExperience
 */
export default function TemplateRenderer({ note, isPreview = false, onReachEnd }) {
  if (!note) return null;

  const templateId = note.template || 'proposal';
  let experience;

  switch (templateId) {
    case 'proposal':
      experience = <ProposalExperience note={note} isPreview={isPreview} onReachEnd={onReachEnd} />;
      break;
    case 'anniversary':
      experience = <AnniversaryExperience note={note} isPreview={isPreview} onReachEnd={onReachEnd} />;
      break;
    case 'emotional-apology':
      experience = <ApologyExperience note={note} isPreview={isPreview} onReachEnd={onReachEnd} />;
      break;
    case 'birthday':
      experience = <BirthdayExperience note={note} isPreview={isPreview} onReachEnd={onReachEnd} />;
      break;
    case 'i-miss-you':
      experience = <IMissYouExperience note={note} isPreview={isPreview} onReachEnd={onReachEnd} />;
      break;
    default:
      experience = <ProposalExperience note={note} isPreview={isPreview} onReachEnd={onReachEnd} />;
  }

  return (
    <div
      className={`experience-wrapper ${isPreview ? 'is-preview-mockup' : ''}`}
      style={{
        width: '100%',
        height: isPreview ? '100%' : 'auto',
        minHeight: isPreview ? '100%' : '100vh',
        position: 'relative',
        overflow: isPreview ? 'hidden' : 'visible',
      }}
    >
      {experience}
    </div>
  );
}
