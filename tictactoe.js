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


    let player = 'circle';
    document.addEventListener('DOMContentLoaded', () => {
        setUp();
    });

    const lockedBoards = [];
    let trapFields = [];
    let gameMode = "multi";

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
        trapFields = []
        clearBoard(root);
        createBoard('main', root, 'outer-board-container', false);
        let fields = Array.from(getOuterBoard().children);
        for (let i = 0; i < fields.length; i++) {
            createBoard(i, fields[i], 'inner-board-container', true);
        }
        addEventFields();
    }

    const startSingleGame = () => {
        let root = getElementById('root');
        clearBoard(root);
        createBoard('main', root, 'outer-board-container', true);

    };

    const switchPlayer = () => {
        return player === 'circle' ? 'x-mark' : 'circle';
    };

    const addEventFields = () => {
        let fields = getOuterBoard().children;
        let numberOfFields = 8;
        for (let boardNumber = 0; boardNumber < fields.length; boardNumber++) {
            if (numberOfFields > 0) {
                const subBoard = fields[boardNumber];
                let fieldChildren = subBoard.children;
                let number = Math.floor(Math.random() * 3);
                for (let j = 0; j < number; j++) {
                    let fieldNumber = Math.floor(Math.random() * 9);
                    trapFields.push(fieldNumber + '-' + boardNumber);
                    let fields = Array.from(fieldChildren[0].children);
                    let field = fields[fieldNumber];
                    field.removeEventListener('click', onFieldClick);
                    field.addEventListener('click', onTrapFieldClick);
                }
                numberOfFields = numberOfFields - number;
            }
        }
    };

    const onTrapFieldClick = async (event) => {
        let id = event.target.id;
        if (id === '') {
            id = event.target.parentElement.id;
        }
        let index = trapFields.indexOf(id);
        if (index !== -1) {
            trapFields.splice(index, 1);
        }
        let elementById = getElementById(id);
        elementById.classList.add('trap-field');
        let board = elementById.parentElement;
        lockedBoards.push(board);
        let fieldsOfBoard = Array.from(board.children);
        let finishedBoards = getUnFinishedBoards();
        if (finishedBoards.length === 1) {
            console.log("Last field left");
            //no alternative to click on.
            return;
        }
        for (const field of fieldsOfBoard) {

            field.classList.add('deactivated');
            //remove hover effect icon
            if (field.firstChild && field.firstChild.nodeType === Node.ELEMENT_NODE) {
                if (field.firstChild.classList.contains(player + '-hover')) {
                    field.removeChild(field.firstChild);
                }
            }
            const clone = field.cloneNode(true);
            clone.id = field.id;
            field.parentNode.replaceChild(clone, field);
        }
        player = switchPlayer();
        await makeComputerMove();
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


    const playWinAnimation = async (winningFields) => {
        const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const addClassWithDelay = async (elements) => {
            for (const field of elements) {
                console.log(field);
                console.log(field.id);
                field.firstChild.classList.add('hopping-icon');
                await pause(100);
            }
            await pause(1000);
        };
        return addClassWithDelay(winningFields);

    };

    const makeComputerMove = async () => {
        let outerBoard = getOuterBoard();
        let allColumnsRowsDiagonals = [];
        for (const board of outerBoard.children) {
            if (board.children.length < 2) {
                allColumnsRowsDiagonals.push(getColumnsRowsDiagonals(board.firstChild));
            }
        }
        let opponentFields = [];
        let ownFields = [];
        let possibleMoves = [];
        let immediateMoves = [];
        for (const board of allColumnsRowsDiagonals) {
            for (const fields of board) {
                let fieldsWithOpponent = getFieldWithPlayer(fields, switchPlayer());
                if (fieldsWithOpponent.length === 2) {
                    let freeFields = getFreeFields(fields);
                    immediateMoves.push(...freeFields);
                }
                possibleMoves.push(...getFreeFields(fields));
            }
        }
        if (immediateMoves.length >= 1) {
            let immediateMove = immediateMoves[0];
            makeMove(immediateMove);
        } else {
            let number = Math.floor(Math.random() * possibleMoves.length);
            let possibleMove = possibleMoves[number];
            makeMove(possibleMove);
        }

    };

    const makeMove = (field) => {
        appendIcon(field, false);
        removeEventListener(field);
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
        unlockBoard();
        let id = event.target.id;
        if (id === "") {
            id = event.target.parentElement.id;
        }
        let field = getElementById(id);
        removeEventListener(field);
        appendIcon(field, false);

        await checkWinningCondition(id, false);
        player = switchPlayer();
        await makeComputerMove();
    }


    const removeEventListener = (field) => {
        if (field.children.length === 2) {
            field.removeChild(field.firstChild);
        }

        field.removeEventListener('mouseenter', onFieldHover);
        field.removeEventListener('mouseleave', removeIcon);
        field.removeEventListener('click', onFieldClick);
    };

    const unlockBoard = () => {
        let board = lockedBoards.shift();
        if (board) {
            const children = Array.from(board.children);
            for (const field of children) {
                if (trapFields.includes(field.id)) {
                    field.addEventListener('click', onTrapFieldClick);
                } else if (!field.firstChild) {
                    field.addEventListener('click', onFieldClick);
                }
                attachMouseOverEvents(field);
                field.classList.remove('deactivated');
            }
        }
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
            console.log("draw");
            addDrawIcon(board);
            for (const child of children) {
                removeEventListener(child);
            }
            return;
        }
        if (isOuterBoard) {
            const finishedBoards = getUnFinishedBoards();
            console.log(finishedBoards);
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
        let isPlayerWinning;
        if (fieldNumber === '0' || fieldNumber === '8') {
            isPlayerWinning = getWinningFieldOrNull(getLeftToRightDiagonal(board));
        }
        if (fieldNumber === '2' || fieldNumber === '6') {
            isPlayerWinning = getWinningFieldOrNull(getRightToLeftDiagonal(board));
        }
        if (fieldNumber === '4') {
            isPlayerWinning = getWinningFieldOrNull(getRightToLeftDiagonal(board));
            if (!isPlayerWinning) {
                isPlayerWinning = getWinningFieldOrNull(getLeftToRightDiagonal(board));
            }
        }
        return isPlayerWinning;
    }

    const boardWon = async (board, isOuterBoard, winningFields) => {
        const icon = document.createElement('span');
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


    const getFieldWithPlayer = (fields, currentPlayer) => {
        return Array.from(fields).filter(field => {
                return field.querySelectorAll(':scope > .' + currentPlayer).length === 1
            }
        );
    };

    const getFreeFields = (fields) => {
        return Array.from(fields).filter(field => {
                return field.children.length !== 1
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
        let fieldContainingPlayer = getFieldWithPlayer(fields, player)
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