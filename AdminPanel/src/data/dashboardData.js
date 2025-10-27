/*
  dashboardData.js

  Edit values here to change dashboard cards and chart data.

  Quick tips:
  - Add/remove years in `schoolYears` and provide matching keys in `yearData`.
  - Edit numbers in `yearData["YYYY - YYYY"]` for summary cards.
  - Update arrays inside `getChartDataByYear` to change chart points or colors.
  - This file is pure JS — make edits, save, and the app will pick them up in dev mode.

  Example: to change institutions for 2023 - 2024:
    yearData['2023 - 2024'].institutions = 5100
    - Edit `cardConfig` to change card titles, keys, or descriptions.
    - Edit `chartConfig` to change chart labels, colors, and data structure.
    Example: to add a new year, copy the template below:
      '2025 - 2026': {
        institutions: 0,
        personnel: 0,
        grants: 0,
        tab2: 0,
        tab3: 0,
        tab4: 0
      }
    Example: to change the label for a card, edit cardConfig.summaryCards or cardConfig.smallCards.
*/

// Dashboard data extracted from Home.jsx for easier editing

export const schoolYears = [
  '2024 - 2025',
  '2023 - 2024',
  '2022 - 2023',
  '2021 - 2022',
  '2020 - 2021',
  '2019 - 2020',
  '2018 - 2019'
]

export const yearData = {
  // Example entry for a new year:
  // '2025 - 2026': { institutions: 0, personnel: 0, grants: 0, tab2: 0, tab3: 0, tab4: 0 },
  '2024 - 2025': { institutions: 5095, personnel: 31071, grants: 300, tab2: 12, tab3: 33, tab4: 48 },
  '2023 - 2024': { institutions: 4980, personnel: 29850, grants: 285, tab2: 11, tab3: 31, tab4: 40 },
  '2022 - 2023': { institutions: 4850, personnel: 28500, grants: 270, tab2: 10, tab3: 29, tab4: 38 },
  '2021 - 2022': { institutions: 4720, personnel: 27200, grants: 255, tab2: 9, tab3: 27, tab4: 36 },
  '2020 - 2021': { institutions: 4600, personnel: 26000, grants: 240, tab2: 8, tab3: 25, tab4: 34 },
  '2019 - 2020': { institutions: 4480, personnel: 24800, grants: 225, tab2: 7, tab3: 23, tab4: 32 },
  '2018 - 2019': { institutions: 4350, personnel: 23600, grants: 210, tab2: 6, tab3: 21, tab4: 30 }
}


// Chart configuration and editable data for each chart type
export const chartConfig = {
  grantsData: [
    { name: 'Research', color: '#0033a0' },
    { name: 'Innovation', color: '#b6ccfb' },
    { name: 'Development', color: '#0052cc' },
    { name: 'Community', color: '#7799dd' }
  ],
  yearlyGrantsLabels: ['2019', '2020', '2021', '2022', '2023', '2024'],
  financialMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  priorityAreas: ['Health', 'Tech', 'Education', 'Environment', 'Agriculture'],
  departments: ['Sciences', 'Engineering', 'Medicine', 'Social Sci', 'Humanities'],
  genderCategories: ['Researchers', 'Lead Inv', 'Junior', 'Senior'],
  regions: ['North', 'South', 'East', 'West', 'Central']
}

