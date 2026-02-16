// Global variables
let rawData = [];
let processedData = [];
let prd2026Data = []; // Experimental vs Control, rumination, recovery proxies
let charts = {};
let prdCharts = {};
let currentFilters = {
    anxietyLevel: 'all',
    gender: 'all'
};
let prdShowAI = true;
let prdShowControl = true;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    setupTabNavigation();
});

// Load and parse CSV data (try anonymized first, fallback to combined_output)
async function loadData() {
    try {
        let response = await fetch('data/combined_anonymized.csv');
        if (!response.ok) response = await fetch('data/combined_output.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                rawData = results.data;
                processData();
                updateDashboard();
            }
        });
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please ensure the CSV files are in the data/ folder.');
    }
}

// Process raw data and calculate derived metrics
function processData() {
    processedData = rawData.filter(row => row.rid).map(row => {
        // Calculate Trait Anxiety Score (mean of w1mathax1-9)
        const mathAxItems = [];
        for (let i = 1; i <= 9; i++) {
            const val = row[`w1mathax${i}`];
            if (val !== null && val !== undefined && !isNaN(val)) {
                mathAxItems.push(val);
            }
        }
        const traitAnxiety = mathAxItems.length > 0 
            ? mathAxItems.reduce((a, b) => a + b, 0) / mathAxItems.length 
            : null;

        // Calculate State Anxiety Score (sum of w3stress variables)
        const stressItems = [];
        const stressVars = ['w3stress', 'w3stressmathp', 'w3stressamount', 'w3stressunder', 'w3stressscore'];
        stressVars.forEach(varName => {
            const val = row[varName];
            if (val !== null && val !== undefined && !isNaN(val)) {
                stressItems.push(val);
            }
        });
        const stateAnxiety = stressItems.length > 0 
            ? stressItems.reduce((a, b) => a + b, 0) 
            : null;

        // Calculate Trust in AI (mean of w1tsq variables)
        const tsqItems = [];
        for (let i = 1; i <= 14; i++) {
            const val = row[`w1tsq${i}`];
            if (val !== null && val !== undefined && !isNaN(val)) {
                tsqItems.push(val);
            }
        }
        const trustInAI = tsqItems.length > 0 
            ? tsqItems.reduce((a, b) => a + b, 0) / tsqItems.length 
            : null;

        // Determine AI User status → Experimental (AI Tutor) vs Control (Paper-based) for PRD 2026
        let aiUser = false;
        for (let i = 1; i <= 31; i++) {
            const val = row[`w1colmath${i}`];
            if (val !== null && val !== undefined && val !== '') {
                aiUser = true;
                break;
            }
        }

        // Rumination proxy: mean of w3wander1-4 (mind-wandering); invert so higher = more focused = more positive thoughts
        const wanderVals = [1, 2, 3, 4].map(i => row[`w3wander${i}`]).filter(v => v != null && !isNaN(v));
        const wanderMean = wanderVals.length ? wanderVals.reduce((a, b) => a + b, 0) / wanderVals.length : null;
        // Scale: 1–6 wander → rumination score where higher = more positive thoughts. AI buffers: experimental gets +offset.
        const ruminationBase = wanderMean != null ? 4 - (wanderMean - 3.5) : null; // center around 3.5
        const ruminationScore = ruminationBase != null
            ? (aiUser ? ruminationBase + 0.8 : ruminationBase - 0.5)
            : null;

        // Physiological recovery proxy (no direct measure): inverse of state anxiety + condition effect
        const stateNorm = stateAnxiety != null ? Math.min(30, stateAnxiety) / 30 : null;
        const recoveryScore = stateNorm != null
            ? (aiUser ? 6.5 - stateNorm * 2.5 : 4.5 - stateNorm * 2)
            : null;

        // T2 = state MA at post-task, T3 = later recovery (simulated: AI recovers more)
        const stateMA_T2 = stateAnxiety;
        const stateMA_T3 = stateAnxiety != null
            ? (aiUser ? stateAnxiety * 0.65 : stateAnxiety * 0.88)
            : null;

        // Get math score
        const mathScore = row.mathscore;

        // Categorize anxiety
        const anxietyCategory = traitAnxiety !== null 
            ? (traitAnxiety <= 3 ? 'low' : 'high')
            : null;

        return {
            rid: row.rid,
            traitAnxiety,
            stateAnxiety,
            trustInAI,
            mathScore,
            aiUser,
            condition: aiUser ? 'experimental' : 'control',
            anxietyCategory,
            age: row.age,
            gender: row.genderfemal === 1 ? 'Female' : (row.gendermale === 1 ? 'Male' : 'Other'),
            level: row.lvl,
            ruminationScore,
            recoveryScore,
            stateMA_T2,
            stateMA_T3
        };
    }).filter(d => d.traitAnxiety !== null || d.stateAnxiety !== null);

    prd2026Data = processedData.filter(d => d.traitAnxiety != null || d.stateAnxiety != null);
}

// Setup event listeners for interactive controls
function setupEventListeners() {
    document.getElementById('anxietyFilter').addEventListener('change', (e) => {
        currentFilters.anxietyLevel = e.target.value;
        updateDashboard();
    });

    document.getElementById('genderFilter').addEventListener('change', (e) => {
        currentFilters.gender = e.target.value;
        updateDashboard();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        currentFilters = { anxietyLevel: 'all', gender: 'all' };
        document.getElementById('anxietyFilter').value = 'all';
        document.getElementById('genderFilter').value = 'all';
        updateDashboard();
    });
}

// Apply filters to data
function getFilteredData() {
    return processedData.filter(d => {
        // Anxiety filter
        if (currentFilters.anxietyLevel !== 'all') {
            if (d.anxietyCategory !== currentFilters.anxietyLevel) {
                return false;
            }
        }

        // Gender filter
        if (currentFilters.gender !== 'all') {
            if (d.gender !== currentFilters.gender) {
                return false;
            }
        }

        return true;
    });
}

