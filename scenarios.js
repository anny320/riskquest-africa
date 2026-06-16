async function loadScenarioData() {
  const res = await fetch('data/scenarios.json');
  if (!res.ok) throw new Error('Failed to load scenario data');
  return res.json();
}

window.ScenarioData = { loadScenarioData };
