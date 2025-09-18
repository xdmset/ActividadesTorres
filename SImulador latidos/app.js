    document.addEventListener('DOMContentLoaded', function () {

      const stateRanges = {
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
      };

      const labelMap = {
        reposo: 'Reposo',
        caminar: 'Caminando',
        correr: 'Corriendo',
        dormir: 'Durmiendo',
        desayuno: 'Desayunando / Comida',
        estudiar: 'Estudiando',
        trabajar: 'Trabajando',
        escaleras: 'Subiendo escaleras',
        meditacion: 'Meditando',
        pesas: 'Levantando pesas',
        bicicleta: 'Andando en bicicleta'
      };

      const dailyRoutine = [
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
      ];

      let currentState = 'reposo';
      let currentBPM = 75;

    // Cada 3 segundos
      const SIMULATION_INTERVAL = 3000;
      const MAX_CHART_POINTS = 20;

      const manualToggle = document.getElementById('manual-toggle');
      const manualTimeInput = document.getElementById('manual-time');
      const btnSetManual = document.getElementById('btn-set-manual');
      const btnVerRutina = document.getElementById('btn-ver-rutina');
      const routineDisplay = document.getElementById('routine-display');

      let manualDate = null; // Hora manual inicial
      let manualModeActive = false; // Controla si el reloj está corriendo en modo manual

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

      function getRandomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function updateActivityDisplay() {
        const display = labelMap[currentState] || currentState;
        document.getElementById('current-activity').textContent = display;
      }

      function updateHeartRate() {
        const targetRange = stateRanges[currentState];
        if (!targetRange) return;

        if (['reposo', 'meditacion', 'dormir'].includes(currentState)) {
          const prob = Math.random();
          if (prob < 0.5) {
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
      }

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

      function updateRoutine() {
        let now = new Date();

        if (manualModeActive && manualDate) {
          now = manualDate;
          manualDate = new Date(manualDate.getTime() + 1000);
        }

        const hour = now.getHours();
        const current = dailyRoutine.find(r => hour >= r.start && hour < r.end);
        currentState = current ? current.state : 'dormir';

        updateActivityDisplay();
        document.getElementById('time-display').textContent =
          (manualModeActive ? "Hora manual: " : "Hora actual: ") + now.toLocaleTimeString();
      }

      // Toggle rutina
      btnVerRutina.addEventListener('click', () => {
        if (routineDisplay.style.display === 'block') {
          routineDisplay.style.display = 'none';
        } else {
          const routineList = document.getElementById('routine-list');
          routineList.innerHTML = "";
          dailyRoutine.forEach(r => {
            const li = document.createElement('li');
            li.textContent = `${r.start}:00 - ${r.end}:00 → ${labelMap[r.state]}`;
            routineList.appendChild(li);
          });
          routineDisplay.style.display = 'block';
        }
      });

      // Simulación
      setInterval(() => {
        updateRoutine();
        updateHeartRate();
      }, SIMULATION_INTERVAL);

      // Actualizar hora cada segundo
      setInterval(updateRoutine, 1000);

    });