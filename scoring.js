const CATEGORY_TO_PILLAR = {
  'security-awareness': 'people',
  'fraud-prevention': 'process',
  'process-controls': 'process',
  'endpoint-security': 'technology',
  'data-protection': 'data',
  'ai-governance': 'ai-governance',
  'data-privacy': 'data',
  'business-continuity': 'process',
  'disaster-recovery': 'technology',
  'social-engineering': 'people',
  'fraud-controls': 'process'
};

const PILLARS = ['people', 'process', 'technology', 'data', 'ai-governance'];

function createScoreState() {
  return {
    answers: [],
    pillarScores: { people: [], process: [], technology: [], data: [], 'ai-governance': [] }
  };
}

function recordAnswer(state, scenario, option) {
  state.answers.push({
    scenarioId: scenario.id,
    optionId: option.id,
    score: option.score,
    categories: scenario.categories
  });

  scenario.categories.forEach((cat) => {
    const pillar = CATEGORY_TO_PILLAR[cat];
    if (pillar) state.pillarScores[pillar].push(option.score);
  });
}

function average(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function computeResults(state) {
  const overall = average(state.answers.map((a) => a.score));
  const pillarResults = {};
  PILLARS.forEach((p) => {
    pillarResults[p] = average(state.pillarScores[p]);
  });

  const categoryMap = {
    cybersecurity: ['security-awareness', 'fraud-prevention', 'process-controls', 'endpoint-security', 'social-engineering', 'fraud-controls'],
    dataProtection: ['data-protection', 'data-privacy'],
    aiGovernance: ['ai-governance'],
    businessContinuity: ['business-continuity', 'disaster-recovery'],
  };

  const categoryScores = {};
  Object.entries(categoryMap).forEach(([key, cats]) => {
    const scores = state.answers
      .filter((a) => a.categories.some((c) => cats.includes(c)))
      .map((a) => a.score);
    categoryScores[key] = average(scores);
  });

  return {
    overall,
    riskLevel: getRiskLevel(overall),
    pillars: pillarResults,
    categories: categoryScores
  };
}

function getRiskLevel(score) {
  if (score >= 80) return { label: 'Strong Security Posture', color: '#10B981' };
  if (score >= 50) return { label: 'Medium Risk', color: '#F97316' };
  return { label: 'High Risk', color: '#EF4444' };
}

function earnedBadges(state, badgesConfig) {
  const earned = [];
  badgesConfig.forEach((badge) => {
    const relevant = state.answers.filter((a) => a.categories.includes(badge.category));
    if (relevant.length && average(relevant.map((a) => a.score)) >= 75) {
      earned.push(badge);
    }
  });
  return earned;
}

window.Scoring = { createScoreState, recordAnswer, computeResults, earnedBadges, getRiskLevel };
