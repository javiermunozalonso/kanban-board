export function flattenBoardTasks(boards) {
    return boards.flatMap((board) => (board.columns || []).flatMap((column) =>
        (column.cards || []).map((card) => ({
            card_id: card.id,
            title: card.title,
            description: card.description,
            position: card.position,
            created_at: card.created_at,
            updated_at: card.updated_at,
            board_id: board.id,
            board_title: board.title,
            board_status: board.status,
            column_id: column.id,
            column_title: column.title,
        })),
    ));
}

function summarizeColumns(columns) {
    const cardsPerColumn = {};
    let done = 0;
    let wip = 0;

    for (const column of columns) {
        const count = (column.cards || []).length;
        cardsPerColumn[column.title] = (cardsPerColumn[column.title] || 0) + count;
        if (column.title === 'DONE' || column.title === 'ARCHIVE') done += count;
        if (column.title === 'WORK IN PROGRESS') wip += count;
    }

    return { cards_per_column: cardsPerColumn, done, wip };
}

export function buildBoardAggregations(boards) {
    const cardsPerColumn = {};
    const boardSummaries = boards.map((board) => {
        const { cards_per_column: distribution, done, wip } = summarizeColumns(board.columns || []);
        const totalCards = Object.values(distribution).reduce((total, count) => total + count, 0);

        for (const [title, count] of Object.entries(distribution)) {
            cardsPerColumn[title] = (cardsPerColumn[title] || 0) + count;
        }

        return {
            board_id: board.id,
            board_title: board.title,
            board_status: board.status,
            total_cards: totalCards,
            cards_per_column: distribution,
            done,
            wip,
        };
    });

    return {
        total_cards: boardSummaries.reduce((total, board) => total + board.total_cards, 0),
        cards_per_column: cardsPerColumn,
        done: boardSummaries.reduce((total, board) => total + board.done, 0),
        wip: boardSummaries.reduce((total, board) => total + board.wip, 0),
        boards: boardSummaries,
    };
}

export function createBoardExportData(boards) {
    return {
        tasks: flattenBoardTasks(boards),
        aggregations: buildBoardAggregations(boards),
    };
}

export function serializeBoardExportJson(boards) {
    return JSON.stringify(createBoardExportData(boards), null, 2);
}

const TASK_CSV_COLUMNS = [
    'card_id', 'title', 'description', 'position', 'created_at', 'updated_at',
    'board_id', 'board_title', 'board_status', 'column_id', 'column_title',
];

function escapeCsvField(value) {
    let text = value == null ? '' : String(value);
    if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text.trimStart())) {
        text = `'${text}`;
    }
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function serializeBoardTasksCsv(tasks) {
    const header = TASK_CSV_COLUMNS.join(',');
    const rows = tasks.map((task) => TASK_CSV_COLUMNS
        .map((column) => escapeCsvField(task[column]))
        .join(','));
    return [header, ...rows].join('\r\n');
}

export async function createBoardExportWorkbook(boards) {
    const { default: ExcelJS } = await import('exceljs');
    const { tasks, aggregations } = createBoardExportData(boards);
    const workbook = new ExcelJS.Workbook();
    const taskSheet = workbook.addWorksheet('Tasks');
    taskSheet.addRow(TASK_CSV_COLUMNS);
    tasks.forEach((task) => taskSheet.addRow(TASK_CSV_COLUMNS.map((column) => task[column] ?? '')));
    taskSheet.views = [{ state: 'frozen', ySplit: 1 }];

    const dashboardSheet = workbook.addWorksheet('Dashboard');
    dashboardSheet.addRows([
        ['metric', 'value'],
        ['total_cards', aggregations.total_cards],
        ['done', aggregations.done],
        ['wip', aggregations.wip],
        [],
        ['column_title', 'cards'],
    ]);
    for (const [title, count] of Object.entries(aggregations.cards_per_column)) {
        dashboardSheet.addRow([title, count]);
    }
    dashboardSheet.addRow([]);
    const boardHeaders = ['board_id', 'board_title', 'board_status', 'total_cards', 'done', 'wip'];
    const columnTitles = Object.keys(aggregations.cards_per_column);
    dashboardSheet.addRow([...boardHeaders, ...columnTitles]);
    for (const board of aggregations.boards) {
        dashboardSheet.addRow([
            board.board_id,
            board.board_title,
            board.board_status,
            board.total_cards,
            board.done,
            board.wip,
            ...columnTitles.map((title) => board.cards_per_column[title] || 0),
        ]);
    }

    return workbook;
}
