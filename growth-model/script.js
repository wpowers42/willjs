const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

const BUTTON_ROW_HEIGHT = 70;
const TITLE_HEIGHT = 35;
const BUTTON_HEIGHT = 30;
const BUTTON_WIDTH = 80;
const BUTTON_GAP = 20;
const COLUMNS = 7;
const ROWS = 6;
const GRID_SIZE = COLUMNS * ROWS;
const GAP = 10;
const CELL_WIDTH = (canvas.width - GAP * (COLUMNS + 1)) / COLUMNS;
const CELL_HEIGHT = (canvas.height - GAP * (ROWS + 1) - BUTTON_ROW_HEIGHT) / ROWS;

// Colors
const COLORS = {
    inactive: '#d3d3d3',
    active: '#a3e635',
    acquired: '#60a5fa',
    text: '#111827',
    lightText: '#6b7280'
};

// Keep track of current data
let currentData = [];

function createTables(db) {
    const sqlActiveDates = `
                CREATE TABLE IF NOT EXISTS active_dates AS
                    WITH cnt(i) AS (
                        SELECT 1 AS i UNION SELECT i+1 FROM cnt WHERE i < ${GRID_SIZE}
                    )

                    SELECT
                        i as id
                      , case when i = 1 then 1 else 0 end as active
                    FROM cnt
                ;
            `;

    db.exec(sqlActiveDates);

    const sqlDailySummaryView = `
                drop view if exists daily_summary;
                create view daily_summary as
                    with cte as (
                        select
                            id
                          , active as is_1d_active
                          , sum(active) over (order by id rows 6 preceding) as active_days_1d7
                          , sum(active) over (order by id rows 6 preceding) > 0 as is_7d_active
                          , sum(active) over (order by id rows 27 preceding) > 0 as is_28d_active
                          , sum(active) over (order by id rows between 13 preceding and 7 preceding) > 0 as is_7d_active__last_week
                        from active_dates
                    )
                      , cte2 as (
                            select
                                *
                            , min(is_7d_active) over (order by id rows between 7 preceding and 1 preceding) = 1 as has_unbroken_1d7_streak
                            from cte
                    )

                    select
                        cte2.*
                      , case
                            when not is_7d_active and is_28d_active then 'At Risk'
                            when not is_7d_active and not is_28d_active then 'Inactive'
                            when active_days_1d7 >= 2 then 'Current'
                            when is_7d_active__last_week is null then 'New'
                            when has_unbroken_1d7_streak then 'Current'
                            when not has_unbroken_1d7_streak then 'Reactivated'
                            else 'SHOULD NOT APPEAR'
                        end as state
                    from cte2
                    order by id;
            `;

    db.exec(sqlDailySummaryView);
}

function drawCell(x, y, width, height, data) {
    ctx.save();

    // Cell background
    ctx.fillStyle = data.is_1d_active ? COLORS.active :
        (data.id === 1 ? COLORS.acquired : COLORS.inactive);
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();

    // Draw day number
    ctx.fillStyle = COLORS.lightText;
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`d${data.id}`, x + 4, y + 12);

    // Draw state text
    ctx.fillStyle = COLORS.text;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.state || '', x + width / 2, y + height / 2 + 10);

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
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);

    ctx.restore();
}

function getGridPosition(index) {
    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;
    const x = GAP + col * (CELL_WIDTH + GAP);
    const y = GAP + row * (CELL_HEIGHT + GAP) + BUTTON_ROW_HEIGHT; // Add offset for buttons
    return { x, y };
}

function handleClick(e, db) {
    const rect = canvas.getBoundingClientRect();
    const rawClickX = e.clientX;
    const rawClickY = e.clientY;

    // adjust for the canvas scale (rect vs canvas)
    const scaleFactorX = canvas.width / rect.width;
    const scaleFactorY = canvas.height / rect.height;

    const clickX = rawClickX * scaleFactorX - rect.left;
    const clickY = rawClickY * scaleFactorY - rect.top;

    // Check button clicks
    if (clickY > TITLE_HEIGHT && clickY < TITLE_HEIGHT + BUTTON_HEIGHT) {
        const totalButtonWidth = (BUTTON_WIDTH * 2 + BUTTON_GAP);
        const startX = (canvas.width - totalButtonWidth) / 2;
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
    const row = Math.floor((clickY - BUTTON_ROW_HEIGHT) / (CELL_HEIGHT + GAP));
    const col = Math.floor(clickX / (CELL_WIDTH + GAP));
    const index = row * COLUMNS + col;

    // Toggle the state of the clicked cell
    if (index >= 0 && index < GRID_SIZE && index !== 0) {
        toggleDay(index, db);
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.save();
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Active User State Model', canvas.width / 2, TITLE_HEIGHT / 2 + 10);
    ctx.restore();

    // Draw buttons - centered
    const totalButtonWidth = (BUTTON_WIDTH * 2 + BUTTON_GAP);
    const startX = (canvas.width - totalButtonWidth) / 2;
    drawButton(startX, TITLE_HEIGHT + 5, BUTTON_WIDTH, BUTTON_HEIGHT, 'Reset');
    drawButton(startX + BUTTON_WIDTH + BUTTON_GAP, TITLE_HEIGHT + 5, BUTTON_WIDTH, BUTTON_HEIGHT, 'Randomize');

    // Draw cells
    currentData.forEach((data, i) => {
        const pos = getGridPosition(i);
        drawCell(pos.x, pos.y, CELL_WIDTH, CELL_HEIGHT, data);
    });
}

function update(db) {
    const sql = `select * from daily_summary`;
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

window.sqlite3InitModule().then(function (sqlite3) {
    globalThis.sqlite3 = sqlite3;
    const oo = sqlite3.oo1;
    const dbStorage = 0 ? 'session' : 'local';
    const db = new oo.JsStorageDb(dbStorage);

    createTables(db);

    // Add click handler
    canvas.addEventListener('click', e => handleClick(e, db));

    // Initial update
    update(db);
});

function reset(db) {
    const sql = `update active_dates set active = 0 where id != 1`;
    db.exec(sql);
    update(db);
}

function randomize(db) {
    reset(db);
    const sql = `update active_dates set active = 1 - active where id != 1 and abs(random()) % 10 = 1`;
    db.exec(sql);
    update(db);
}

function toggleDay(index, db) {
    const sql = `
        update active_dates
        set active = 1 - active
        where id = ${index + 1};
    `;
    db.exec(sql);
    update(db);
}