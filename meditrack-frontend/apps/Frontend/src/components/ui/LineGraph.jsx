import { Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend } from 'chart.js/auto'
import { Line } from 'react-chartjs-2'

import React from 'react'

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend,
);

function LineGraph() {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                ticks: {
                    color: "#ccc",
                    padding: 20,
                    font: {
                        size: 16,
                    },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0)',
                    
                },
            },
            y: {
                border: {
                    display: false,
                },
                ticks: {
                    color: "#ccc",
                    stepSize: 500,
                    padding: 20,
                    font: {
                        size: 16,
                    },
                },
                grid: {
                    color: "#444",
                    borderDash: [50, 50],
                },
            },
        },
    };
    const data = {
        labels: [
            "2021",
            "2022",
            "2023",
            "2024",
            "2025",
        ],
        datasets: [
            {
                label: "Revenue",
                data: [ 1000, 2000, 3000, 1000, 2000 ],
                borderColor: "#7c6cff",
                tension: 0.4,
                pointBorderColor: "#7c6cff",
                pointBackgroundColor: "#303030",
                pointRadius: 6,
                borderWidth: 2,
            }
        ]
    };

  return (
    <div className='w-full h-full'>
      <Line options={options} data={data} />
    </div>
  )
}

export default LineGraph
