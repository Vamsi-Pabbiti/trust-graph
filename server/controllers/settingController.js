import SystemConfiguration from '../models/SystemConfiguration.js';

export async function getSettings(req, res, next) {
  try {
    let config = await SystemConfiguration.findOne();
    if (!config) {
      config = await SystemConfiguration.create({});
    }
    res.json({ success: true, settings: config });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const updateData = req.body;
    let config = await SystemConfiguration.findOne();
    if (!config) {
      config = new SystemConfiguration({});
    }

    if (updateData.lowRiskThreshold !== undefined) config.lowRiskThreshold = updateData.lowRiskThreshold;
    if (updateData.mediumRiskThreshold !== undefined) config.mediumRiskThreshold = updateData.mediumRiskThreshold;
    if (updateData.highRiskThreshold !== undefined) config.highRiskThreshold = updateData.highRiskThreshold;
    if (updateData.criticalRiskThreshold !== undefined) config.criticalRiskThreshold = updateData.criticalRiskThreshold;
    if (updateData.hardActionPrecisionThreshold !== undefined) config.hardActionPrecisionThreshold = updateData.hardActionPrecisionThreshold;
    if (updateData.appealSlaHours !== undefined) config.appealSlaHours = updateData.appealSlaHours;
    if (updateData.actionExpiryHours !== undefined) config.actionExpiryHours = updateData.actionExpiryHours;
    if (updateData.scoringWeights) {
      config.scoringWeights = { ...config.scoringWeights, ...updateData.scoringWeights };
    }

    config.updatedBy = req.user.email;
    await config.save();

    res.json({ success: true, settings: config, message: 'Settings updated successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function resetSettings(req, res, next) {
  try {
    await SystemConfiguration.deleteMany({});
    const defaultConfig = await SystemConfiguration.create({
      lowRiskThreshold: 25,
      mediumRiskThreshold: 50,
      highRiskThreshold: 75,
      criticalRiskThreshold: 90,
      hardActionPrecisionThreshold: 95.0,
      appealSlaHours: 48,
      actionExpiryHours: 72,
      updatedBy: req.user.email
    });

    res.json({ success: true, settings: defaultConfig, message: 'System configuration reset to factory defaults.' });
  } catch (err) {
    next(err);
  }
}
