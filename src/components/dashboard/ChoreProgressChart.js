import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChoreProgressChart = () => {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed Chores',
        data: [5, 8, 6, 9, 7, 4, 6],
        fill: true,
        borderColor: '#00ff9f',
        backgroundColor: 'rgba(0, 255, 159, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#00ff9f'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(26,26,26,0.95)',
        titleColor: '#fff',
        bodyColor: '#00ff9f',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255,255,255,0.1)'
        },
        ticks: {
          color: '#888'
        }
      },
      x: {
        grid: {
          color: 'rgba(255,255,255,0.1)'
        },
        ticks: {
          color: '#888'
        }
      }
    }
  };

  return (
    <div className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Weekly Progress</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default ChoreProgressChart; 