document.addEventListener('DOMContentLoaded', function () {

    // Objeto principal que contiene los datos de cada perfil
    const profiles = {
        normal: {
            stateRanges: {
                reposo: [65, 80],
                caminar: [95, 115],
                correr: [140, 170],
                dormir: [55, 70],
                desayuno: [75, 90],
                estudiar: [70, 85],
                trabajar: [80, 100],
                escaleras: [120, 150],
                meditacion: [60, 75],
                pesas: [110, 140],
                bicicleta: [100, 130]
            },
            dailyRoutine: [
                { start: 6, end: 7, state: 'correr' },
                { start: 7, end: 8, state: 'desayuno' },
                { start: 8, end: 12, state: 'trabajar' },
                { start: 12, end: 13, state: 'caminar' },
                { start: 13, end: 14, state: 'desayuno' },
                { start: 14, end: 17, state: 'trabajar' },
                { start: 17, end: 18, state: 'pesas' },
                { start: 18, end: 19, state: 'bicicleta' },
                { start: 19, end: 20, state: 'estudiar' },
                { start: 20, end: 21, state: 'meditacion' },
                { start: 21, end: 22, state: 'reposo' },
                { start: 22, end: 24, state: 'dormir' },
                { start: 0, end: 6, state: 'dormir' }
            ]
        },
        atleta: {
            stateRanges: {
                reposo: [50, 65],
                caminar: [90, 110],
                correr: [150, 185],
                dormir: [45, 60],
                desayuno: [65, 80],
                estudiar: [60, 75],
                trabajar: [70, 90],
                escaleras: [130, 160],
                meditacion: [55, 70],
                pesas: [120, 160],
                bicicleta: [110, 145]
            },
            dailyRoutine: [
                { start: 5, end: 7, state: 'correr' },
                { start: 7, end: 8, state: 'desayuno' },
                { start: 8, end: 12, state: 'estudiar' },
                { start: 12, end: 13, state: 'caminar' },
                { start: 13, end: 14, state: 'desayuno' },
                { start: 14, end: 17, state: 'trabajar' },
                { start: 17, end: 19, state: 'pesas' },
                { start: 19, end: 20, state: 'bicicleta' },
                { start: 20, end: 21, state: 'meditacion' },
                { start: 21, end: 22, state: 'reposo' },
                { start: 22, end: 24, state: 'dormir' },
                { start: 0, end: 5, state: 'dormir' }
            ]
        },
        mayor: {
            stateRanges: {
                reposo: [70, 85],
                caminar: [90, 105],
                correr: [90, 105],
                dormir: [60, 75],
                desayuno: [80, 95],
                estudiar: [75, 90],
                trabajar: [80, 95],
                escaleras: [100, 120],
                meditacion: [65, 80],
                pesas: [85, 100],
                bicicleta: [90, 110]
            },
            dailyRoutine: [
                { start: 7, end: 8, state: 'desayuno' },
                { start: 8, end: 10, state: 'caminar' },
                { start: 10, end: 12, state: 'reposo' },
                { start: 12, end: 13, state: 'desayuno' },
                { start: 13, end: 15, state: 'dormir' },
                { start: 15, end: 16, state: 'estudiar' },
                { start: 16, end: 17, state: 'caminar' },
                { start: 17, end: 20, state: 'reposo' },
                { start: 20, end: 21, state: 'meditacion' },
                { start: 21, end: 24, state: 'dormir' },
                { start: 0, end: 7, state: 'dormir' }
            ]
        }
    };

    // Mapeo de claves a etiquetas para mostrar en la UI
    const labelMap = {
        reposo: 'Reposo',
        caminar: 'Caminando',
        correr: 'Corriendo',
        dormir: 'Durmiendo',
        desayuno: 'Desayunando / Comida',
        estudiar: 'Estudiando / Leyendo',
        trabajar: 'Trabajando',
        escaleras: 'Subiendo escaleras',
        meditacion: 'Meditando',
        pesas: 'Ejercicio de fuerza',
        bicicleta: 'Andando en bicicleta'
    };

    // Mapeo de claves de perfil a IDs de la base de datos
    const profileIdMap = {
        normal: 1,
        atleta: 2,
        mayor: 3
    };

    // Variables de estado de la simulación
    let currentProfileKey = 'normal'; // Perfil por defecto
    let currentState = 'reposo';
    let currentBPM = 75;

    // Constantes de configuración
    const SIMULATION_INTERVAL = 3000; // Cada 3 segundos
    const MAX_CHART_POINTS = 20;

    // Referencias a elementos del DOM
    const profileSelect = document.getElementById('profile-select');
    const manualToggle = document.getElementById('manual-toggle');
    const manualTimeInput = document.getElementById('manual-time');
    const btnSetManual = document.getElementById('btn-set-manual');
    const btnVerRutina = document.getElementById('btn-ver-rutina');
    const routineDisplay = document.getElementById('routine-display');

    let manualDate = null;
    let manualModeActive = false;


    // Función para enviar datos al backend de Node.js
    async function sendDataToDatabase(bpm, activity, profileKey) {
        const profileId = profileIdMap[profileKey];
        if (!profileId) {
            console.error("ID de perfil no encontrado para la clave:", profileKey);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/save_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profile_id: profileId,
                    bpm: bpm,
                    activity: activity
                }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log("Dato guardado:", result.message);
            } else {
                console.error("Error al guardar el dato:", result.message);
            }
        } catch (error) {
            console.error('Error en la petición fetch:', error);
        }
    }

    function getRandomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updateActivityDisplay() {
        const display = labelMap[currentState] || currentState;
        document.getElementById('current-activity').textContent = display;
    }

    function updateHeartRate() {
        const stateRanges = profiles[currentProfileKey].stateRanges;
        const targetRange = stateRanges[currentState];
        if (!targetRange) return;

        if (['reposo', 'meditacion', 'dormir'].includes(currentState)) {
            const prob = Math.random();
            if (prob < 0.5) {
                // 50% de probabilidad de no cambiar
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

        updateChart(currentBPM);
        
        // Envía el dato a la base de datos cada vez que se actualiza
        sendDataToDatabase(currentBPM, currentState, currentProfileKey);
    }

    function updateRoutine() {
        let now = new Date();

        if (manualModeActive && manualDate) {
            now = manualDate;
            manualDate = new Date(manualDate.getTime() + 1000); // Avanza el tiempo manual
        }

        const dailyRoutine = profiles[currentProfileKey].dailyRoutine;
        const hour = now.getHours();
        const current = dailyRoutine.find(r => hour >= r.start && hour < r.end);
        currentState = current ? current.state : 'dormir';

        updateActivityDisplay();
        document.getElementById('time-display').textContent =
            (manualModeActive ? "Hora manual: " : "Hora actual: ") + now.toLocaleTimeString();
    }
    
    function updateChart(bpm) {
        const series = chart.series[0];
        const shift = series.data.length >= MAX_CHART_POINTS;
        series.addPoint({ x: new Date().getTime(), y: bpm }, true, shift);
    }



    const chart = Highcharts.chart('chart-container', {
        title: { text: 'Simulación de Ritmo Cardíaco (BPM)' },
        xAxis: { type: 'datetime', title: { text: 'Tiempo' } },
        yAxis: { title: { text: 'Pulsaciones por Minuto (BPM)' }, min: 30 },
        series: [{ name: 'Ritmo Cardíaco', data: [], tooltip: { valueSuffix: ' BPM' } }],
        credits: { enabled: false }
    });
    
    profileSelect.addEventListener('change', (event) => {
        currentProfileKey = event.target.value;
        chart.series[0].setData([]); // Limpia la gráfica al cambiar de perfil
        updateRoutine();
        updateHeartRate();
        routineDisplay.style.display = 'none';
    });

    manualToggle.addEventListener('change', () => {
        manualTimeInput.disabled = !manualToggle.checked;
        btnSetManual.disabled = !manualToggle.checked;
        if (!manualToggle.checked) {
            manualModeActive = false;
            manualDate = null;
        }
    });

    btnSetManual.addEventListener('click', () => {
        const timeValue = manualTimeInput.value || "00:00";
        const [h, m] = timeValue.split(':').map(Number);
        manualDate = new Date();
        manualDate.setHours(h, m, 0, 0);
        manualModeActive = true;
    });

    btnVerRutina.addEventListener('click', () => {
        if (routineDisplay.style.display === 'block') {
            routineDisplay.style.display = 'none';
        } else {
            const routineList = document.getElementById('routine-list');
            routineList.innerHTML = "";
            const dailyRoutine = profiles[currentProfileKey].dailyRoutine;
            dailyRoutine.forEach(r => {
                const li = document.createElement('li');
                li.textContent = `${r.start}:00 - ${r.end}:00 → ${labelMap[r.state]}`;
                routineList.appendChild(li);
            });
            routineDisplay.style.display = 'block';
        }
    });

    
    // Intervalo principal para generar nuevos datos de BPM
    setInterval(() => {
        updateRoutine();
        updateHeartRate();
    }, SIMULATION_INTERVAL);

    // Intervalo para actualizar la hora en la UI cada segundo
    setInterval(updateRoutine, 1000);

});