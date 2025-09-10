document.addEventListener('DOMContentLoaded', function () {

    const userProfiles = {
        sedentario: {
            reposo: [70, 85],
            caminar: [95, 115],
            correr: [140, 160],
            dormir: [60, 75]
        },
        activo: {
            reposo: [60, 75],
            caminar: [90, 110],
            correr: [150, 175],
            dormir: [50, 65]
        },
        atleta: {
            reposo: [45, 60],
            caminar: [80, 100],
            correr: [160, 185],
            dormir: [40, 55]
        }
    };

    let currentProfile = 'sedentario';
    let currentState = 'reposo';
    let currentBPM = 75;
    let isAutoMode = false;

    const SIMULATION_INTERVAL = 5000;
    const MAX_CHART_POINTS = 20;

    function getRandomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updateHeartRate() {
        const profileRanges = userProfiles[currentProfile];
        const targetRange = profileRanges[currentState];

        if (currentState === 'reposo') {
            const prob = Math.random();
            if (prob < 0.5) {
                // 50% mantener igual
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
        console.log(`[${timestamp}] Perfil: ${currentProfile}, Estado: ${currentState}, BPM: ${currentBPM}`);
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

    const chart = Highcharts.chart('chart-container', {
        title: { text: 'Simulación de Ritmo Cardíaco (BPM)' },
        xAxis: {
            type: 'datetime',
            title: { text: 'Tiempo' }
        },
        yAxis: {
            title: { text: 'Pulsaciones por Minuto (BPM)' },
            min: 30
        },
        series: [{
            name: 'Ritmo Cardíaco',
            data: [],
            tooltip: { valueSuffix: ' BPM' }
        }],
        credits: { enabled: false }
    });

    function updateChart(bpm) {
        const series = chart.series[0];
        const shift = series.data.length >= MAX_CHART_POINTS;
        series.addPoint({ x: new Date().getTime(), y: bpm }, true, shift);
    }

    document.getElementById('profile-select').addEventListener('change', (e) => {
        currentProfile = e.target.value;
        currentState = 'reposo';
        currentBPM = userProfiles[currentProfile].reposo[0];
        console.log(`--- Perfil cambiado a: ${currentProfile} ---`);
    });

    document.getElementById('btn-reposo').addEventListener('click', () => { currentState = 'reposo'; console.log('EVENTO: Reposo'); });
    document.getElementById('btn-caminar').addEventListener('click', () => { currentState = 'caminar'; console.log('EVENTO: Inicia Caminata'); });
    document.getElementById('btn-correr').addEventListener('click', () => { currentState = 'correr'; console.log('EVENTO: Inicia Carrera'); });
    document.getElementById('btn-dormir').addEventListener('click', () => { currentState = 'dormir'; console.log('EVENTO: A dormir'); });

    document.getElementById('auto-mode-toggle').addEventListener('change', (e) => {
        isAutoMode = e.target.checked;
        const manualButtons = document.querySelectorAll('#controls button, #profile-select');
        if (isAutoMode) {
            console.log("--- MODO AUTOMÁTICO ACTIVADO ---");
            manualButtons.forEach(el => el.disabled = true);
        } else {
            console.log("--- MODO MANUAL ACTIVADO ---");
            manualButtons.forEach(el => el.disabled = false);
        }
    });

    setInterval(() => {
        if (isAutoMode) {
            setAutomaticState();
            checkForRandomEvents();
        }
        updateHeartRate();
    }, SIMULATION_INTERVAL);
});