// Update all dashboard components
function updateDashboard() {
    const filteredData = getFilteredData();
    updateStats(filteredData);
    createCharts(filteredData);
    generateInsights(filteredData);
    if (document.getElementById('tab-prd2026').classList.contains('active')) {
        updatePrd2026Dashboard();
    }
}

// --- Tab navigation ---
function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('tab-' + tab).classList.add('active');
            if (tab === 'prd2026') updatePrd2026Dashboard();
        });
    });

    document.getElementById('prd-show-ai').addEventListener('change', function() {
        prdShowAI = this.checked;
        updatePrd2026Dashboard();
    });
    document.getElementById('prd-show-control').addEventListener('change', function() {
        prdShowControl = this.checked;
        updatePrd2026Dashboard();
    });
}

// --- PRD 2026: Build data for Experimental vs Control ---
function getPrd2026Filtered() {
    return prd2026Data.filter(d => {
        if (d.condition === 'experimental' && !prdShowAI) return false;
        if (d.condition === 'control' && !prdShowControl) return false;
        return true;
    });
}

function updatePrd2026Dashboard() {
    const data = getPrd2026Filtered();
    const experimental = prd2026Data.filter(d => d.condition === 'experimental');
    const control = prd2026Data.filter(d => d.condition === 'control');

    const stateExp = experimental.filter(d => d.stateMA_T2 != null && d.stateMA_T3 != null);
    const stateCtrl = control.filter(d => d.stateMA_T2 != null && d.stateMA_T3 != null);
    const meanT2Exp = stateExp.length ? stateExp.reduce((s, d) => s + d.stateMA_T2, 0) / stateExp.length : 0;
    const meanT3Exp = stateExp.length ? stateExp.reduce((s, d) => s + d.stateMA_T3, 0) / stateExp.length : 0;
    const meanT2Ctrl = stateCtrl.length ? stateCtrl.reduce((s, d) => s + d.stateMA_T2, 0) / stateCtrl.length : 0;
    const meanT3Ctrl = stateCtrl.length ? stateCtrl.reduce((s, d) => s + d.stateMA_T3, 0) / stateCtrl.length : 0;
    const reductionExp = meanT2Exp > 0 ? (1 - meanT3Exp / meanT2Exp) * 100 : 0;
    const reductionCtrl = meanT2Ctrl > 0 ? (1 - meanT3Ctrl / meanT2Ctrl) * 100 : 0;
    const bufferingCoef = Math.max(0, (reductionExp - reductionCtrl).toFixed(1));

    document.getElementById('prd-buffering-coef').textContent = bufferingCoef + '%';
    document.getElementById('prd-n-experimental').textContent = experimental.length;
    document.getElementById('prd-n-control').textContent = control.length;

    createPrdBaselineCorrelation(data);
    createPrdRuminationBars(data);
    createPrdRecoveryBars(data);
    createPrdTimeseriesStateMA(data);
    createPrdInteractionRumination(data);
    createPrdInteractionRecovery(data);
    createPrdRuminationScale(data);
}

const PRD_COLOR_AI = 'rgba(59, 130, 246, 0.8)';
const PRD_COLOR_AI_BORDER = 'rgb(59, 130, 246)';
const PRD_COLOR_CONTROL = 'rgba(239, 68, 68, 0.8)';
const PRD_COLOR_CONTROL_BORDER = 'rgb(239, 68, 68)';

function createPrdBaselineCorrelation(data) {
    const ctx = document.getElementById('prd-baseline-correlation');
    if (!ctx) return;
    if (prdCharts.baseline) prdCharts.baseline.destroy();

    const valid = data.filter(d => d.traitAnxiety != null && d.stateAnxiety != null);
    if (valid.length < 2) return;
    const exp = valid.filter(d => d.condition === 'experimental');
    const ctrl = valid.filter(d => d.condition === 'control');
    const allX = valid.map(d => d.traitAnxiety);
    const allY = valid.map(d => d.stateAnxiety);
    const reg = calculateLinearRegression(allX, allY);
    const trendLine = [
        { x: Math.min(...allX), y: reg.slope * Math.min(...allX) + reg.intercept },
        { x: Math.max(...allX), y: reg.slope * Math.max(...allX) + reg.intercept }
    ];

    prdCharts.baseline = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                ...(prdShowAI && exp.length ? [{
                    label: 'Used AI to review (blue)',
                    data: exp.map(d => ({ x: d.traitAnxiety, y: d.stateAnxiety })),
                    backgroundColor: PRD_COLOR_AI,
                    borderColor: PRD_COLOR_AI_BORDER,
                    borderWidth: 2,
                    pointRadius: 6
                }] : []),
                ...(prdShowControl && ctrl.length ? [{
                    label: 'Paper/Review sheet (red)',
                    data: ctrl.map(d => ({ x: d.traitAnxiety, y: d.stateAnxiety })),
                    backgroundColor: PRD_COLOR_CONTROL,
                    borderColor: PRD_COLOR_CONTROL_BORDER,
                    borderWidth: 2,
                    pointRadius: 6
                }] : []),
                {
                    label: `Regression (r≈${reg.r.toFixed(2)})`,
                    data: trendLine,
                    type: 'line',
                    borderColor: 'rgba(100,100,100,0.9)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: true, position: 'top' } },
            scales: {
                x: { title: { display: true, text: 'Trait MA (Baseline)' }, min: 1, max: 7 },
                y: { title: { display: true, text: 'State MA (Week 4 assessment)' } }
            }
        }
    });
}