// Chart data per year (editable, not generated)
// Each financialData entry is now an object: { budget, spent, allocated }
// You can edit all three values for each month below.
export const chartDataByYear = {
  '2024 - 2025': {
    grantsData: [45, 30, 15, 10],
    yearlyGrantsData: [168, 203, 252, 294, 343, 392],
    financialData: [
      { budget: 90000, spent: 85000, allocated: 87000 },
      { budget: 75000, spent: 70000, allocated: 72000 },
      { budget: 80000, spent: 76000, allocated: 78000 },
      { budget: 78000, spent: 70000, allocated: 75000 },
      { budget: 85000, spent: 80000, allocated: 83000 },
      { budget: 90000, spent: 85000, allocated: 88000 }
    ],
    priorityAreasData: [119, 168, 133, 98, 84],
    researchersData: [203, 252, 168, 133, 105],
    genderData: {
      male:   [448, 245, 168, 105],
      female: [203, 119, 133, 119]
    },
    regionData: [203, 168, 224, 189, 252]
  },
  '2023 - 2024': {
    grantsData: [46, 27, 13, 9],
    yearlyGrantsData: [156, 188, 225, 263, 306, 350],
    financialData: [
      { budget: 65000, spent: 60000, allocated: 62000 },
      { budget: 70000, spent: 65000, allocated: 67000 },
      { budget: 75000, spent: 70000, allocated: 73000 },
      { budget: 73000, spent: 68000, allocated: 70000 },
      { budget: 80000, spent: 75000, allocated: 78000 },
      { budget: 85000, spent: 80000, allocated: 83000 }
    ],
    priorityAreasData: [112, 158, 125, 92, 78],
    researchersData: [188, 225, 150, 120, 95],
    genderData: {
      male:   [420, 230, 158, 95],
      female: [190, 112, 125, 112]
    },
    regionData: [188, 150, 200, 170, 225]
  },
  '2022 - 2023': {
    grantsData: [38, 25, 12, 19],
    yearlyGrantsData: [200, 170, 205, 240, 280, 320],
    financialData: [
      { budget: 60000, spent: 55000, allocated: 57000 },
      { budget: 65000, spent: 60000, allocated: 62000 },
      { budget: 70000, spent: 65000, allocated: 67000 },
      { budget: 68000, spent: 63000, allocated: 65000 },
      { budget: 75000, spent: 70000, allocated: 72000 },
      { budget: 80000, spent: 75000, allocated: 78000 }
    ],
    priorityAreasData: [105, 145, 115, 85, 70],
    researchersData: [170, 205, 135, 110, 90],
    genderData: {
      male:   [390, 210, 140, 90],
      female: [180, 100, 120, 100]
    },
    regionData: [170, 135, 180, 155, 205]
  },
  '2021 - 2022': {
    grantsData: [35, 22, 10, 7],
    yearlyGrantsData: [130, 155, 185, 215, 250, 285],
    financialData: [
      { budget: 55000, spent: 50000, allocated: 52000 },
      { budget: 60000, spent: 55000, allocated: 57000 },
      { budget: 65000, spent: 60000, allocated: 62000 },
      { budget: 63000, spent: 58000, allocated: 60000 },
      { budget: 70000, spent: 65000, allocated: 67000 },
      { budget: 75000, spent: 70000, allocated: 73000 }
    ],
    priorityAreasData: [98, 135, 108, 80, 65],
    researchersData: [155, 185, 120, 100, 80],
    genderData: {
      male:   [360, 190, 130, 80],
      female: [160, 90, 110, 90]
    },
    regionData: [155, 120, 165, 140, 185]
  },
  '2020 - 2021': {
    grantsData: [32, 20, 9, 6],
    yearlyGrantsData: [120, 140, 165, 190, 220, 250],
    financialData: [
      { budget: 50000, spent: 45000, allocated: 47000 },
      { budget: 55000, spent: 50000, allocated: 52000 },
      { budget: 60000, spent: 55000, allocated: 57000 },
      { budget: 58000, spent: 53000, allocated: 55000 },
      { budget: 65000, spent: 60000, allocated: 62000 },
      { budget: 70000, spent: 65000, allocated: 67000 }
    ],
    priorityAreasData: [90, 125, 100, 75, 60],
    researchersData: [140, 165, 110, 90, 70],
    genderData: {
      male:   [330, 170, 120, 70],
      female: [140, 80, 100, 80]
    },
    regionData: [140, 110, 150, 125, 165]
  },
  '2019 - 2020': {
    grantsData: [29, 18, 8, 5],
    yearlyGrantsData: [110, 130, 150, 175, 200, 225],
    financialData: [
      { budget: 45000, spent: 40000, allocated: 42000 },
      { budget: 50000, spent: 45000, allocated: 47000 },
      { budget: 55000, spent: 50000, allocated: 52000 },
      { budget: 53000, spent: 48000, allocated: 50000 },
      { budget: 60000, spent: 55000, allocated: 57000 },
      { budget: 65000, spent: 60000, allocated: 62000 }
    ],
    priorityAreasData: [83, 115, 93, 70, 55],
    researchersData: [125, 150, 100, 80, 60],
    genderData: {
      male:   [300, 150, 110, 60],
      female: [120, 70, 90, 70]
    },
    regionData: [125, 100, 135, 110, 145]
  },
  '2018 - 2019': {
    grantsData: [26, 16, 7, 4],
    yearlyGrantsData: [100, 120, 135, 155, 180, 210],
    financialData: [
      { budget: 40000, spent: 35000, allocated: 37000 },
      { budget: 45000, spent: 40000, allocated: 42000 },
      { budget: 50000, spent: 45000, allocated: 47000 },
      { budget: 48000, spent: 43000, allocated: 45000 },
      { budget: 55000, spent: 50000, allocated: 52000 },
      { budget: 60000, spent: 55000, allocated: 57000 }
    ],
    priorityAreasData: [75, 105, 85, 65, 50],
    researchersData: [110, 135, 90, 70, 50],
    genderData: {
      male:   [270, 130, 100, 50],
      female: [100, 60, 80, 60]
    },
    regionData: [110, 90, 120, 95, 125]
  }
}

