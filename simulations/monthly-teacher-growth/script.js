const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// High-DPI canvas setup
const dpr = window.devicePixelRatio || 1;
const displayWidth = 1600;
const displayHeight = 600;

// Set actual canvas size in memory (scaled for high-DPI)
canvas.width = displayWidth * dpr;
canvas.height = displayHeight * dpr;

// Set display size (CSS pixels)
canvas.style.width = displayWidth + 'px';
canvas.style.height = displayHeight + 'px';

// Scale the drawing context so everything draws at the correct size
ctx.scale(dpr, dpr);

// Use the display dimensions for all calculations
const CANVAS_WIDTH = displayWidth;
const CANVAS_HEIGHT = displayHeight;

// Canvas responsive sizing functions
function calculateCanvasSize() {
    const aspectRatio = 600 / 1600; // 0.375 (height/width ratio)
    const margin = 40; // Account for body margins and scrollbars
    const maxWidth = window.innerWidth - margin;
    const maxHeight = window.innerHeight - 250; // Leave space for legend
    
    let displayWidth = Math.min(1600, maxWidth);
    let displayHeight = displayWidth * aspectRatio;
    
    // If height would be too tall, scale down based on height
    if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = displayHeight / aspectRatio;
    }
    
    return { width: Math.floor(displayWidth), height: Math.floor(displayHeight) };
}

function applyCanvasSize() {
    const size = calculateCanvasSize();
    canvas.style.width = size.width + 'px';
    canvas.style.height = size.height + 'px';
}

const BUTTON_ROW_HEIGHT = 80;
const TITLE_HEIGHT = 40;
const BUTTON_HEIGHT = 35;
const BUTTON_WIDTH = 90;
const BUTTON_GAP = 20;
const COLUMNS = 12;
const ROWS = 4;
const GRID_SIZE = COLUMNS * ROWS;
const GAP = 12;
const CELL_WIDTH = (CANVAS_WIDTH - GAP * (COLUMNS + 1)) / COLUMNS;
const CELL_HEIGHT = (CANVAS_HEIGHT - GAP * (ROWS + 1) - BUTTON_ROW_HEIGHT) / ROWS;

// Colors for different states
const COLORS = {
    new: '#10b981',           // Green - New teachers
    returning: '#059669',     // Dark green - Returning teachers
    resurrected: '#84cc16',   // Lime - Resurrected teachers
    churned: '#f59e0b',       // Amber - Churned teachers
    dormant: '#6b7280',       // Gray - Dormant teachers
    never_activated: '#d1d5db', // Light gray - Never activated
    other_not_active: '#9ca3af', // Medium gray - Other not currently active
    current_month: '#3b82f6', // Blue - Current month highlight
    text: '#111827',
    lightText: '#6b7280'
};

// Keep track of current data
let currentData = [];

// Generate month labels for Jan 2021 - Dec 2024 (4 years)
function generateMonthLabels() {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let monthId = 1;
    
    for (let year = 2021; year <= 2024; year++) {
        for (let month = 0; month < 12; month++) {
            const date = new Date(year, month, 1);
            const yearShort = year.toString().slice(-2);
            months.push({
                id: monthId++,
                label: `${monthNames[month]} ${yearShort}`,
                date: date,
                isCurrent: false // Remove current month highlighting
            });
        }
    }
    
    return months;
}

const MONTH_LABELS = generateMonthLabels();

// Debug: log the first 12 months to verify order
console.log('First 12 months (2021):', MONTH_LABELS.slice(0, 12).map(m => m.label));

function createTables(db) {
    // Check if table exists and has data
    let hasData = false;
    try {
        const checkSql = `SELECT COUNT(*) as count FROM monthly_data;`;
        db.exec({
            sql: checkSql,
            rowMode: 'object',
            callback: function(row) {
                hasData = row.count > 0;
            }
        });
    } catch (e) {
        // Table doesn't exist, will create it
        hasData = false;
    }
    
    if (!hasData) {
        // Only drop and recreate if no data exists
        const sqlDropTable = `DROP TABLE IF EXISTS monthly_data;`;
        db.exec(sqlDropTable);
        
        // Create monthly data table
        const sqlMonthlyData = `
            CREATE TABLE monthly_data (
                month_id INTEGER PRIMARY KEY,
                month_label TEXT,
                communicated_l28 INTEGER DEFAULT 0,
                date_value TEXT
            );
        `;
        db.exec(sqlMonthlyData);

        // Insert month data with default values
        MONTH_LABELS.forEach(month => {
            const sql = `
                INSERT INTO monthly_data 
                (month_id, month_label, communicated_l28, date_value)
                VALUES (?, ?, ?, ?)
            `;
            db.exec({
                sql: sql,
                bind: [month.id, month.label, month.isCurrent ? 1 : 0, month.date.toISOString()]
            });
        });
    }

    createGrowthView(db);
}