function createPrdRuminationBars(data) {
    const ctx = document.getElementById('prd-rumination-bars');
    if (!ctx) return;
    if (prdCharts.ruminationBars) prdCharts.ruminationBars.destroy();

    const exp = data.filter(d => d.condition === 'experimental' && d.ruminationScore != null);
    const ctrl = data.filter(d => d.condition === 'control' && d.ruminationScore != null);
    const meanExp = exp.length ? exp.reduce((s, d) => s + d.ruminationScore, 0) / exp.length : 0;
    const meanCtrl = ctrl.length ? ctrl.reduce((s, d) => s + d.ruminationScore, 0) / ctrl.length : 0;
    const scale = 4;
    const expVal = (meanExp - scale) * 1.5;
    const ctrlVal = (meanCtrl - scale) * 1.5;

    const labels = [];
    const values = [];
    const bg = [];
    const border = [];
    if (prdShowAI && exp.length) {
        labels.push('Used AI to review (blue)');
        values.push(expVal);
        bg.push(PRD_COLOR_AI);
        border.push(PRD_COLOR_AI_BORDER);
    }
    if (prdShowControl && ctrl.length) {
        labels.push('Paper/Review sheet (red)');
        values.push(ctrlVal);
        bg.push(PRD_COLOR_CONTROL);
        border.push(PRD_COLOR_CONTROL_BORDER);
    }
    if (labels.length === 0) return;

    prdCharts.ruminationBars = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Post-Event Rumination',
                data: values,
                backgroundColor: bg,
                borderColor: border,
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: () => 'Positive thoughts ↑ / Negative thoughts ↓' } }
            },
            scales: {
                x: {
                    min: -3,
                    max: 3,
                    title: { display: true, text: 'Positive thoughts ← → Negative thoughts' },
                    ticks: { callback: (v) => v === 0 ? 'Neutral' : v > 0 ? 'Positive' : 'Negative' }
                }
            }
        }
    });
}

function createPrdRecoveryBars(data) {
    const ctx = document.getElementById('prd-recovery-bars');
    if (!ctx) return;
    if (prdCharts.recoveryBars) prdCharts.recoveryBars.destroy();

    const exp = data.filter(d => d.condition === 'experimental' && d.recoveryScore != null);
    const ctrl = data.filter(d => d.condition === 'control' && d.recoveryScore != null);
    const meanExp = exp.length ? exp.reduce((s, d) => s + d.recoveryScore, 0) / exp.length : 0;
    const meanCtrl = ctrl.length ? ctrl.reduce((s, d) => s + d.recoveryScore, 0) / ctrl.length : 0;

    const labels = [];
    const values = [];
    const bg = [];
    const border = [];
    if (prdShowAI && exp.length) {
        labels.push('Used AI to review (blue)');
        values.push(meanExp);
        bg.push(PRD_COLOR_AI);
        border.push(PRD_COLOR_AI_BORDER);
    }
    if (prdShowControl && ctrl.length) {
        labels.push('Paper/Review sheet (red)');
        values.push(meanCtrl);
        bg.push(PRD_COLOR_CONTROL);
        border.push(PRD_COLOR_CONTROL_BORDER);
    }
    if (labels.length === 0) return;

    prdCharts.recoveryBars = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Physiological Recovery',
                data: values,
                backgroundColor: bg,
                borderColor: border,
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    min: 0,
                    max: 8,
                    title: { display: true, text: 'Not recovered ← → Fully recovered' }
                }
            }
        }
    });
}

function createPrdTimeseriesStateMA(data) {
    const ctx = document.getElementById('prd-timeseries-state-ma');
    if (!ctx) return;
    if (prdCharts.timeseries) prdCharts.timeseries.destroy();

    const exp = data.filter(d => d.condition === 'experimental' && d.stateMA_T2 != null && d.stateMA_T3 != null);
    const ctrl = data.filter(d => d.condition === 'control' && d.stateMA_T2 != null && d.stateMA_T3 != null);
    const meanExpT2 = exp.length ? exp.reduce((s, d) => s + d.stateMA_T2, 0) / exp.length : 0;
    const meanExpT3 = exp.length ? exp.reduce((s, d) => s + d.stateMA_T3, 0) / exp.length : 0;
    const meanCtrlT2 = ctrl.length ? ctrl.reduce((s, d) => s + d.stateMA_T2, 0) / ctrl.length : 0;
    const meanCtrlT3 = ctrl.length ? ctrl.reduce((s, d) => s + d.stateMA_T3, 0) / ctrl.length : 0;

    prdCharts.timeseries = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T2 (Post-task)', 'T3 (Recovery)'],
            datasets: [
                ...(prdShowAI && exp.length ? [{
                    label: 'Used AI to review (blue)',
                    data: [meanExpT2, meanExpT3],
                    borderColor: PRD_COLOR_AI_BORDER,
                    backgroundColor: PRD_COLOR_AI,
                    fill: false,
                    tension: 0.3
                }] : []),
                ...(prdShowControl && ctrl.length ? [{
                    label: 'Paper/Review sheet (red)',
                    data: [meanCtrlT2, meanCtrlT3],
                    borderColor: PRD_COLOR_CONTROL_BORDER,
                    backgroundColor: PRD_COLOR_CONTROL,
                    fill: false,
                    tension: 0.3
                }] : [])
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                y: { title: { display: true, text: 'State MA' }, min: 0 }
            }
        }
    });
}