// Helper to get chart data for a year, using chartConfig and chartDataByYear
export function getChartDataByYear(year) {
  const d = chartDataByYear[year]
  if (!d) return {}
  // compute percent for grants breakdown so Pie/Tooltip can use an explicit percent value
  const rawGrants = Array.isArray(d.grantsData) ? d.grantsData.slice() : []
  const totalGrants = rawGrants.reduce((s, v) => s + (Number(v) || 0), 0) || 0
  const grantsDataWithPercent = chartConfig.grantsData.map((g, i) => {
    const val = Number(rawGrants[i]) || 0
    const percent = totalGrants > 0 ? val / totalGrants : 0
    return { name: g.name, value: val, color: g.color, percent }
  })
  return {
    grantsData: grantsDataWithPercent,
    yearlyGrantsData: chartConfig.yearlyGrantsLabels.map((y, i) => ({ year: y, grants: d.yearlyGrantsData[i] })),
    // Use the editable budget, spent, allocated values directly
    financialData: chartConfig.financialMonths.map((m, i) => {
      const entry = d.financialData[i] || { budget: 0, spent: 0, allocated: 0 }
      return { month: m, budget: entry.budget, spent: entry.spent, allocated: entry.allocated }
    }),
    priorityAreasData: chartConfig.priorityAreas.map((area, i) => ({ area, projects: d.priorityAreasData[i] })),
    researchersData: chartConfig.departments.map((department, i) => ({ department, count: d.researchersData[i] })),
    genderData: chartConfig.genderCategories.map((category, i) => ({ category, male: d.genderData.male[i], female: d.genderData.female[i] })),
    regionData: chartConfig.regions.map((region, i) => ({ region, projects: d.regionData[i] }))
  }
}

// Template for adding new years quickly
export const yearTemplate = {
  institutions: 0,
  personnel: 0,
  grants: 0,
  tab2: 0,
  tab3: 0,
  tab4: 0
}

// Card labels and small card config — edit titles/descriptions here
export const cardConfig = {
  summaryCards: [
    {
      key: 'institutions',
      title: 'Institutions',
      desc: 'Description'
    },
    {
      key: 'personnel',
      title: 'Personnel',
      desc: 'Description'
    }
  ],
  smallCards: [
    { key: 'grants', title: 'Grants Awarded' },
    { key: 'tab2', title: 'Active Projects' },
    { key: 'tab3', title: 'Completed Projects' },
    { key: 'tab4', title: 'Partner Institutions' }
  ]
}

// Lightweight validation: checks for missing year keys and chart shapes and logs warnings
export function validateDashboardData() {
  const warnings = []
  if (!Array.isArray(schoolYears)) warnings.push('schoolYears should be an array')

  const requiredYearKeys = ['institutions', 'personnel', 'grants', 'tab2', 'tab3', 'tab4']
  Object.keys(yearData).forEach((yr) => {
    const o = yearData[yr]
    requiredYearKeys.forEach((k) => {
      if (!(k in o)) warnings.push(`${yr} is missing key: ${k}`)
    })
  })

  // Check chartDataByYear consistency
  Object.entries(chartDataByYear).forEach(([yr, d]) => {
    // Gender data check
    if (d.genderData) {
      const nCat = chartConfig.genderCategories.length
      if (!Array.isArray(d.genderData.male) || d.genderData.male.length !== nCat)
        warnings.push(`${yr} genderData.male should have ${nCat} values (has ${d.genderData.male ? d.genderData.male.length : 0})`)
      if (!Array.isArray(d.genderData.female) || d.genderData.female.length !== nCat)
        warnings.push(`${yr} genderData.female should have ${nCat} values (has ${d.genderData.female ? d.genderData.female.length : 0})`)
    }
    // Other chart data checks
    [
      ['grantsData', chartConfig.grantsData.length],
      ['yearlyGrantsData', chartConfig.yearlyGrantsLabels.length],
      ['financialData', chartConfig.financialMonths.length],
      ['priorityAreasData', chartConfig.priorityAreas.length],
      ['researchersData', chartConfig.departments.length],
      ['regionData', chartConfig.regions.length]
    ].forEach(([key, len]) => {
      if (!Array.isArray(d[key]) || d[key].length !== len)
        warnings.push(`${yr} ${key} should have ${len} values (has ${d[key] ? d[key].length : 0})`)
    })
  })

  if (schoolYears.length) {
    try {
      const sample = getChartDataByYear(schoolYears[0])
      const chartKeys = ['grantsData','yearlyGrantsData','financialData','priorityAreasData','researchersData','genderData','regionData']
      chartKeys.forEach(k => { if (!Array.isArray(sample[k]) && k !== 'genderData') warnings.push(`getChartDataByYear(${schoolYears[0]}) missing/invalid ${k}`) })
    } catch (err) {
      warnings.push('getChartDataByYear threw: ' + (err && err.message ? err.message : String(err)))
    }
  }

  if (warnings.length) console.warn('Dashboard data validation warnings:', warnings)
  return warnings
}
