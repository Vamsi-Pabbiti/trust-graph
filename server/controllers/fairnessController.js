import Actor from '../models/Actor.js';
import FraudCase from '../models/FraudCase.js';
import Appeal from '../models/Appeal.js';
import { calculateFairnessMetrics } from '../services/agents/fairnessAgent.js';

export async function getFairnessSummary(req, res, next) {
  try {
    const actors = await Actor.find();
    const cases = await FraudCase.find();

    const fairness = calculateFairnessMetrics(actors, cases);

    res.json({
      success: true,
      ...fairness
    });
  } catch (err) {
    next(err);
  }
}

export async function getCohortFairness(req, res, next) {
  try {
    const actors = await Actor.find();
    const cases = await FraudCase.find();
    const fairness = calculateFairnessMetrics(actors, cases);
    res.json({ success: true, cohorts: fairness.cohorts, parityGap: fairness.parityGap });
  } catch (err) {
    next(err);
  }
}

export async function getAppealsFairness(req, res, next) {
  try {
    const totalAppeals = await Appeal.countDocuments();
    const accepted = await Appeal.countDocuments({ status: 'accepted' });
    const rejected = await Appeal.countDocuments({ status: 'rejected' });
    const pending = await Appeal.countDocuments({ status: { $in: ['submitted', 'under_review', 'more_info_requested'] } });

    res.json({
      success: true,
      appealFairnessStats: {
        totalAppeals,
        acceptedCount: accepted,
        rejectedCount: rejected,
        pendingCount: pending,
        overallOverturnRatePct: totalAppeals > 0 ? Math.round((accepted / totalAppeals) * 1000) / 10 : 0
      }
    });
  } catch (err) {
    next(err);
  }
}
