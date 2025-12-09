# 🧬 GeneTrader: El Laboratorio de Trading Evolutivo

Una plataforma web interactiva y educativa que demuestra el poder de los **algoritmos genéticos** para crear y optimizar estrategias de trading algorítmico.

![GeneTrader](https://img.shields.io/badge/GeneTrader-v1.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🎯 Objetivo

GeneTrader permite experimentar cómo la **evolución artificial** puede "descubrir" reglas de trading rentables en datos históricos del mercado. Es una herramienta educativa que hace tangibles los conceptos abstractos de los algoritmos genéticos.

## ✨ Características

### 📈 Simulador de Mercado
- Gráfico de velas interactivo (zoom, desplazamiento)
- Carga de datos CSV personalizados
- Datos de ejemplo incluidos (SPY, BTC, AAPL)
- Visualización de señales de compra/venta

### 🧬 Constructor de Estrategias (ADN)
- Representación cromosómica de estrategias
- Reglas basadas en indicadores técnicos (SMA, EMA, RSI)
- Inspector de ADN con formato legible

### ⚙️ Motor Evolutivo
- Controles interactivos con tooltips educativos
- Parámetros: población, mutación, cruce, elitismo
- Múltiples funciones de fitness

### 📊 Dashboard de Rendimiento
- Métricas en tiempo real (Retorno, Sharpe, Drawdown)
- Gráfico de evolución del fitness
- Leaderboard de las mejores estrategias

## 🚀 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/metahuristicas.git
cd metahuristicas

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# O ejecutar en producción
npm run build
npm run start
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🌐 Despliegue con GitHub Pages

Este proyecto está configurado para desplegarse automáticamente con GitHub Actions.

### Pasos para desplegar:

1. **Crear repositorio en GitHub** y subir el código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/metahuristicas.git
   git push -u origin main
   ```

2. **Configurar GitHub Pages:**
   - Ve a Settings → Pages
   - Source: selecciona "GitHub Actions"

3. **Configurar basePath (si es necesario):**
   Si tu repositorio NO es `tu-usuario.github.io`, edita `next.config.ts`:
   ```typescript
   basePath: '/nombre-de-tu-repo',
   ```

4. **El despliegue es automático** cada vez que hagas push a `main`.

### URL de tu sitio:
```
https://tu-usuario.github.io/metahuristicas/
```

## 📚 Documentación

- [GUIA_TECNICA.md](./GUIA_TECNICA.md) - Explicación detallada del sistema

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **Estado**: Zustand
- **Gráficos**: Lightweight Charts v5, Recharts
- **Estilos**: Tailwind CSS

## 📁 Estructura del Proyecto

```
src/
├── app/           # Páginas y layout
├── components/    # Componentes React
├── lib/           # Lógica de negocio (GA, backtesting)
├── store/         # Estado global (Zustand)
└── types/         # Tipos TypeScript
public/
└── data/          # Datos de ejemplo (CSV)
```

## ⚠️ Disclaimer

GeneTrader es una herramienta **exclusivamente educativa**. Los resultados de backtesting no garantizan rendimientos futuros. No es asesoría financiera.

## 📄 Licencia

MIT License