function getStateColor(state, isCurrentMonth) {
    switch (state) {
        case 'New': return COLORS.new;
        case 'Returning': return COLORS.returning;
        case 'Resurrected': return COLORS.resurrected;
        case 'Churned': return COLORS.churned;
        case 'Dormant': return COLORS.dormant;
        case 'Never_activated': return COLORS.never_activated;
        case 'At_Risk': return COLORS.other_not_active;
        default: return COLORS.never_activated;
    }
}

function drawCell(x, y, width, height, data) {
    ctx.save();

    // Cell background
    const cellColor = getStateColor(data.state, data.is_current_month);
    ctx.fillStyle = cellColor;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();

    // Draw month label
    ctx.fillStyle = COLORS.lightText;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(data.month_label, Math.round(x + 5), Math.round(y + 14));

    // Draw state text with abbreviations and wrapping
    ctx.fillStyle = COLORS.text;
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    
    const stateText = getAbbreviatedState(data.state);
    const lines = wrapText(ctx, stateText, width - 8);
    
    const lineHeight = 14;
    const totalHeight = lines.length * lineHeight;
    const startY = y + (height - totalHeight) / 2 + lineHeight;
    
    lines.forEach((line, index) => {
        ctx.fillText(line, Math.round(x + width / 2), Math.round(startY + index * lineHeight));
    });

    // Draw L28 indicator if active
    if (data.communicated_l28) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('L28', Math.round(x + width - 5), Math.round(y + height - 5));
    }

    ctx.restore();
}

function drawButton(x, y, width, height, text) {
    ctx.save();

    // Button background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();
    ctx.stroke();

    // Button text
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, Math.round(x + width / 2), Math.round(y + height / 2));

    ctx.restore();
}

function getGridPosition(index) {
    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;
    const x = GAP + col * (CELL_WIDTH + GAP);
    const y = GAP + row * (CELL_HEIGHT + GAP) + BUTTON_ROW_HEIGHT;
    return { x, y };
}

