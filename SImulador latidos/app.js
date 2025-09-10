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
    let isAutoMode = false;

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

    function setAutomaticState() {
        const hour = new Date().getHours();
        let newState = null;

        if (hour >= 22 || hour < 6) newState = 'dormir';
        else if (hour >= 6 && hour < 7) newState = 'reposo';
        else if (hour === 7 && new Date().getMinutes() < 30) newState = 'caminar';
        else if (hour >= 19 && hour < 20) newState = 'correr';
        else newState = 'reposo';

        if (newState !== currentState) {
            currentState = newState;
            console.log(`%cAUTO: El estado ha cambiado a -> ${currentState.toUpperCase()}`, "color: blue; font-weight: bold;");
        }
    }

    function checkForRandomEvents() {
        if (currentState !== 'dormir') return;
        if (Math.random() < 0.008) {
            console.warn('!!! EXCEPCIÓN: Ruido fuerte mientras duerme !!!');
            const spikeBPM = currentBPM + getRandomInRange(30, 50);
            currentBPM = spikeBPM;
            updateChart(currentBPM);
            setTimeout(() => {
                console.warn('--- Fin de la excepción, ritmo volviendo a la normalidad ---');
            }, 10000);
        }
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
    document.getElementById('btn-reposo').addEventListener('click', () => { currentState = 'reposo'; console.log('EVENTO: Reposo'); });
    document.getElementById('btn-caminar').addEventListener('click', () => { currentState = 'caminar'; console.log('EVENTO: Inicia Caminata'); });
    document.getElementById('btn-correr').addEventListener('click', () => { currentState = 'correr'; console.log('EVENTO: Inicia Carrera'); });
    document.getElementById('btn-dormir').addEventListener('click', () => { currentState = 'dormir'; console.log('EVENTO: A dormir'); });

    // === Modo automático ===
    document.getElementById('auto-mode-toggle').addEventListener('change', (e) => {
        isAutoMode = e.target.checked;
        const manualButtons = document.querySelectorAll('#controls button');
        if (isAutoMode) {
            console.log("--- MODO AUTOMÁTICO ACTIVADO ---");
            manualButtons.forEach(el => el.disabled = true);
        } else {
            console.log("--- MODO MANUAL ACTIVADO ---");
            manualButtons.forEach(el => el.disabled = false);
        }
    });

    // Intervalo de simulación
    setInterval(() => {
        if (isAutoMode) {
            setAutomaticState();
            checkForRandomEvents();
        }
        updateHeartRate();
    }, SIMULATION_INTERVAL);
});