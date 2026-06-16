function renderRadarChart(canvasId, results) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['People', 'Process', 'Technology', 'Data', 'AI Governance'],
      datasets: [{
        label: 'Your Score',
        data: [
          results.pillars.people,
          results.pillars.process,
          results.pillars.technology,
          results.pillars.data,
          results.pillars['ai-governance']
        ],
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: '#2563EB',
        pointBackgroundColor: '#2563EB',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderCategoryChart(canvasId, results) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Cybersecurity', 'Data Protection', 'AI Governance', 'Business Continuity'],
      datasets: [{
        label: 'Score',
        data: [
          results.categories.cybersecurity,
          results.categories.dataProtection,
          results.categories.aiGovernance,
          results.categories.businessContinuity
        ],
        backgroundColor: ['#2563EB', '#06B6D4', '#8B5CF6', '#F97316']
      }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 0, max: 100 } },
      plugins: { legend: { display: false } }
    }
  });
}

window.Charts = { renderRadarChart, renderCategoryChart };