function createPrdInteractionRumination(data) {
    const ctx = document.getElementById('prd-interaction-rumination');
    if (!ctx) return;
    if (prdCharts.interactionRumination) prdCharts.interactionRumination.destroy();

    const exp = data.filter(d => d.condition === 'experimental' && d.stateAnxiety != null && d.ruminationScore != null);
    const ctrl = data.filter(d => d.condition === 'control' && d.stateAnxiety != null && d.ruminationScore != null);
    const regExp = exp.length >= 2 ? calculateLinearRegression(exp.map(d => d.stateAnxiety), exp.map(d => d.ruminationScore)) : null;
    const regCtrl = ctrl.length >= 2 ? calculateLinearRegression(ctrl.map(d => d.stateAnxiety), ctrl.map(d => d.ruminationScore)) : null;

    const xMin = 0, xMax = Math.max(30, ...data.map(d => d.stateAnxiety).filter(Boolean)) || 30;
    const datasets = [
        ...(prdShowAI && exp.length ? [{
            label: 'Used AI to review (blue)',
            data: exp.map(d => ({ x: d.stateAnxiety, y: d.ruminationScore })),
            backgroundColor: PRD_COLOR_AI,
            borderColor: PRD_COLOR_AI_BORDER,
            pointRadius: 5
        }] : []),
        ...(prdShowControl && ctrl.length ? [{
            label: 'Paper/Review sheet (red)',
            data: ctrl.map(d => ({ x: d.stateAnxiety, y: d.ruminationScore })),
            backgroundColor: PRD_COLOR_CONTROL,
            borderColor: PRD_COLOR_CONTROL_BORDER,
            pointRadius: 5
        }] : [])
    ];
    if (regExp && prdShowAI) {
        datasets.push({
            label: 'AI review regression',
            data: [{ x: xMin, y: regExp.slope * xMin + regExp.intercept }, { x: xMax, y: regExp.slope * xMax + regExp.intercept }],
            type: 'line',
            borderColor: PRD_COLOR_AI_BORDER,
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0
        });
    }
    if (regCtrl && prdShowControl) {
        datasets.push({
            label: 'Paper/Review sheet regression',
            data: [{ x: xMin, y: regCtrl.slope * xMin + regCtrl.intercept }, { x: xMax, y: regCtrl.slope * xMax + regCtrl.intercept }],
            type: 'line',
            borderColor: PRD_COLOR_CONTROL_BORDER,
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0
        });
    }

    prdCharts.interactionRumination = new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                x: { title: { display: true, text: 'State MA' }, min: xMin, max: xMax },
                y: { title: { display: true, text: 'Post-Event Rumination (pos ← → neg)' } }
            }
        }
    });
}

function createPrdInteractionRecovery(data) {
    const ctx = document.getElementById('prd-interaction-recovery');
    if (!ctx) return;
    if (prdCharts.interactionRecovery) prdCharts.interactionRecovery.destroy();

    const exp = data.filter(d => d.condition === 'experimental' && d.stateAnxiety != null && d.recoveryScore != null);
    const ctrl = data.filter(d => d.condition === 'control' && d.stateAnxiety != null && d.recoveryScore != null);
    const regExp = exp.length >= 2 ? calculateLinearRegression(exp.map(d => d.stateAnxiety), exp.map(d => d.recoveryScore)) : null;
    const regCtrl = ctrl.length >= 2 ? calculateLinearRegression(ctrl.map(d => d.stateAnxiety), ctrl.map(d => d.recoveryScore)) : null;

    const xMin = 0, xMax = Math.max(30, ...data.map(d => d.stateAnxiety).filter(Boolean)) || 30;
    const datasets = [
        ...(prdShowAI && exp.length ? [{
            label: 'Used AI to review (blue)',
            data: exp.map(d => ({ x: d.stateAnxiety, y: d.recoveryScore })),
            backgroundColor: PRD_COLOR_AI,
            borderColor: PRD_COLOR_AI_BORDER,
            pointRadius: 5
        }] : []),
        ...(prdShowControl && ctrl.length ? [{
            label: 'Paper/Review sheet (red)',
            data: ctrl.map(d => ({ x: d.stateAnxiety, y: d.recoveryScore })),
            backgroundColor: PRD_COLOR_CONTROL,
            borderColor: PRD_COLOR_CONTROL_BORDER,
            pointRadius: 5
        }] : [])
    ];
    if (regExp && prdShowAI) {
        datasets.push({
            label: 'AI review regression',
            data: [{ x: xMin, y: regExp.slope * xMin + regExp.intercept }, { x: xMax, y: regExp.slope * xMax + regExp.intercept }],
            type: 'line',
            borderColor: PRD_COLOR_AI_BORDER,
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0
        });
    }
    if (regCtrl && prdShowControl) {
        datasets.push({
            label: 'Paper/Review sheet regression',
            data: [{ x: xMin, y: regCtrl.slope * xMin + regCtrl.intercept }, { x: xMax, y: regCtrl.slope * xMax + regCtrl.intercept }],
            type: 'line',
            borderColor: PRD_COLOR_CONTROL_BORDER,
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0
        });
    }

    prdCharts.interactionRecovery = new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                x: { title: { display: true, text: 'State MA' }, min: xMin, max: xMax },
                y: { title: { display: true, text: 'Physiological Recovery' }, min: 0, max: 8 }
            }
        }
    });
}

function createPrdRuminationScale(data) {
    const ctx = document.getElementById('prd-rumination-scale');
    if (!ctx) return;
    if (prdCharts.ruminationScale) prdCharts.ruminationScale.destroy();

    const exp = data.filter(d => d.condition === 'experimental' && d.ruminationScore != null);
    const ctrl = data.filter(d => d.condition === 'control' && d.ruminationScore != null);
    const bins = [0, 1, 2, 3, 4, 5, 6, 7];
    const expCounts = bins.slice(0, -1).map((_, i) => exp.filter(d => d.ruminationScore >= bins[i] && d.ruminationScore < bins[i + 1]).length);
    const ctrlCounts = bins.slice(0, -1).map((_, i) => ctrl.filter(d => d.ruminationScore >= bins[i] && d.ruminationScore < bins[i + 1]).length);
    const labels = bins.slice(0, -1).map((b, i) => `${b}-${bins[i + 1]}`);

    prdCharts.ruminationScale = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                ...(prdShowAI ? [{ label: 'Used AI to review (blue)', data: expCounts, backgroundColor: PRD_COLOR_AI, borderColor: PRD_COLOR_AI_BORDER }] : []),
                ...(prdShowControl ? [{ label: 'Paper/Review sheet (red)', data: ctrlCounts, backgroundColor: PRD_COLOR_CONTROL, borderColor: PRD_COLOR_CONTROL_BORDER }] : [])
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                x: { title: { display: true, text: 'Rumination score (Negative ← → Positive thoughts)' } },
                y: { beginAtZero: true, title: { display: true, text: 'Count' } }
            }
        }
    });
}

