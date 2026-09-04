import crypto from 'crypto';

/**
 * Calculates SHA-256 hash for an audit event: SHA256(eventId + caseId + action + timestamp + previousHash)
 */
export function calculateEventHash(eventId, caseId, action, timestamp, previousHash) {
  const data = `${eventId}:${caseId || ''}:${action}:${new Date(timestamp).toISOString()}:${previousHash}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verifies an entire array of audit events for tamper detection
 * @param {Array} events - Sorted chronologically ascending
 * @returns {Object} { isValid: boolean, brokenIndex: number|null, brokenEvent: Object|null, reason: string|null }
 */
export function verifyAuditChain(events) {
  if (!events || events.length === 0) {
    return { isValid: true, brokenIndex: null, brokenEvent: null, reason: 'Empty chain' };
  }

  let prevHash = 'GENESIS_HASH';

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    
    // Check previous hash link
    if (ev.previousHash !== prevHash) {
      return {
        isValid: false,
        brokenIndex: i,
        brokenEvent: ev,
        reason: `Previous hash mismatch at index ${i}. Expected ${prevHash}, got ${ev.previousHash}`
      };
    }

    // Recompute current hash
    const expectedHash = calculateEventHash(ev.eventId, ev.caseId, ev.action, ev.timestamp, ev.previousHash);
    if (ev.currentHash !== expectedHash) {
      return {
        isValid: false,
        brokenIndex: i,
        brokenEvent: ev,
        reason: `Current hash mismatch at index ${i}. Expected ${expectedHash}, recorded ${ev.currentHash}`
      };
    }

    prevHash = ev.currentHash;
  }

  return { isValid: true, brokenIndex: null, brokenEvent: null, reason: 'All hashes valid and linked' };
}