function handleClick(e, db) {
    const rect = canvas.getBoundingClientRect();
    
    // Get click position relative to canvas display size
    const clickX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const clickY = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    // Check button clicks
    if (clickY >= TITLE_HEIGHT + 5 && clickY <= TITLE_HEIGHT + 5 + BUTTON_HEIGHT) {
        const totalButtonWidth = (BUTTON_WIDTH * 2 + BUTTON_GAP);
        const startX = (CANVAS_WIDTH - totalButtonWidth) / 2;
        if (clickX >= startX && clickX <= startX + BUTTON_WIDTH) {
            reset(db);
            return;
        }
        if (clickX >= startX + BUTTON_WIDTH + BUTTON_GAP && clickX <= startX + totalButtonWidth) {
            randomize(db);
            return;
        }
    }

    // Calculate the index of the clicked cell
    // Account for the initial GAP and proper cell positioning
    const adjustedY = clickY - BUTTON_ROW_HEIGHT - GAP;
    const adjustedX = clickX - GAP;
    
    // Check if click is within the grid area
    if (adjustedX >= 0 && adjustedY >= 0) {
        const col = Math.floor(adjustedX / (CELL_WIDTH + GAP));
        const row = Math.floor(adjustedY / (CELL_HEIGHT + GAP));
        
        // Verify the click is actually within a cell (not in the gap)
        const cellStartX = col * (CELL_WIDTH + GAP);
        const cellStartY = row * (CELL_HEIGHT + GAP);
        
        const relativeX = adjustedX - cellStartX;
        const relativeY = adjustedY - cellStartY;
        
        if (relativeX < CELL_WIDTH && relativeY < CELL_HEIGHT && 
            col >= 0 && col < COLUMNS && row >= 0 && row < ROWS) {
            const index = row * COLUMNS + col;
            toggleMonth(index + 1, db);
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw title
    ctx.save();
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Monthly Teacher Growth Accounting', Math.round(CANVAS_WIDTH / 2), Math.round(TITLE_HEIGHT / 2 + 12));
    ctx.restore();

    // Draw buttons - centered
    const totalButtonWidth = (BUTTON_WIDTH * 2 + BUTTON_GAP);
    const startX = (CANVAS_WIDTH - totalButtonWidth) / 2;
    drawButton(startX, TITLE_HEIGHT + 5, BUTTON_WIDTH, BUTTON_HEIGHT, 'Reset');
    drawButton(startX + BUTTON_WIDTH + BUTTON_GAP, TITLE_HEIGHT + 5, BUTTON_WIDTH, BUTTON_HEIGHT, 'Randomize');

    // Draw cells
    currentData.forEach((data, i) => {
        const pos = getGridPosition(i);
        drawCell(pos.x, pos.y, CELL_WIDTH, CELL_HEIGHT, data);
    });
}

function createGrowthView(db) {
    // Create view for growth accounting states
    console.log('Creating growth view with updated classification logic...');
    const sqlGrowthView = `
        DROP VIEW IF EXISTS growth_states;
        CREATE VIEW growth_states AS
        WITH monthly_with_history AS (
            SELECT 
                m.month_id,
                m.month_label,
                m.communicated_l28,
                m.date_value,
                LAG(m.communicated_l28, 12) OVER (ORDER BY m.month_id) as prev_year_same_month,
                SUM(m.communicated_l28) OVER (
                    ORDER BY m.month_id 
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) as total_activations_before,
                SUM(CASE WHEN m2.month_id < (m.month_id - 12) THEN m2.communicated_l28 ELSE 0 END) as activations_before_prev_year,
                SUM(CASE WHEN m2.month_id >= (m.month_id - 12) AND m2.month_id < m.month_id THEN m2.communicated_l28 ELSE 0 END) as activations_since_prev_year,
                0 as is_current_month
            FROM monthly_data m
            LEFT JOIN monthly_data m2 ON 1=1
            GROUP BY m.month_id, m.month_label, m.communicated_l28, m.date_value
        )
        SELECT 
            month_id,
            month_label,
            communicated_l28,
            date_value,
            is_current_month,
            prev_year_same_month,
            total_activations_before,
            activations_before_prev_year,
            activations_since_prev_year,
            CASE 
                WHEN communicated_l28 = 1 AND prev_year_same_month = 1 THEN 'Returning'
                WHEN communicated_l28 = 1 AND prev_year_same_month = 0 AND activations_before_prev_year > 0 THEN 'Resurrected'
                WHEN communicated_l28 = 1 AND (prev_year_same_month IS NULL OR prev_year_same_month = 0) THEN 'New'
                WHEN communicated_l28 = 0 AND prev_year_same_month = 1 THEN 'Churned'
                WHEN (total_activations_before IS NULL OR total_activations_before = 0) AND communicated_l28 = 0 THEN 'Never_activated'
                WHEN communicated_l28 = 0 AND total_activations_before > 0 AND activations_since_prev_year = 0 THEN 'Dormant'
                ELSE 'At_Risk'
            END as state
        FROM monthly_with_history
        ORDER BY month_id;
    `;
    console.log('Executing updated SQL with new CASE logic order: Returning -> Resurrected -> New');
    db.exec(sqlGrowthView);
}

function update(db) {
    // Recreate the view to ensure fresh calculations
    createGrowthView(db);
    
    const sql = `SELECT * FROM growth_states ORDER BY month_id`;
    currentData = [];

    db.exec({
        sql: sql,
        rowMode: 'object',
        callback: function (row) {
            currentData.push(row);
        }
    });

    drawGrid();
}

function reset(db) {
    console.log('Resetting data and forcing view recreation...');
    // Force recreation of tables by dropping them first
    const sqlDropTable = `DROP TABLE IF EXISTS monthly_data;`;
    db.exec(sqlDropTable);
    
    // Now createTables will recreate with fresh data
    createTables(db);
    update(db);
}

function getAbbreviatedState(state) {
    const abbreviations = {
        'Never_activated': 'Never Active',
        'At_Risk': 'At Risk',
        'New': 'New',
        'Returning': 'Returning',
        'Resurrected': 'Resurrected',
        'Churned': 'Churned',
        'Dormant': 'Dormant'
    };
    return abbreviations[state] || state.replace('_', ' ');
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

function randomize(db) {
    reset(db);
    // Create a realistic pattern with some continuity
    const sql = `
        UPDATE monthly_data 
        SET communicated_l28 = CASE 
            WHEN abs(random()) % 10 < 3 THEN 1  -- 30% chance base
            WHEN month_id > 30 AND abs(random()) % 10 < 6 THEN 1  -- Higher chance for recent months
            ELSE 0
        END
    `;
    db.exec(sql);
    update(db);
}

function toggleMonth(monthId, db) {
    const sql = `
        UPDATE monthly_data
        SET communicated_l28 = 1 - communicated_l28
        WHERE month_id = ?;
    `;
    db.exec({
        sql: sql,
        bind: [monthId]
    });
    update(db);
}

// Initialize when SQLite loads
window.sqlite3InitModule().then(function (sqlite3) {
    globalThis.sqlite3 = sqlite3;
    const oo = sqlite3.oo1;
    const dbStorage = 0 ? 'session' : 'local';
    const db = new oo.JsStorageDb(dbStorage);

    createTables(db);

    // Apply responsive canvas sizing
    applyCanvasSize();

    // Add click handler
    canvas.addEventListener('click', e => handleClick(e, db));

    // Add resize handler for responsive behavior
    window.addEventListener('resize', applyCanvasSize);

    // Initial update
    update(db);
});