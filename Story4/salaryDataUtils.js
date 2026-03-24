/**
 * Salary Data Utilities for Data Practitioner Analysis
 * Mirrors the data-loading patterns from Story 1's Next.js framework
 * 
 * Usage in React components:
 *   const data = await loadJSON('/data/salary-by-role-region.json');
 *   const summaries = await loadSalarySummaries();
 */

/**
 * Load JSON file from public/data folder
 * @param {string} path - Path relative to public folder (e.g. '/data/file.json')
 * @returns {Promise<Object>}
 */
export async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

/**
 * Parse CSV text into array of objects
 * @param {string} text - CSV content
 * @returns {Array<Object>}
 */
export function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const values = lines[i].split(',').map(v => v.trim());
    headers.forEach((header, idx) => {
      const value = values[idx];
      obj[header] = isNaN(value) ? value : parseFloat(value);
    });
    data.push(obj);
  }
  
  return data;
}

/**
 * Load CSV file and parse it
 * @param {string} path - Path relative to public folder
 * @returns {Promise<Array<Object>>}
 */
export async function loadCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const text = await res.text();
  return parseCSV(text);
}

/**
 * Load all salary summary data
 * @returns {Promise<Object>} Object with salary_by_role, salary_by_level_role, salary_by_region, salary_region_role
 */
export async function loadSalarySummaries() {
  const [byRole, byLevelRole, byRegion, regionRole] = await Promise.all([
    loadJSON('/data/salary-by-role.json'),
    loadJSON('/data/salary-by-level-role.json'),
    loadJSON('/data/salary-by-region.json'),
    loadJSON('/data/salary-region-role.json')
  ]);
  
  return {
    salary_by_role: byRole,
    salary_by_level_role: byLevelRole,
    salary_by_region: byRegion,
    salary_region_role: regionRole
  };
}

/**
 * Format currency for display
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format currency compact (K, M, B)
 * @param {number} value
 * @returns {string}
 */
export function formatCurrencyCompact(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  const abs = Math.abs(value);
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value)}`;
}

/**
 * Get color for role descriptor (for consistent coloring across visualizations)
 * @param {string} role
 * @returns {string} Hex color code
 */
export function getRoleColor(role) {
  const colors = {
    'Data Scientist': '#6366F1',
    'Data Engineer': '#EC4899',
    'Data Analyst': '#F59E0B',
    'Data Architect': '#8B5CF6',
    'Business Analyst': '#10B981'
  };
  return colors[role] || '#6B7280';
}

/**
 * Get color for career level
 * @param {string} level - 'Junior', 'Mid-Level', or 'Senior'
 * @returns {string} Hex color code
 */
export function getLevelColor(level) {
  const colors = {
    'Junior': '#FBBF24',
    'Mid-Level': '#60A5FA',
    'Senior': '#34D399'
  };
  return colors[level] || '#6B7280';
}

/**
 * Get color for region
 * @param {string} region
 * @returns {string} Hex color code
 */
export function getRegionColor(region) {
  const colors = {
    'Northeast': '#2563EB',
    'Southeast': '#DC2626',
    'Midwest': '#16A34A',
    'Southwest': '#EA580C',
    'West': '#7C3AED',
    'Remote': '#8B5CF6'
  };
  return colors[region] || '#6B7280';
}

/**
 * Transform salary data for bar chart (role)
 * @param {Array<Object>} data - Array of salary records
 * @returns {Object} Chart.js compatible dataset
 */
export function transformForRoleBarChart(data) {
  const roleData = {};
  
  data.forEach(record => {
    if (!roleData[record.role]) {
      roleData[record.role] = [];
    }
    if (record.salary) {
      roleData[record.role].push(record.salary);
    }
  });
  
  const labels = Object.keys(roleData).sort((a, b) =>
    roleData[b].reduce((a, c) => a + c, 0) / roleData[b].length -
    roleData[a].reduce((a, c) => a + c, 0) / roleData[a].length
  );
  
  const datasets = [{
    label: 'Average Salary',
    data: labels.map(role => 
      roleData[role].reduce((a, c) => a + c, 0) / roleData[role].length
    ),
    backgroundColor: labels.map(role => getRoleColor(role)),
    borderColor: labels.map(role => getRoleColor(role)),
    borderWidth: 1
  }];
  
  return { labels, datasets };
}

/**
 * Transform salary data for heatmap (region x role)
 * @param {Object} regionRoleData - salary-region-role.json structure
 * @returns {Object} With labels and matrix for heatmap
 */
export function transformForRegionRoleHeatmap(regionRoleData) {
  const regions = Object.keys(regionRoleData).sort();
  const roles = regions.length > 0 
    ? Array.from(new Set(Object.values(regionRoleData).flatMap(r => Object.keys(r))))
    : [];
  
  const matrix = regions.map(region =>
    roles.map(role => regionRoleData[region]?.[role] || null)
  );
  
  return { regionLabels: regions, roleLabels: roles, matrix };
}

/**
 * Transform salary data for heatmap (level x role)
 * @param {Object} levelRoleData - salary-by-level-role.json structure
 * @returns {Object} With labels and matrix for heatmap
 */
export function transformForLevelRoleHeatmap(levelRoleData) {
  const levelOrder = ['Junior', 'Mid-Level', 'Senior'];
  const roles = Array.from(new Set(
    levelOrder.flatMap(level => Object.keys(levelRoleData[level] || {}))
  )).sort();
  
  const matrix = levelOrder.map(level =>
    roles.map(role => levelRoleData[level]?.[role] || null)
  );
  
  return { levelLabels: levelOrder, roleLabels: roles, matrix };
}

/**
 * Transform salary data for region comparison
 * @param {Array<Object>} data - salary-by-region.json
 * @returns {Object} Chart.js compatible dataset
 */
export function transformForRegionBarChart(data) {
  const sorted = [...data].sort((a, b) => b.mean - a.mean);
  
  return {
    labels: sorted.map(d => d.region),
    datasets: [{
      label: 'Average Salary',
      data: sorted.map(d => d.mean),
      backgroundColor: sorted.map(d => getRegionColor(d.region)),
      borderColor: sorted.map(d => getRegionColor(d.region)),
      borderWidth: 1
    }]
  };
}

/**
 * Helper: hexToRgba for chart transparency effects
 * @param {string} hex - Hex color code
 * @param {number} alpha - Opacity (0-1)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '').trim();
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Helper: Calculate average from array of values
 * @param {Array<number>} values
 * @returns {number}
 */
export function calculateAverage(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Helper: Find min and max values in dataset
 * @param {Array<number>} values
 * @returns {Object} { min, max }
 */
export function findMinMax(values) {
  const valid = values.filter(v => v !== null && v !== undefined && !Number.isNaN(v));
  return {
    min: Math.min(...valid),
    max: Math.max(...valid)
  };
}
