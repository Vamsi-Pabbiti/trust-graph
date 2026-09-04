import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Actor from '../models/Actor.js';
import Transaction from '../models/Transaction.js';
import GraphEdge from '../models/GraphEdge.js';
import FraudCase from '../models/FraudCase.js';
import Appeal from '../models/Appeal.js';
import AuditEvent from '../models/AuditEvent.js';
import SystemConfiguration from '../models/SystemConfiguration.js';
import { calculateEventHash } from '../utils/hashChain.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trust_graph';

const CITIES = ['Visakhapatnam', 'Hyderabad', 'Vijayawada', 'Bengaluru', 'Chennai', 'Mumbai', 'Delhi', 'Kolkata', 'Pune', 'Jaipur'];
const FIRST_NAMES = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Kiran', 'Suresh', 'Deepika', 'Vikram', 'Lakshmi', 'Rahul', 'Sneha', 'Aditya', 'Meera', 'Rajesh', 'Pooja', 'Karthik', 'Divya', 'Sanjay', 'Bhavana', 'Vamsi'];
const LAST_NAMES = ['Reddy', 'Sharma', 'Rao', 'Patel', 'Kumar', 'Verma', 'Nair', 'Singh', 'Chowdary', 'Joshi', 'Gupta', 'Deshmukh', 'Chatterjee', 'Iyer', 'Bhatt', 'Gowda'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedDatabase() {
  console.log('[Seed] Starting database seed...');
  await mongoose.connect(MONGODB_URI);

  // Clear existing collections
  await User.deleteMany({});
  await Actor.deleteMany({});
  await Transaction.deleteMany({});
  await GraphEdge.deleteMany({});
  await FraudCase.deleteMany({});
  await Appeal.deleteMany({});
  await AuditEvent.deleteMany({});
  await SystemConfiguration.deleteMany({});

  console.log('[Seed] Cleared existing data.');

  // 1. Seed System Configuration
  await SystemConfiguration.create({
    lowRiskThreshold: 25,
    mediumRiskThreshold: 50,
    highRiskThreshold: 75,
    criticalRiskThreshold: 90,
    hardActionPrecisionThreshold: 95.0,
    appealSlaHours: 48,
    actionExpiryHours: 72,
    scoringWeights: {
      refundCount30Days: 18,
      chargebackCount: 18,
      sellerRatingBurst: 17,
      gpsDeviationKm: 20,
      proofOfDeliveryMismatch: 22,
      nightOrder: 6,
      highValue: 8,
      youngAccount: 8
    },
    updatedBy: 'seed_script'
  });

  // 2. Seed Users
  const adminPassHash = await bcrypt.hash('Admin@123', 10);
  const invPassHash = await bcrypt.hash('Investigator@123', 10);

  await User.create([
    {
      name: 'System Admin',
      email: 'admin@trustgraph.demo',
      passwordHash: adminPassHash,
      role: 'admin',
      active: true
    },
    {
      name: 'Lead Fraud Investigator',
      email: 'investigator@trustgraph.demo',
      passwordHash: invPassHash,
      role: 'investigator',
      active: true
    }
  ]);
  console.log('[Seed] Demo Users created (admin@trustgraph.demo & investigator@trustgraph.demo).');

  // 3. Seed Actors (105 Customers, 42 Sellers, 22 Delivery Partners)
  const customers = [];
  for (let i = 1; i <= 105; i++) {
    const fn = getRandomItem(FIRST_NAMES);
    const ln = getRandomItem(LAST_NAMES);
    const actorId = `CUST-${String(i).padStart(3, '0')}`;
    customers.push({
      actorId,
      name: `${fn} ${ln}`,
      type: 'customer',
      city: getRandomItem(CITIES),
      state: 'Andhra Pradesh / Telangana / India',
      cohort: i <= 20 ? 'high_velocity_buyer' : 'standard_buyer',
      tenureMonths: getRandomInt(1, 36),
      businessSize: 'individual',
      riskStatus: i <= 15 ? (i <= 5 ? 'critical' : 'high') : 'low',
      actionStatus: i <= 5 ? 'restricted' : 'active',
      maskedEmail: `${fn.toLowerCase()}.${ln.toLowerCase()}***@gmail.com`,
      maskedPhone: `+91 98****${String(1000 + i).slice(-4)}`
    });
  }

  const sellers = [];
  for (let i = 1; i <= 42; i++) {
    const actorId = `SELL-${String(i).padStart(3, '0')}`;
    const isSmall = i <= 30;
    sellers.push({
      actorId,
      name: `${getRandomItem(CITIES)} Retailers Hub #${i}`,
      type: 'seller',
      city: getRandomItem(CITIES),
      state: 'India',
      cohort: isSmall ? (i <= 10 ? 'new_seller' : 'small_seller') : 'large_seller',
      tenureMonths: isSmall ? getRandomInt(1, 12) : getRandomInt(18, 60),
      businessSize: isSmall ? (i % 2 === 0 ? 'micro' : 'small') : 'enterprise',
      riskStatus: i <= 8 ? (i <= 3 ? 'critical' : 'high') : 'low',
      actionStatus: i <= 3 ? 'payout_hold' : 'active',
      maskedEmail: `contact***@seller${i}.in`,
      maskedPhone: `+91 97****${String(2000 + i).slice(-4)}`
    });
  }

  const deliveryPartners = [];
  for (let i = 1; i <= 22; i++) {
    const fn = getRandomItem(FIRST_NAMES);
    const ln = getRandomItem(LAST_NAMES);
    const actorId = `DP-${String(i).padStart(3, '0')}`;
    deliveryPartners.push({
      actorId,
      name: `${fn} ${ln} (Express Logistics)`,
      type: 'delivery_partner',
      city: getRandomItem(CITIES),
      state: 'India',
      cohort: i <= 8 ? 'tier_2_delivery' : 'tier_1_delivery',
      tenureMonths: getRandomInt(2, 24),
      businessSize: 'individual',
      riskStatus: i <= 4 ? 'high' : 'low',
      actionStatus: 'active',
      maskedEmail: `dp.${fn.toLowerCase()}***@logistics.in`,
      maskedPhone: `+91 96****${String(3000 + i).slice(-4)}`
    });
  }

  await Actor.insertMany([...customers, ...sellers, ...deliveryPartners]);
  console.log(`[Seed] ${customers.length} Customers, ${sellers.length} Sellers, ${deliveryPartners.length} Delivery Partners seeded.`);

  // 4. Seed Transactions & Graph Edges (520 Transactions)
  const transactions = [];
  const edgesMap = new Map();

  const addOrUpdateEdge = (sourceNodeId, targetNodeId, edgeType, evidence = '') => {
    const key = `${sourceNodeId}:${targetNodeId}:${edgeType}`;
    if (edgesMap.has(key)) {
      const existing = edgesMap.get(key);
      existing.strength += 1;
    } else {
      edgesMap.set(key, {
        sourceNodeId,
        targetNodeId,
        edgeType,
        strength: 1,
        evidence
      });
    }
  };

  // Specific Fraud Ring Scenario Devices & IPs
  const VIZAG_SHARED_DEV = 'DEV-VIZAG-RING-99';
  const HYD_SHARED_IP = 'IP-HYD-BURST-102';
  const FAMILY_SHARED_ADDR = 'ADDR-FAMILY-HYD-500001';

  for (let i = 1; i <= 520; i++) {
    const txId = `TX-${String(i).padStart(4, '0')}`;
    const cust = getRandomItem(customers);
    const sell = getRandomItem(sellers);
    const dp = getRandomItem(deliveryPartners);
    const city = cust.city;

    // Inject Fraud Ring Scenarios
    let isRefundAbuse = (i <= 25 && cust.actorId === 'CUST-001');
    let isSellerSelfOrder = (i > 25 && i <= 50 && sell.actorId === 'SELL-001');
    let isDeliveryGpsFraud = (i > 50 && i <= 70 && dp.actorId === 'DP-001');
    let isLegitimateEdgeCase = (i > 70 && i <= 90); // Shared address / family

    let deviceId = isRefundAbuse ? VIZAG_SHARED_DEV : `DEV-${city.slice(0, 3).toUpperCase()}-${getRandomInt(100, 999)}`;
    let ipAddress = isSellerSelfOrder ? HYD_SHARED_IP : `IP-${getRandomInt(10, 192)}.${getRandomInt(1, 255)}.${getRandomInt(1, 255)}`;
    let addressHash = isLegitimateEdgeCase ? FAMILY_SHARED_ADDR : `ADDR-${city.slice(0, 3).toUpperCase()}-${getRandomInt(1000, 9999)}`;

    let refundCount30Days = isRefundAbuse ? getRandomInt(4, 7) : (getRandomInt(1, 10) === 10 ? 2 : 0);
    let chargebackCount = isRefundAbuse ? 2 : 0;
    let sellerRatingBurst = isSellerSelfOrder ? getRandomInt(9, 15) : 0;
    let gpsDeviationKm = isDeliveryGpsFraud ? getRandomInt(6, 12) : (getRandomInt(1, 20) === 20 ? 3.2 : 0.4);
    let proofOfDeliveryMismatch = isDeliveryGpsFraud || (getRandomInt(1, 50) === 50);

    let amount = isSellerSelfOrder ? getRandomInt(25000, 45000) : getRandomInt(499, 15000);
    let accountAgeDays = isRefundAbuse ? 3 : getRandomInt(15, 365);

    // Calculate signals
    let txScore = 0;
    const triggered = [];

    if (refundCount30Days >= 3) { txScore += 18; triggered.push({ code: 'REFUND_VELOCITY_HIGH', name: 'High Refund Velocity', weight: 18, evidence: `${refundCount30Days} refunds in 30 days` }); }
    if (chargebackCount >= 2) { txScore += 18; triggered.push({ code: 'CHARGEBACK_REPEAT', name: 'Repeated Chargebacks', weight: 18, evidence: `${chargebackCount} chargebacks` }); }
    if (sellerRatingBurst >= 8) { txScore += 17; triggered.push({ code: 'RATING_BURST_ABNORMAL', name: 'Abnormal Rating Burst', weight: 17, evidence: `${sellerRatingBurst} ratings in 2h` }); }
    if (gpsDeviationKm >= 5.0) { txScore += 20; triggered.push({ code: 'GPS_DEVIATION_HIGH', name: 'Significant GPS Mismatch', weight: 20, evidence: `${gpsDeviationKm} km mismatch` }); }
    if (proofOfDeliveryMismatch) { txScore += 22; triggered.push({ code: 'POD_MISMATCH', name: 'Proof Mismatch', weight: 22, evidence: 'Delivery photo mismatch' }); }
    if (amount > 20000) { txScore += 8; triggered.push({ code: 'HIGH_VALUE_ORDER', name: 'High Value', weight: 8, evidence: `Amount ₹${amount}` }); }
    if (accountAgeDays < 7) { txScore += 8; triggered.push({ code: 'YOUNG_ACCOUNT', name: 'New Account', weight: 8, evidence: `Account age ${accountAgeDays} days` }); }

    let normTxScore = Math.min(100, txScore);
    let normGraphScore = isRefundAbuse || isSellerSelfOrder ? getRandomInt(75, 95) : (isDeliveryGpsFraud ? getRandomInt(55, 75) : getRandomInt(5, 30));
    let combined = Math.min(100, Math.round((0.65 * normTxScore + 0.35 * normGraphScore) * 10) / 10);

    let riskLevel = combined >= 75 ? 'critical' : (combined >= 50 ? 'high' : (combined >= 25 ? 'medium' : 'low'));
    let historicalLabel = (isRefundAbuse || isSellerSelfOrder || isDeliveryGpsFraud) ? 'fraud' : (isLegitimateEdgeCase ? 'legitimate' : 'unknown');

    transactions.push({
      transactionId: txId,
      orderId: `ORD-${100000 + i}`,
      customerId: cust.actorId,
      sellerId: sell.actorId,
      deliveryPartnerId: dp.actorId,
      amount,
      paymentMethod: getRandomItem(['UPI', 'Credit Card', 'Debit Card', 'NetBanking', 'COD']),
      city,
      orderTime: new Date(Date.now() - getRandomInt(0, 14) * 24 * 60 * 60 * 1000),
      deviceId,
      ipAddress,
      addressHash,
      refundCount30Days,
      chargebackCount,
      sellerRatingBurst,
      gpsDeviationKm,
      proofOfDeliveryMismatch,
      accountAgeDays,
      historicalLabel,
      transactionRiskScore: normTxScore,
      graphRiskScore: normGraphScore,
      combinedRiskScore: combined,
      riskLevel,
      triggeredSignals: triggered
    });

    // Build Graph Edges
    addOrUpdateEdge(cust.actorId, txId, 'placed_order');
    addOrUpdateEdge(sell.actorId, txId, 'sold_item');
    addOrUpdateEdge(dp.actorId, txId, 'delivered_order');
    addOrUpdateEdge(cust.actorId, deviceId, 'used_device');
    addOrUpdateEdge(cust.actorId, ipAddress, 'used_ip');
    addOrUpdateEdge(cust.actorId, addressHash, 'used_address');
    if (isRefundAbuse || isSellerSelfOrder) {
      addOrUpdateEdge(cust.actorId, sell.actorId, 'shared_suspicious_signal', 'Repeated high velocity ring order');
    }
  }

  await Transaction.insertMany(transactions);
  await GraphEdge.insertMany(Array.from(edgesMap.values()));
  console.log(`[Seed] ${transactions.length} Transactions and ${edgesMap.size} Graph Edges seeded.`);

  // 5. Seed Fraud Cases (32 Cases)
  const fraudCases = [];
  for (let i = 1; i <= 32; i++) {
    const caseId = `CASE-${String(i).padStart(3, '0')}`;
    const highRiskTx = transactions.filter(t => t.riskLevel === 'critical' || t.riskLevel === 'high')[i % 20] || transactions[i];
    const isCritical = highRiskTx.riskLevel === 'critical';
    
    let recAction = isCritical ? 'payout_freeze' : 'temporary_payout_hold';
    let status = i <= 10 ? 'open' : (i <= 20 ? 'in_review' : (i <= 25 ? 'action_taken' : 'appealed'));

    fraudCases.push({
      caseId,
      transactionIds: [highRiskTx.transactionId],
      actorIds: [highRiskTx.customerId, highRiskTx.sellerId, highRiskTx.deliveryPartnerId],
      combinedRiskScore: highRiskTx.combinedRiskScore,
      graphRiskScore: highRiskTx.graphRiskScore,
      riskLevel: highRiskTx.riskLevel,
      evidence: highRiskTx.triggeredSignals.map(s => ({
        signal: s.code,
        description: s.evidence,
        weight: s.weight,
        category: 'transaction'
      })),
      explanation: `[${highRiskTx.riskLevel.toUpperCase()} RISK - ${highRiskTx.combinedRiskScore}/100] Multi-actor graph cluster flagged due to shared device/IP nodes and elevated refund velocity.`,
      recommendedAction: recAction,
      currentAction: status === 'action_taken' ? 'payout_held' : 'none',
      status,
      assignedInvestigator: status !== 'open' ? 'investigator@trustgraph.demo' : null,
      precisionGate: {
        measuredPrecision: 96.2,
        requiredPrecision: 95.0,
        passed: true,
        automatedHardActionBlocked: false,
        blockingReason: ''
      },
      livelihoodGuardrail: {
        isTemporary: true,
        expiryHours: 72,
        appealEnabled: true,
        humanReviewed: status === 'action_taken'
      }
    });
  }

  await FraudCase.insertMany(fraudCases);
  console.log(`[Seed] ${fraudCases.length} Fraud Cases seeded.`);

  // 6. Seed Appeals (12 Appeals)
  const appeals = [];
  for (let i = 1; i <= 12; i++) {
    const fc = fraudCases[i + 15];
    const appealId = `APL-${String(i).padStart(3, '0')}`;
    const status = i <= 4 ? 'submitted' : (i <= 7 ? 'under_review' : (i <= 10 ? 'accepted' : 'rejected'));

    appeals.push({
      appealId,
      caseId: fc.caseId,
      actorId: fc.actorIds[1] || 'SELL-001',
      reason: `Our business experienced a genuine seasonal sale surge during festival season in Visakhapatnam. The shared Wi-Fi IP is from our co-working space. We request payout hold removal.`,
      supportingEvidence: [
        { docType: 'GSTIN Registration', url: 'https://trustgraph.demo/docs/gstin_cert.pdf', notes: 'Verified Business GSTIN' },
        { docType: 'Proof of Delivery Receipts', url: 'https://trustgraph.demo/docs/pod_receipts.pdf', notes: 'Signed customer delivery challans' }
      ],
      status,
      priority: 'high',
      submittedAt: new Date(Date.now() - (12 - i) * 3600 * 1000),
      dueAt: new Date(Date.now() + 36 * 3600 * 1000),
      reviewedBy: status !== 'submitted' ? 'investigator@trustgraph.demo' : null,
      reviewerNote: status === 'accepted' ? 'Verified GSTIN and physical store invoice. Shared IP confirmed as co-working hub.' : '',
      reviewedAt: status !== 'submitted' ? new Date() : null
    });
  }

  await Appeal.insertMany(appeals);
  console.log(`[Seed] ${appeals.length} Appeals seeded.`);

  // 7. Seed Audit Events with SHA-256 Hash Chain!
  const auditEvents = [];
  let prevHash = 'GENESIS_HASH';

  const auditActions = [
    { caseId: 'CASE-001', actorId: 'CUST-001', action: 'CASE_CREATED', reason: 'High-risk refund abuse cluster detected' },
    { caseId: 'CASE-001', actorId: 'CUST-001', action: 'INVESTIGATOR_ASSIGNED', reason: 'Assigned to investigator@trustgraph.demo' },
    { caseId: 'CASE-002', actorId: 'SELL-001', action: 'CASE_CREATED', reason: 'Rating burst self-ordering detected' },
    { caseId: 'CASE-002', actorId: 'SELL-001', action: 'ACTION_APPLIED_PAYOUT_HOLD', reason: 'Temporary 72h payout hold applied pending GSTIN review' },
    { caseId: 'CASE-016', actorId: 'SELL-016', action: 'APPEAL_SUBMITTED', reason: 'Actor submitted GSTIN and delivery challans' },
    { caseId: 'CASE-016', actorId: 'SELL-016', action: 'APPEAL_RESOLVED_ACCEPT', reason: 'Appeal accepted; payout hold released and case marked legitimate' }
  ];

  for (let i = 0; i < auditActions.length; i++) {
    const item = auditActions[i];
    const eventId = `EVT-${String(i + 1).padStart(4, '0')}`;
    const timestamp = new Date(Date.now() - (auditActions.length - i) * 7200 * 1000);
    const actionStr = `${item.action}_${item.caseId}`;
    
    const currentHash = calculateEventHash(eventId, item.caseId, actionStr, timestamp, prevHash);

    auditEvents.push({
      eventId,
      caseId: item.caseId,
      actorId: item.actorId,
      action: item.action,
      reason: item.reason,
      performedBy: 'investigator@trustgraph.demo',
      previousHash: prevHash,
      currentHash,
      timestamp
    });

    prevHash = currentHash;
  }

  await AuditEvent.insertMany(auditEvents);
  console.log(`[Seed] ${auditEvents.length} SHA-256 Hash-Chained Audit Events seeded.`);

  console.log('[Seed] Database seeding completed successfully!');
  await mongoose.disconnect();
}

// Execute if run directly
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  seedDatabase().catch(err => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}
