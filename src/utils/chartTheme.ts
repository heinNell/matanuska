// src/utils/chartTheme.ts
export const chartTheme = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    foreColor: '#4B5563', // Tailwind gray-600
  },
  colors: [
    '#0ea5e9', // primary-500
    '#38bdf8', // primary-400
    '#facc15', // yellow-400
    '#22c55e', // green-500
    '#ef4444', // red-500
    '#6366f1', // indigo-500
  ],
  grid: { borderColor: '#E5E7EB' }, // gray-200
  dataLabels: { style: { fontSize: '12px', fontWeight: 'bold' } },
  legend: { labels: { colors: '#4B5563' } },
};
