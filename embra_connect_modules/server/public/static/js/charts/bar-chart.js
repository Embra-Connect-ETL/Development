const BAR_CHART_CONFIG = document.getElementById("stats-chart");

new Chart(BAR_CHART_CONFIG, {
  type: "bar",
  data: {
    labels: ["Archived", "Prev.", "This Month"],
    datasets: [
      {
        axis: "y",
        label: "Models processed",
        data: [100, 500, 1389],
        fill: false,
        borderWidth: 1,
        backgroundColor: [
          "rgba(255, 120, 69, .7)",
          "rgba(255, 182, 122, .9)",
          "rgba(255, 119, 65, .9)",
        ],
        borderColor: [
          "rgb(255, 120, 69)",
          "rgb(255, 182, 122)",
          "rgb(255, 119, 65)",
        ],
        fontColor: "white",
        hoverOffset: 4,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    indexAxis: "y",
    responsive: true,
  },
});