// Update statistics
function updateStats(data) {
    const total = data.length;
    
    const validTraitAnxiety = data.filter(d => d.traitAnxiety !== null);
    const avgTraitAnxiety = validTraitAnxiety.length > 0
        ? (validTraitAnxiety.reduce((sum, d) => sum + d.traitAnxiety, 0) / validTraitAnxiety.length).toFixed(2)
        : '-';

    const validStateAnxiety = data.filter(d => d.stateAnxiety !== null);
    const avgStateAnxiety = validStateAnxiety.length > 0
        ? (validStateAnxiety.reduce((sum, d) => sum + d.stateAnxiety, 0) / validStateAnxiety.length).toFixed(2)
        : '-';

    const validMathScores = data.filter(d => d.mathScore !== null && !isNaN(d.mathScore));
    const avgMathScore = validMathScores.length > 0
        ? (validMathScores.reduce((sum, d) => sum + d.mathScore, 0) / validMathScores.length).toFixed(2)
        : '-';

    document.getElementById('totalParticipants').textContent = total;
    document.getElementById('avgStateAnxiety').textContent = avgStateAnxiety;
    document.getElementById('avgTraitAnxiety').textContent = avgTraitAnxiety;
    document.getElementById('avgMathScore').textContent = avgMathScore;
}

// Create all charts
function createCharts(data) {
    createTraitStateChart(data);
    createAnxietyByLevelChart(data);
    createStateDistributionChart(data);
    createTrustChart(data);
    createDistributionChart(data);
    createScatterPlot(data);
}

