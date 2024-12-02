class StatisticsManager {
    constructor() {
        this.container = document.getElementById('statistics-container');
        this.charts = {};
        this.currentTimeframe = 'week';
        
        this.initialize();
    }

    async initialize() {
        this.setupTimeframeSelector();
        await this.loadStatistics();
        this.setupCharts();
    }

    setupTimeframeSelector() {
        const selector = document.getElementById('timeframe-selector');
        selector.addEventListener('change', (e) => {
            this.currentTimeframe = e.target.value;
            this.loadStatistics();
        });
    }

    async loadStatistics() {
        try {
            const response = await fetch(`/statistics?timeframe=${this.currentTimeframe}`);
            const stats = await response.json();
            this.renderStatistics(stats);
            this.updateCharts(stats);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    renderStatistics(stats) {
        const statsOverview = document.createElement('div');
        statsOverview.className = 'stats-overview';
        
        statsOverview.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-details">
                    <h3>Completed Chores</h3>
                    <p class="stat-value">${stats.completedChores}</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-details">
                    <h3>Points Earned</h3>
                    <p class="stat-value">${stats.pointsEarned}</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-fire"></i>
                </div>
                <div class="stat-details">
                    <h3>Current Streak</h3>
                    <p class="stat-value">${stats.streak} days</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="stat-details">
                    <h3>Achievements</h3>
                    <p class="stat-value">${stats.achievements}</p>
                </div>
            </div>
        `;

        const existingOverview = this.container.querySelector('.stats-overview');
        if (existingOverview) {
            this.container.replaceChild(statsOverview, existingOverview);
        } else {
            this.container.appendChild(statsOverview);
        }
    }

    setupCharts() {
        // Points History Chart
        this.charts.points = new Chart(
            document.getElementById('points-chart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Points Earned',
                        data: [],
                        borderColor: '#4CAF50',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        );

        // Chores Completion Chart
        this.charts.chores = new Chart(
            document.getElementById('chores-chart').getContext('2d'),
            {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Completed Chores',
                        data: [],
                        backgroundColor: '#2196F3'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        );
    }

    updateCharts(stats) {
        // Update Points Chart
        this.charts.points.data.labels = stats.pointsHistory.map(p => 
            moment(p.date).format('MMM D')
        );
        this.charts.points.data.datasets[0].data = stats.pointsHistory.map(p => 
            p.points
        );
        this.charts.points.update();

        // Update Chores Chart
        this.charts.chores.data.labels = stats.choreHistory.map(c => 
            moment(c.date).format('MMM D')
        );
        this.charts.chores.data.datasets[0].data = stats.choreHistory.map(c => 
            c.count
        );
        this.charts.chores.update();
    }
}
