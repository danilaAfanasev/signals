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
} from 'chart.js';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line as ThreeLine, Text } from '@react-three/drei';
import {
  generatePeriodicSignal,
  generatePeriodicSignalVaryingFrequency,
  generatePeriodicSignalVaryingAmplitude,
  generateCombinedSignal,
  generateAmplitudeSpectrum,
  generateCombinedSignalRotated,
} from '../utils/signalUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Lab1 = () => {
  const { t: t1, values: v1 } = generatePeriodicSignal();
  const { t: t2, values: v2 } = generatePeriodicSignalVaryingFrequency();
  const { t: t3, values: v3 } = generatePeriodicSignalVaryingAmplitude();
  const { t: t4, values: v4 } = generateCombinedSignal();
  const { xf, yf } = generateAmplitudeSpectrum();
  const { t, v1Rotated, v2Rotated, v3Rotated, combined } = generateCombinedSignalRotated();

  // Проверка данных
  if (!t1.length || !v1.length || !t2.length || !v2.length || !t3.length || !v3.length || !t4.length || !v4.length) {
    console.error('Invalid data in Lab1:', {
      t1Length: t1.length,
      v1Length: v1.length,
      t2Length: t2.length,
      v2Length: v2.length,
      t3Length: t3.length,
      v3Length: v3.length,
      t4Length: t4.length,
      v4Length: v4.length,
    });
    return <div>Error: Invalid data for charts</div>;
  }

  const data1 = {
    labels: t1,
    datasets: [{ label: 'Harmonic Signal', data: v1, borderColor: 'blue', fill: false, tension: 0.1, pointRadius: 0 }],
  };

  const data2 = {
    labels: t2,
    datasets: [{ label: 'Varying Frequency Signal', data: v2, borderColor: 'green', fill: false, tension: 0.1, pointRadius: 0 }],
  };

  const data3 = {
    labels: t3,
    datasets: [{ label: 'Varying Amplitude Signal', data: v3, borderColor: 'red', fill: false, tension: 0.1, pointRadius: 0 }],
  };

  const data4 = {
    labels: t4,
    datasets: [{ label: 'Combined Signal', data: v4, borderColor: 'purple', fill: false, tension: 0.1, pointRadius: 0 }],
  };

  const data5 = {
    labels: xf,
    datasets: [{ label: 'Amplitude Spectrum', data: yf, borderColor: 'orange', fill: false, tension: 0.1, pointRadius: 0 }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Signal Visualization' },
    },
    elements: {
      line: {
        borderWidth: 1, // Фиксированная толщина линии
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10, // Ограничиваем количество меток для читаемости
        },
      },
    },
  };

  // Подготовка точек для 3D
  const scaleFactor = 1;
  const points1 = t.map((_, i) => [v1Rotated[0][i], v1Rotated[1][i] * scaleFactor, v1Rotated[2][i] * scaleFactor]);
  const points2 = t.map((_, i) => [v2Rotated[0][i], v2Rotated[1][i] * scaleFactor, v2Rotated[2][i] * scaleFactor]);
  const points3 = t.map((_, i) => [v3Rotated[0][i], v3Rotated[1][i] * scaleFactor, v3Rotated[2][i] * scaleFactor]);
  const pointsCombined = t.map((_, i) => [combined[0][i], combined[1][i] * scaleFactor, combined[2][i] * scaleFactor]);

  // Проверка на NaN в 3D-точках
  const checkNaN = (points, name) => {
    const hasNaN = points.some((point) => point.some((v) => isNaN(v) || v === undefined));
    if (hasNaN) {
      console.error(`NaN or undefined in ${name}:`, points);
      return true;
    }
    return false;
  };

  if (
    checkNaN(points1, 'points1') ||
    checkNaN(points2, 'points2') ||
    checkNaN(points3, 'points3') ||
    checkNaN(pointsCombined, 'pointsCombined')
  ) {
    return <div>Error: Invalid 3D points data</div>;
  }

  return (
    <div>
      <h2>Lab 1: Signal Visualization</h2>
      <div>
        <h3>Гармонический сигнал</h3>
        <Line data={data1} options={options} />
      </div>
      <div>
        <h3>Периодический сигнал с изменяющейся частотой</h3>
        <Line data={data2} options={options} />
      </div>
      <div>
        <h3>Периодический сигнал с изменяющейся амплитудой</h3>
        <Line data={data3} options={options} />
      </div>
      <div>
        <h3>Сложенный сигнал</h3>
        <Line data={data4} options={options} />
      </div>
      <div style={{ height: '500px' }}>
        <h3>3D визуализация</h3>
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ThreeLine points={points1} color="blue" lineWidth={2} />
          <ThreeLine points={points2} color="green" lineWidth={2} />
          <ThreeLine points={points3} color="red" lineWidth={2} />
          <ThreeLine points={pointsCombined} color="purple" lineWidth={2} />
          <axesHelper args={[3]} />
          <OrbitControls />
        </Canvas>
      </div>
      <div>
        <h3>Амплитудный спектр</h3>
        {xf.length && yf.length ? (
          <Line data={data5} options={options} />
        ) : (
          <p>Error: Amplitude spectrum data is invalid</p>
        )}
      </div>
    </div>
  );
};

export default Lab1;