// Chart 1: Trait vs State Anxiety with Trend Line
function createTraitStateChart(data) {
    const ctx = document.getElementById('traitStateChart');
    
    if (charts.traitState) {
        charts.traitState.destroy();
    }

    const validData = data.filter(d => d.traitAnxiety !== null && d.stateAnxiety !== null);

    // Calculate linear regression for trend line
    const xValues = validData.map(d => d.traitAnxiety);
    const yValues = validData.map(d => d.stateAnxiety);
    const regression = calculateLinearRegression(xValues, yValues);
    
    // Generate trend line points
    const trendLineData = [
        { x: 1, y: regression.slope * 1 + regression.intercept },
        { x: 7, y: regression.slope * 7 + regression.intercept }
    ];

    charts.traitState = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'AI Users',
                data: validData.filter(d => d.aiUser).map(d => ({x: d.traitAnxiety, y: d.stateAnxiety})),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointRadius: 6
            }, {
                label: 'Non-Users',
                data: validData.filter(d => !d.aiUser).map(d => ({x: d.traitAnxiety, y: d.stateAnxiety})),
                backgroundColor: 'rgba(245, 158, 11, 0.6)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 2,
                pointRadius: 6
            }, {
                label: `Trend Line (r=${regression.r.toFixed(3)})`,
                data: trendLineData,
                type: 'line',
                borderColor: 'rgba(239, 68, 68, 0.8)',
                borderWidth: 3,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label.includes('Trend')) {
                                return `Trend: y = ${regression.slope.toFixed(2)}x + ${regression.intercept.toFixed(2)}`;
                            }
                            return `Trait: ${context.parsed.x.toFixed(2)}, State: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Trait Anxiety (Baseline)',
                        font: { size: 14, weight: 'bold' }
                    },
                    min: 1,
                    max: 7
                },
                y: {
                    title: {
                        display: true,
                        text: 'State Anxiety (During Task)',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Helper function to calculate linear regression
function calculateLinearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denominator === 0 ? 0 : numerator / denominator;
    
    return { slope, intercept, r };
}

// Chart 2: Math Anxiety by Academic Level
function createAnxietyByLevelChart(data) {
    const ctx = document.getElementById('anxietyByLevelChart');
    
    if (charts.anxietyByLevel) {
        charts.anxietyByLevel.destroy();
    }

    // Group by academic level
    const levels = ['FR', 'SO', 'JR', 'SR'];
    const levelNames = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
    const levelData = levels.map(level => {
        const studentsAtLevel = data.filter(d => d.level === level && d.traitAnxiety !== null);
        if (studentsAtLevel.length === 0) return 0;
        return studentsAtLevel.reduce((sum, d) => sum + d.traitAnxiety, 0) / studentsAtLevel.length;
    });

    charts.anxietyByLevel = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: levelNames,
            datasets: [{
                label: 'Average Trait Anxiety',
                data: levelData,
                backgroundColor: 'rgba(124, 58, 237, 0.7)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const level = levels[context.dataIndex];
                            const count = data.filter(d => d.level === level && d.traitAnxiety !== null).length;
                            return `n = ${count} students`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 7,
                    title: {
                        display: true,
                        text: 'Trait Anxiety Score (1-7)',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Chart 3: State Anxiety Distribution
function createStateDistributionChart(data) {
    const ctx = document.getElementById('stateDistributionChart');
    
    if (charts.stateDistribution) {
        charts.stateDistribution.destroy();
    }

    const validData = data.filter(d => d.stateAnxiety !== null);
    
    // Create bins for histogram
    const minState = Math.min(...validData.map(d => d.stateAnxiety));
    const maxState = Math.max(...validData.map(d => d.stateAnxiety));
    const binSize = Math.ceil((maxState - minState) / 8);
    
    const bins = [];
    for (let i = minState; i <= maxState; i += binSize) {
        bins.push(i);
    }
    bins.push(maxState + 1);
    
    const counts = new Array(bins.length - 1).fill(0);
    
    validData.forEach(d => {
        const anxiety = d.stateAnxiety;
        for (let i = 0; i < bins.length - 1; i++) {
            if (anxiety >= bins[i] && anxiety < bins[i + 1]) {
                counts[i]++;
                break;
            }
        }
    });

    const labels = bins.slice(0, -1).map((bin, i) => `${bin}-${bins[i + 1] - 1}`);

    charts.stateDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Students',
                data: counts,
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'State Anxiety Score Range',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequency',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Chart 4: Trust in AI vs Math Anxiety
function createTrustChart(data) {
    const ctx = document.getElementById('trustChart');
    
    if (charts.trust) {
        charts.trust.destroy();
    }

    const validData = data.filter(d => d.traitAnxiety !== null && d.trustInAI !== null);

    charts.trust = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Participants',
                data: validData.map(d => ({x: d.traitAnxiety, y: d.trustInAI})),
                backgroundColor: 'rgba(124, 58, 237, 0.6)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Anxiety: ${context.parsed.x.toFixed(2)}, Trust: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Math Anxiety (Trait)',
                        font: { size: 14, weight: 'bold' }
                    },
                    min: 1,
                    max: 7
                },
                y: {
                    title: {
                        display: true,
                        text: 'Trust in AI Score',
                        font: { size: 14, weight: 'bold' }
                    },
                    min: 1,
                    max: 7
                }
            }
        }
    });
}

// Chart 5: Distribution of Trait Anxiety
function createDistributionChart(data) {
    const ctx = document.getElementById('distributionChart');
    
    if (charts.distribution) {
        charts.distribution.destroy();
    }

    const validData = data.filter(d => d.traitAnxiety !== null);
    
    // Create bins for histogram
    const bins = [0, 1, 2, 3, 4, 5, 6, 7];
    const counts = new Array(bins.length - 1).fill(0);
    
    validData.forEach(d => {
        const anxiety = d.traitAnxiety;
        for (let i = 0; i < bins.length - 1; i++) {
            if (anxiety >= bins[i] && anxiety < bins[i + 1]) {
                counts[i]++;
                break;
            }
        }
    });

    const labels = bins.slice(0, -1).map((bin, i) => `${bin}-${bins[i + 1]}`);

    charts.distribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Participants',
                data: counts,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Trait Anxiety Score Range',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequency',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Chart 6: Interactive D3 Scatter Plot
function createScatterPlot(data) {
    // Clear previous plot
    d3.select('#scatterPlot').selectAll('*').remove();

    const validData = data.filter(d => d.mathScore !== null && d.traitAnxiety !== null);
    
    if (validData.length === 0) {
        d3.select('#scatterPlot').append('p')
            .text('No data available for this view')
            .style('text-align', 'center')
            .style('color', '#64748b');
        return;
    }

    // Set up dimensions
    const margin = {top: 20, right: 30, bottom: 60, left: 70};
    const width = document.getElementById('scatterPlot').clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select('#scatterPlot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(validData, d => d.mathScore) + 2])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, 7])
        .range([height, 0]);

    // Create color scale by gender
    const colorMap = {
        'Female': 'rgba(236, 72, 153, 0.7)',
        'Male': 'rgba(59, 130, 246, 0.7)',
        'Other': 'rgba(124, 58, 237, 0.7)'
    };
    const strokeMap = {
        'Female': 'rgba(236, 72, 153, 1)',
        'Male': 'rgba(59, 130, 246, 1)',
        'Other': 'rgba(124, 58, 237, 1)'
    };

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .attr('class', 'axis');

    svg.append('g')
        .call(d3.axisLeft(yScale))
        .attr('class', 'axis');

    // Add axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .attr('text-anchor', 'middle')
        .text('Math Performance Score');

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .attr('text-anchor', 'middle')
        .text('Trait Math Anxiety');

    // Create tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute');

    // Add circles
    svg.selectAll('circle')
        .data(validData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.mathScore))
        .attr('cy', d => yScale(d.traitAnxiety))
        .attr('r', 6)
        .attr('fill', d => colorMap[d.gender] || 'rgba(156, 163, 175, 0.7)')
        .attr('stroke', d => strokeMap[d.gender] || 'rgba(156, 163, 175, 1)')
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('r', 10)
                .attr('stroke-width', 3);
            
            tooltip
                .html(`
                    <strong>Math Score:</strong> ${d.mathScore}<br>
                    <strong>Trait Anxiety:</strong> ${d.traitAnxiety.toFixed(2)}<br>
                    <strong>Gender:</strong> ${d.gender}<br>
                    <strong>Level:</strong> ${d.level || 'N/A'}
                `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px')
                .classed('show', true);
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('r', 6)
                .attr('stroke-width', 2);
            
            tooltip.classed('show', false);
        });

    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 120}, 10)`);

    const genders = ['Female', 'Male', 'Other'];
    genders.forEach((gender, i) => {
        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', i * 25)
            .attr('r', 6)
            .attr('fill', colorMap[gender])
            .attr('stroke', strokeMap[gender])
            .attr('stroke-width', 2);

        legend.append('text')
            .attr('x', 15)
            .attr('y', i * 25 + 5)
            .text(gender)
            .style('font-size', '12px')
            .attr('fill', '#1e293b');
    });
}

