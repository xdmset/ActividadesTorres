document.addEventListener('DOMContentLoaded', function () {

    // --- RANGOS SEGÚN EL ESTADO ---
    const stateRanges = {
        reposo: [65, 80],
        caminar: [95, 115],
        correr: [140, 170],
        dormir: [55, 70]
    };

    let currentState = 'reposo';
    let currentBPM = 75;

    const SIMULATION_INTERVAL = 5000;
    const MAX_CHART_POINTS = 20;

    function getRandomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updateHeartRate() {
        const targetRange = stateRanges[currentState];

        if (currentState === 'reposo') {
            const prob = Math.random();
            if (prob < 0.5) {
                // Mantener igual
            } else if (prob < 0.75) {
                currentBPM = Math.max(targetRange[0], currentBPM - getRandomInRange(2, 5));
            } else {
                currentBPM = Math.min(targetRange[1], currentBPM + getRandomInRange(2, 5));
            }
        } else {
            const targetBPM = getRandomInRange(targetRange[0], targetRange[1]);
            const difference = targetBPM - currentBPM;
            const change = (difference * 0.2) + getRandomInRange(-1, 1);
            currentBPM = Math.round(currentBPM + change);
        }

        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Estado: ${currentState}, BPM: ${currentBPM}`);
        updateChart(currentBPM);
    }

    // === Gráfica Highcharts ===
    const chart = Highcharts.chart('chart-container', {
        title: { text: 'Simulación de Ritmo Cardíaco (BPM)' },
        xAxis: { type: 'datetime', title: { text: 'Tiempo' } },
        yAxis: { title: { text: 'Pulsaciones por Minuto (BPM)' }, min: 30 },
        series: [{ name: 'Ritmo Cardíaco', data: [], tooltip: { valueSuffix: ' BPM' } }],
        credits: { enabled: false }
    });

    function updateChart(bpm) {
        const series = chart.series[0];
        const shift = series.data.length >= MAX_CHART_POINTS;
        series.addPoint({ x: new Date().getTime(), y: bpm }, true, shift);
    }

    // === Botones de control ===
    document.getElementById('btn-reposo').addEventListener('click', () => { 
        currentState = 'reposo'; 
        console.log('EVENTO: Reposo'); 
    });

    document.getElementById('btn-caminar').addEventListener('click', () => { 
        currentState = 'caminar'; 
        console.log('EVENTO: Inicia Caminata'); 
    });

    document.getElementById('btn-correr').addEventListener('click', () => { 
        currentState = 'correr'; 
        console.log('EVENTO: Inicia Carrera'); 
    });

    document.getElementById('btn-dormir').addEventListener('click', () => { 
        currentState = 'dormir'; 
        console.log('EVENTO: A dormir'); 
    });

    
    setInterval(() => {
        updateHeartRate();
    }, SIMULATION_INTERVAL);
});