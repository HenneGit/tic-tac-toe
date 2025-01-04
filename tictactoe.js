(() => {

    const fieldLookUp = new Map([
        ['0', [0, 0]],
        ['1', [0, 1]],
        ['2', [0, 2]],
        ['3', [1, 0]],
        ['4', [1, 1]],
        ['5', [1, 2]],
        ['6', [2, 0]],
        ['7', [2, 1]],
        ['8', [2, 2]]]);
    let isSinglePlayer = false;
    let isSingleGame = false;
    let player = 'circle';
    document.addEventListener('DOMContentLoaded', () => {
        setUp();
    });
    let gameMode = "multi";
    let isGlobalWin = false;
    const setUp = () => {
        let singleLink = getElementById('game-mode-single');
        singleLink.addEventListener('click', () => {
            gameMode = 'single';
            startSingleGame();
        })
        let multiLink = getElementById('game-mode-multi');
        multiLink.addEventListener('click', () => {
            gameMode = 'multi';
            startMultiFieldGame();
        })
    };
    const clearBoard = (root) => {
        let board = getOuterBoard();
        if (board) {
            root.removeChild(board);
        }
    };

    const startMultiFieldGame = () => {
        let root = getElementById('root');
        clearBoard(root);
        createBoard('main', root, 'outer-board-container', false);
        let fields = Array.from(getOuterBoard().children);
        for (let i = 0; i < fields.length; i++) {
            createBoard(i, fields[i], 'inner-board-container', true);
        }
    }

    const startSingleGame = () => {
        let root = getElementById('root');
        isSingleGame = true;
        clearBoard(root);
        createBoard('main', root, 'outer-board-container', true);

    };

    const switchPlayer = () => {
        return player === 'circle' ? 'x-mark' : 'circle';
    };


    const createBoard = (boardId, root, containerClass, isSingleGame) => {
        const boardContainer = document.createElement('div');
        boardContainer.id = 'board-container' + '-' + boardId;
        boardContainer.classList.add(containerClass, 'board-container');
        let rowNumber = 0;
        let columnNumber = 0;
        for (let i = 0; i < 9; i++) {
            if (columnNumber === 3) {
                rowNumber++;
                columnNumber = 0;
            }
            let element = document.createElement('div');
            element.id = i + "-" + boardId;
            if (isSingleGame) {
                attachMouseOverEvents(element);
                element.addEventListener('click', onFieldClick);
            }
            element.classList.add('field', 'row' + rowNumber, 'column' + columnNumber);
            boardContainer.append(element);
            columnNumber++;
        }
        root.append(boardContainer)
    };

    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const playWinAnimation = async (winningFields) => {
        const addClassWithDelay = async (elements) => {
            for (const field of elements) {
                field.firstChild.classList.add('hopping-icon');
                await pause(100);
            }
            await pause(1000);
        };
        return addClassWithDelay(winningFields);
    };

    const manageEventListeners = (isRemove) => {
        let outerBoard = getOuterBoard();
        let allFields = outerBoard.querySelectorAll('.field');
        console.log(allFields);
        if (isRemove) {
            allFields.forEach(field => removeEventListener(field));
        } else {
        allFields.forEach(field => {
            if (field.children.length === 0) {
                attachMouseOverEvents(field);
                field.addEventListener('click', onFieldClick);
            }
        })
        }
    };


    const makeComputerMove = async () => {
        await pause(300);
        let outerBoard = getOuterBoard();
        let allColumnsRowsDiagonals = [];
        for (const board of outerBoard.children) {
            console.log(board.children.length);
            if (board.children.length > 0 && board.children.length !== 2) {
                allColumnsRowsDiagonals.push(getColumnsRowsDiagonals(board.firstChild));
            } else {
                allColumnsRowsDiagonals.push(getColumnsRowsDiagonals(outerBoard));
            }
        }
        let possibleMoves = [];
        let ownWinningMoves = [];
        let immediateMoves= [];
        for (const board of allColumnsRowsDiagonals) {
            for (const fields of board) {
                let fieldsWithOpponent = getFieldsWithPlayer(fields, switchPlayer());
                let ownFields = getFieldsWithPlayer(fields, player);
                if (fieldsWithOpponent.length === 2) {
                    let freeFields = getFreeFields(fields);
                    immediateMoves.push(...freeFields);
                }
                if (ownFields.length === 2) {
                    ownWinningMoves.push(...getFreeFields(fields));
                }
                possibleMoves.push(...getFreeFields(fields));
            }
        }
        if (possibleMoves.length === 0 && ownWinningMoves.length === 0 && immediateMoves.length === 0) {
            return;
        }
        console.log(possibleMoves);
        console.log(ownWinningMoves);
        console.log(immediateMoves);
        if (ownWinningMoves.length >= 1) {
            let winningMove = ownWinningMoves[0];
            await makeMove(winningMove);
            return;
        }
        if (immediateMoves.length >= 1) {
            let immediateMove = immediateMoves[0];
            await makeMove(immediateMove);
        } else {
            let number = Math.floor(Math.random() * possibleMoves.length);
            let possibleMove = possibleMoves[number];
            await makeMove(possibleMove);
        }
    };

    const makeMove = async (field) => {
        appendIcon(field, false);
        removeEventListener(field);
        await checkWinningCondition(field.id, false);
        manageEventListeners(false);
        player = switchPlayer();
    };


    const getColumnsRowsDiagonals = (board) => {
        const rows = [];
        const columns = [];
        let leftToRightDiagonal = getLeftToRightDiagonal(board);
        let rightToLeftDiagonal = getRightToLeftDiagonal(board);
        const diagonals = [leftToRightDiagonal, rightToLeftDiagonal];

        if (isFullRowColumnDiagonal(leftToRightDiagonal)) {
            diagonals.push(leftToRightDiagonal);
        }
        if (isFullRowColumnDiagonal(rightToLeftDiagonal)) {
            diagonals.push(rightToLeftDiagonal);
        }
        for (let i = 0; i < 3; i++) {
            let row = getRow(i, board);
            if (isFullRowColumnDiagonal(row)) {
                rows.push(row);
            }
            let column = getColumn(i, board);
            if (!isFullRowColumnDiagonal(column)) {
                columns.push(column);
            }
        }
        return [...rows, ...columns, ...diagonals];
    };


    const attachMouseOverEvents = (field) => {
        if (field.children.length > 0) {
            return;
        }
        field.addEventListener('mouseenter', onFieldHover);
        field.addEventListener('mouseleave', removeIcon);
    }

    const onFieldHover = (event) => {
        appendIcon(event.target, true);
    }

    const appendIcon = (field, isHover) => {
        const icon = document.createElement('span');
        let cssClass = isHover ? player + '-hover' : player;
        icon.classList.add(cssClass);
        field.append(icon);

    };

    const removeIcon = (event) => {
        if (event.target.firstChild) {
            event.target.removeChild(event.target.firstChild);
        }
    };

    const onFieldClick = async (event) => {
        manageEventListeners(true);
        let id = event.target.id;
        if (id === "") {
            id = event.target.parentElement.id;
        }
        let field = getElementById(id);
        removeEventListener(field);
        appendIcon(field, false);

        await checkWinningCondition(id, false);
        player = switchPlayer();
        console.log(isGlobalWin);
        if (!isSinglePlayer && !isGlobalWin) {
            await makeComputerMove();
        }
    }

    const removeEventListener = (field) => {
        if (field.children.length === 2) {
            field.removeChild(field.firstChild);
        }
        field.removeEventListener('mouseenter', onFieldHover);
        field.removeEventListener('mouseleave', removeIcon);
        field.removeEventListener('click', onFieldClick);
    };

    const checkWinningCondition = async (id, isOuterBoard) => {
        let currentField = getElementById(id);
        let row = checkRow(id, currentField.parentElement);
        if (row !== null) {
            await boardWon(currentField.parentElement, isOuterBoard, row);
            return;
        }
        let column = checkColumn(id, currentField.parentElement);
        if (column) {
            await boardWon(currentField.parentElement, isOuterBoard, column);
            return;
        }
        if (getFieldNumber(id) % 2 === 0) {
            let diagonal = checkDiagonals(id, currentField.parentElement);
            if (diagonal) {
                await boardWon(currentField.parentElement, isOuterBoard, diagonal);
                return;
            }
        }
        checkDrawCondition(currentField.parentElement, isOuterBoard);
    };

    const getUnFinishedBoards = () => {
        let board = getOuterBoard();
        return Array.from(board.children).filter(field => field.children.length !== 2);
    };

    const getOuterBoard = () => {
        return getElementById('board-container-main');
    }
    const checkDrawCondition = (board, isOuterBoard) => {
        let children = Array.from(board.children);
        let elementsWithChildren = children.filter(field => field.children.length === 0);
        if (elementsWithChildren.length === 0 && !isOuterBoard) {
            if (isOuterBoard) {
                addDrawIcon(board.parentElement);
            } else {
                addDrawIcon(board);
            }
            for (const child of children) {
                removeEventListener(child);
            }
            return;
        }
        if (isOuterBoard) {
            const finishedBoards = getUnFinishedBoards();
            if (finishedBoards.length === 0) {
                addDrawIcon(board);
            }
        }
    }

    const addDrawIcon = (board) => {
        board.classList.add('board-won');
        const icon = document.createElement('span');
        icon.classList.add('draw-mark');
        board.append(icon);
        board.parentElement.append(icon);
    };

    const checkDiagonals = (id, board) => {
        let fieldNumber = getFieldNumber(id);
        let winningFields;
        if (fieldNumber === '0' || fieldNumber === '8') {
            winningFields = getWinningFieldOrNull(getLeftToRightDiagonal(board));
        }
        if (fieldNumber === '2' || fieldNumber === '6') {
            winningFields = getWinningFieldOrNull(getRightToLeftDiagonal(board));
        }
        if (fieldNumber === '4') {
            winningFields = getWinningFieldOrNull(getRightToLeftDiagonal(board));
            if (!winningFields) {
                winningFields = getWinningFieldOrNull(getLeftToRightDiagonal(board));
            }
        }
        return winningFields;
    }

    const boardWon = async (board, isOuterBoard, winningFields) => {
        const icon = document.createElement('span');
        if (isOuterBoard || isSingleGame ) {
            isGlobalWin = true;
        }
        console.log(winningFields);
        await playWinAnimation(winningFields);
        board.classList.add('board-won')
        icon.classList.add(player);
        board.parentElement.append(icon);
        if (gameMode === 'multi' && !isOuterBoard) {
            let fields = Array.from(board.children);
            for (const field of fields) {
                field.removeEventListener('mouseenter', onFieldHover);
                field.removeEventListener('mouseleave', removeIcon);
                field.removeEventListener('click', onFieldClick);
            }
            await checkWinningCondition(board.parentElement.id, true);
        }
    }


    const checkRow = (id, board) => {
        const rowNumber = fieldLookUp.get(getFieldNumber(id))[0];
        const fields = getRow(rowNumber, board)
        return getWinningFieldOrNull(fields);
    };


    const checkColumn = (id, board) => {
        let columnNumber = fieldLookUp.get(getFieldNumber(id))[1];
        const fields = getColumn(columnNumber, board);
        return getWinningFieldOrNull(fields);
    };

    const getWinningFieldOrNull = (fields) => {
        if (fieldsContainWinning(fields)) {
            return fields;
        }
        return null;
    };


    const getFieldsWithPlayer = (fields, currentPlayer) => {
        return Array.from(fields).filter(field => {
                return field.querySelectorAll(':scope > .' + currentPlayer).length === 1
            }
        );
    };

    const getFreeFields = (fields) => {
        return Array.from(fields).filter(field => {
                return field.children.length === 0;
            }
        );
    };

    const isFullRowColumnDiagonal = (fields) => {
        let filter = Array.from(fields).filter(field => {
                return field.firstChild;
            }
        );
        return filter.length === 3;
    };


    const fieldsContainWinning = (fields) => {
        let fieldContainingPlayer = getFieldsWithPlayer(fields, player)
        return fieldContainingPlayer.length === 3;
    };

    const getFieldNumber = (id) => {
        return id[0];
    };

    const getColumn = (columnNumber, board) => {
        return board.querySelectorAll(':scope > .column' + columnNumber);
    };

    const getRow = (rowNumber, board) => {
        return board.querySelectorAll(':scope > .row' + rowNumber);
    };

    const getLeftToRightDiagonal = (board) => {
        return Array.from(board.children).filter(child =>
            /[048]/.test(child.id[0])
        );
    }

    const getRightToLeftDiagonal = (board) => {
        return Array.from(board.children).filter(child =>
            /[246]/.test(child.id[0])
        );
    }

    const getElementById = (id) => {
        return document.getElementById(id)
    };

})();