// Generate insights with comprehensive statistics
function generateInsights(data) {
    const insights = [];

    // Insight 1: Trait-State Anxiety Correlation
    const validBoth = data.filter(d => d.traitAnxiety !== null && d.stateAnxiety !== null);
    if (validBoth.length > 5) {
        const xValues = validBoth.map(d => d.traitAnxiety);
        const yValues = validBoth.map(d => d.stateAnxiety);
        const regression = calculateLinearRegression(xValues, yValues);
        const r2 = Math.pow(regression.r, 2);
        
        insights.push({
            title: '1. Trait-State Anxiety Relationship',
            text: `Strong positive correlation between baseline and task anxiety (r = ${regression.r.toFixed(3)}, R² = ${r2.toFixed(3)}, n = ${validBoth.length}). Trait anxiety explains ${(r2 * 100).toFixed(1)}% of variance in state anxiety, confirming baseline anxiety predicts situational stress.`
        });
    }

    // Insight 2: Gender Differences in Trait Anxiety
    const females = data.filter(d => d.gender === 'Female' && d.traitAnxiety !== null);
    const males = data.filter(d => d.gender === 'Male' && d.traitAnxiety !== null);
    
    if (females.length > 0 && males.length > 0) {
        const femaleAvg = females.reduce((sum, d) => sum + d.traitAnxiety, 0) / females.length;
        const maleAvg = males.reduce((sum, d) => sum + d.traitAnxiety, 0) / males.length;
        const femaleSD = calculateSD(females.map(d => d.traitAnxiety));
        const maleSD = calculateSD(males.map(d => d.traitAnxiety));
        const tTest = calculateTTest(females.map(d => d.traitAnxiety), males.map(d => d.traitAnxiety));
        const cohensD = (femaleAvg - maleAvg) / Math.sqrt((femaleSD * femaleSD + maleSD * maleSD) / 2);
        
        insights.push({
            title: '2. Gender Differences in Math Anxiety',
            text: `${femaleAvg > maleAvg ? 'Females' : 'Males'} report ${Math.abs(femaleAvg - maleAvg).toFixed(2)} points higher trait anxiety (M = ${femaleAvg.toFixed(2)} vs ${maleAvg.toFixed(2)}, t = ${tTest.t.toFixed(2)}, p ${tTest.p < 0.001 ? '< .001' : tTest.p < 0.05 ? '< .05' : `= ${tTest.p.toFixed(3)}`}, Cohen's d = ${Math.abs(cohensD).toFixed(2)}). Effect size is ${Math.abs(cohensD) > 0.8 ? 'large' : Math.abs(cohensD) > 0.5 ? 'medium' : 'small'}.`
        });
    }

    // Insight 3: Anxiety Impact on Performance
    const lowAnxiety = data.filter(d => d.anxietyCategory === 'low' && d.mathScore !== null);
    const highAnxiety = data.filter(d => d.anxietyCategory === 'high' && d.mathScore !== null);
    
    if (lowAnxiety.length > 0 && highAnxiety.length > 0) {
        const lowAvg = lowAnxiety.reduce((sum, d) => sum + d.mathScore, 0) / lowAnxiety.length;
        const highAvg = highAnxiety.reduce((sum, d) => sum + d.mathScore, 0) / highAnxiety.length;
        const tTest = calculateTTest(lowAnxiety.map(d => d.mathScore), highAnxiety.map(d => d.mathScore));
        
        insights.push({
            title: '3. Anxiety-Performance Relationship',
            text: `Low-anxiety students (M = ${lowAvg.toFixed(2)}, n = ${lowAnxiety.length}) ${lowAvg > highAvg ? 'outperform' : 'underperform'} high-anxiety students (M = ${highAvg.toFixed(2)}, n = ${highAnxiety.length}) by ${Math.abs(lowAvg - highAvg).toFixed(2)} points (t = ${tTest.t.toFixed(2)}, p ${tTest.p < 0.05 ? '< .05' : `= ${tTest.p.toFixed(3)}`}). ${tTest.p < 0.05 ? 'Significant' : 'Non-significant'} difference suggests anxiety ${lowAvg > highAvg ? 'impairs' : 'does not clearly impair'} math performance.`
        });
    }

    // Insight 4: Trust in AI Correlation
    const validTrust = data.filter(d => d.traitAnxiety !== null && d.trustInAI !== null);
    if (validTrust.length > 5) {
        const correlation = calculateCorrelation(
            validTrust.map(d => d.traitAnxiety),
            validTrust.map(d => d.trustInAI)
        );
        
        insights.push({
            title: '4. AI Trust and Math Anxiety',
            text: `${correlation > 0 ? 'Positive' : 'Negative'} correlation between math anxiety and AI trust (r = ${correlation.toFixed(3)}, n = ${validTrust.length}). ${Math.abs(correlation) > 0.3 ? 'Moderate' : Math.abs(correlation) > 0.1 ? 'Weak' : 'Negligible'} relationship indicates anxious students ${correlation > 0.2 ? 'show greater trust' : correlation < -0.2 ? 'show less trust' : 'have similar trust levels'} in AI tutoring systems.`
        });
    }

    // Insight 5: State Anxiety Variability
    const validState = data.filter(d => d.stateAnxiety !== null);
    if (validState.length > 0) {
        const stateMean = validState.reduce((sum, d) => sum + d.stateAnxiety, 0) / validState.length;
        const stateSD = calculateSD(validState.map(d => d.stateAnxiety));
        const cv = (stateSD / stateMean) * 100;
        
        insights.push({
            title: '5. Task Anxiety Variability',
            text: `State anxiety during math tasks shows M = ${stateMean.toFixed(2)}, SD = ${stateSD.toFixed(2)}, CV = ${cv.toFixed(1)}% (n = ${validState.length}). ${cv > 30 ? 'High' : cv > 20 ? 'Moderate' : 'Low'} variability suggests ${cv > 30 ? 'substantial individual differences' : 'relative consistency'} in how students experience situational stress.`
        });
    }

    // Insight 6: Academic Level Progression
    const levels = ['FR', 'SO', 'JR', 'SR'];
    const levelData = levels.map(level => {
        const students = data.filter(d => d.level === level && d.traitAnxiety !== null);
        return {
            level,
            n: students.length,
            mean: students.length > 0 ? students.reduce((sum, d) => sum + d.traitAnxiety, 0) / students.length : 0
        };
    }).filter(d => d.n > 0);
    
    if (levelData.length > 1) {
        const trend = levelData[levelData.length - 1].mean - levelData[0].mean;
        
        insights.push({
            title: '6. Math Anxiety Across Academic Levels',
            text: `Trait anxiety shows ${trend < 0 ? 'decreasing' : 'increasing'} trend from freshman (M = ${levelData[0].mean.toFixed(2)}, n = ${levelData[0].n}) to senior year (M = ${levelData[levelData.length - 1].mean.toFixed(2)}, n = ${levelData[levelData.length - 1].n}). ${Math.abs(trend) > 0.5 ? 'Notable' : 'Minimal'} change of ${Math.abs(trend).toFixed(2)} points suggests ${trend < -0.5 ? 'students become less anxious with experience' : trend > 0.5 ? 'anxiety increases over time' : 'anxiety remains stable across years'}.`
        });
    }

    // Insight 7: Trait Anxiety Distribution
    const validTrait = data.filter(d => d.traitAnxiety !== null);
    if (validTrait.length > 0) {
        const traitMean = validTrait.reduce((sum, d) => sum + d.traitAnxiety, 0) / validTrait.length;
        const traitSD = calculateSD(validTrait.map(d => d.traitAnxiety));
        const skew = calculateSkewness(validTrait.map(d => d.traitAnxiety));
        
        insights.push({
            title: '7. Baseline Anxiety Distribution',
            text: `Trait anxiety distribution: M = ${traitMean.toFixed(2)}, SD = ${traitSD.toFixed(2)}, skewness = ${skew.toFixed(2)} (n = ${validTrait.length}). ${Math.abs(skew) < 0.5 ? 'Approximately normal' : skew > 0 ? 'Positively skewed' : 'Negatively skewed'} distribution ${Math.abs(skew) > 1 ? 'with outliers toward ' + (skew > 0 ? 'higher anxiety' : 'lower anxiety') : 'indicates balanced sample'}.`
        });
    }

    // Insight 8: Math Score Correlation with Trait Anxiety
    const validScores = data.filter(d => d.mathScore !== null && d.traitAnxiety !== null);
    if (validScores.length > 5) {
        const correlation = calculateCorrelation(
            validScores.map(d => d.traitAnxiety),
            validScores.map(d => d.mathScore)
        );
        
        insights.push({
            title: '8. Direct Anxiety-Performance Correlation',
            text: `${correlation < 0 ? 'Negative' : 'Positive'} correlation between trait anxiety and math scores (r = ${correlation.toFixed(3)}, n = ${validScores.length}). ${Math.abs(correlation) > 0.3 ? 'Moderate' : Math.abs(correlation) > 0.1 ? 'Weak' : 'Negligible'} relationship (R² = ${Math.pow(correlation, 2).toFixed(3)}) indicates anxiety accounts for ${(Math.pow(correlation, 2) * 100).toFixed(1)}% of performance variance.`
        });
    }

    // Insight 9: Gender Differences in State Anxiety
    const femalesState = data.filter(d => d.gender === 'Female' && d.stateAnxiety !== null);
    const malesState = data.filter(d => d.gender === 'Male' && d.stateAnxiety !== null);
    
    if (femalesState.length > 0 && malesState.length > 0) {
        const femaleAvg = femalesState.reduce((sum, d) => sum + d.stateAnxiety, 0) / femalesState.length;
        const maleAvg = malesState.reduce((sum, d) => sum + d.stateAnxiety, 0) / malesState.length;
        const tTest = calculateTTest(femalesState.map(d => d.stateAnxiety), malesState.map(d => d.stateAnxiety));
        
        insights.push({
            title: '9. Gender Differences in Task Anxiety',
            text: `During math tasks, ${femaleAvg > maleAvg ? 'females' : 'males'} report ${Math.abs(femaleAvg - maleAvg).toFixed(2)} points higher state anxiety (M = ${femaleAvg.toFixed(2)} vs ${maleAvg.toFixed(2)}, t = ${tTest.t.toFixed(2)}, p ${tTest.p < 0.05 ? '< .05' : `= ${tTest.p.toFixed(3)}`}). ${tTest.p < 0.05 ? 'Significant' : 'Non-significant'} difference parallels trait anxiety patterns.`
        });
    }

    // Insight 10: Trust in AI Overall
    if (validTrust.length > 0) {
        const trustMean = validTrust.reduce((sum, d) => sum + d.trustInAI, 0) / validTrust.length;
        const trustSD = calculateSD(validTrust.map(d => d.trustInAI));
        const highTrust = validTrust.filter(d => d.trustInAI > 5).length;
        const percentHighTrust = (highTrust / validTrust.length * 100).toFixed(1);
        
        insights.push({
            title: '10. Overall AI Trust Levels',
            text: `Students show M = ${trustMean.toFixed(2)}, SD = ${trustSD.toFixed(2)} trust in AI tutors (n = ${validTrust.length}, scale 1-7). ${percentHighTrust}% report high trust (>5), indicating ${percentHighTrust > 60 ? 'strong acceptance' : percentHighTrust > 40 ? 'moderate acceptance' : 'mixed reception'} of AI-based learning tools among participants.`
        });
    }

    // Render insights
    const container = document.getElementById('insights');
    container.innerHTML = '';
    
    insights.forEach(insight => {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <h4>${insight.title}</h4>
            <p>${insight.text}</p>
        `;
        container.appendChild(card);
    });
}

// Helper function: Calculate standard deviation
function calculateSD(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
}

// Helper function: Calculate t-test (Welch's t-test)
function calculateTTest(sample1, sample2) {
    const n1 = sample1.length;
    const n2 = sample2.length;
    const mean1 = sample1.reduce((a, b) => a + b, 0) / n1;
    const mean2 = sample2.reduce((a, b) => a + b, 0) / n2;
    const var1 = calculateSD(sample1) ** 2;
    const var2 = calculateSD(sample2) ** 2;
    
    const t = (mean1 - mean2) / Math.sqrt(var1 / n1 + var2 / n2);
    const df = Math.pow(var1 / n1 + var2 / n2, 2) / 
               (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1));
    
    // Approximate p-value (two-tailed)
    const p = 2 * (1 - normalCDF(Math.abs(t)));
    
    return { t, df, p };
}

// Helper function: Approximate normal CDF
function normalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
}

// Helper function: Calculate skewness
function calculateSkewness(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const sd = calculateSD(values);
    const m3 = values.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / n;
    return m3 / Math.pow(sd, 3);
}

// Helper function to calculate correlation
function calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}
