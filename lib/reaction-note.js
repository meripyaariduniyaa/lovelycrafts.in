/** Return only JSON-safe fields required by the reaction client. */
export function toReactionClientNote(id, note = {}) {
  return {
    id: typeof id === 'string' ? id : '',
    recipient_name: typeof note.recipient_name === 'string' ? note.recipient_name : '',
    sender_name: typeof note.custom_details?.sender_name === 'string' ? note.custom_details.sender_name : '',
    template: typeof note.template === 'string' ? note.template : 'proposal',
    custom_slug: typeof note.custom_slug === 'string' ? note.custom_slug : null,
    // The UI needs presence only; stored reaction data may include Firestore values.
    recipient_reaction: Boolean(note.recipient_reaction),
  };
}
