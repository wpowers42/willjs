const GRID_SIZE = 42;

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

window.sqlite3InitModule().then(function (sqlite3) {
    // The module is now loaded and the sqlite3 namespace
    // object was passed to this function.
    globalThis.sqlite3 = sqlite3;

    const oo = sqlite3.oo1 /*high-level OO API*/;

    const dbStorage = 0 ? 'session' : 'local';
    const theStore = 's' === dbStorage[0] ? sessionStorage : localStorage;
    const db = new oo.JsStorageDb(dbStorage);

    createTables(db);
    main(db);
});

function main(db) {
    const GRID = document.getElementById('activityGrid');

    const resetGrid = document.getElementById('resetGrid');

    resetGrid.addEventListener('click', () => reset(db));

    const randomizeGrid = document.getElementById('randomizeGrid');

    randomizeGrid.addEventListener('click', () => randomize(db));

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

    function update(db) {
        const sql = `select * from daily_summary`;

        db.exec({
            sql: sql,
            rowMode: 'object',
            callback: function (row) {
                updateGrid(GRID, row);
            }
        });
    }


    function toggleDay(index, db) {

        sql = `
                    update active_dates
                    set active = 1 - active
                    where id = ${index + 1};
                `;

        db.exec(sql);
        update(db);
    }


    // Create grid cells
    for (let i = 0; i < GRID_SIZE; i++) {
        const cell = document.createElement('div');

        // Add dX text to top left corner of cell
        const day = document.createElement('div');
        day.classList.add('day');
        day.textContent = `d${i + 1}`;
        cell.appendChild(day);

        const state = document.createElement('div');
        state.classList.add('state');

        cell.classList.add('cell');
        cell.dataset.index = i;
        if (i === 0) {
            cell.classList.add('acquired');
        } else {
            cell.addEventListener('click', () => toggleDay(i, db));
        }

        cell.appendChild(state);
        GRID.appendChild(cell);
    }


    // Update the grid display
    function updateGrid(GRID, day) {
        const cell = GRID.children[day.id - 1];

        if (day.is_1d_active) {
            cell.classList.add('active');
        } else {
            cell.classList.remove('active');
        }

        cell.children[1].textContent = day.state;

    }

    update(db);
}