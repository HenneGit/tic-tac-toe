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
        let board = getElementById('board-container-main');
        if (board) {
            root.removeChild(board);
        }
    };

    const startMultiFieldGame = () => {
        let root = getElementById('root');
        trapFields = []
        clearBoard(root);
        createBoard('main', root, 'outer-board-container', false);
        let fields = Array.from(getElementById('board-container-main').children);
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
        player = player === 'circle' ? 'x-mark' : 'circle';
    };

    const addEventFields = () => {
        let fields = getElementById('board-container-main').children;
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

    const onTrapFieldClick = (event) => {
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
        switchPlayer();
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

    const onFieldClick = (event) => {
        unlockBoard();
        let id = event.target.id;
        if (id === "") {
            id = event.target.parentElement.id;
        }
        let field = getElementById(id);
        field.removeChild(field.firstChild);
        field.removeEventListener('mouseenter', onFieldHover);
        field.removeEventListener('mouseleave', removeIcon);
        field.removeEventListener('click', onFieldClick);
        appendIcon(field, false);

        checkWinningCondition(id, false);
        switchPlayer();
    }


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


    const checkWinningCondition = (id, isOuterBoard) => {
        let currentField = getElementById(id);
        if (checkRow(id, currentField.parentElement)) {
            boardWon(currentField.parentElement, isOuterBoard);
            return;
        }
        if (checkColumn(id, currentField.parentElement)) {
            boardWon(currentField.parentElement, isOuterBoard);
            return;
        }
        if (getFieldNumber(id) % 2 === 0) {
            if (checkDiagonal(id, currentField.parentElement)) {
                boardWon(currentField.parentElement, isOuterBoard);
                return;
            }
        }
        checkDrawCondition(currentField.parentElement, isOuterBoard);

    };

    const getUnFinishedBoards = () => {
        let board = getElementById('board-container-main');
        return Array.from(board.children).filter(field => field.children.length !== 2);
    };

    const checkDrawCondition = (board, isOuterBoard) => {
        let children = Array.from(board.children);
        let elementsWithChildren = children.filter(field => field.children.length === 0);
        if (elementsWithChildren.length === 0 && !isOuterBoard) {
            console.log("draw");
            board.classList.add('board-won');
            const icon = document.createElement('span');
            icon.classList.add('draw-mark');
            board.append(icon);
            board.parentElement.append(icon);
            for (const child of children) {
                child.removeEventListener('click', onFieldClick);
                child.removeEventListener('mouseenter', onFieldHover);
                child.removeEventListener('mouseleave', removeIcon);
            }
            return;
        }
        if (isOuterBoard) {
            const finishedBoards = getUnFinishedBoards();
            console.log(finishedBoards);
            if (finishedBoards.length === 0) {
                console.log('Outer board drwa');
            }
        }
    }

    const checkDiagonal = (id, board) => {
        let fieldNumber = getFieldNumber(id);
        let isPlayerWinning = false;
        if (fieldNumber === '0' || fieldNumber === '8') {
            const leftToRightDiagonal = getLeftToRightDiagonal(board);
            isPlayerWinning = fieldsContainWinning(leftToRightDiagonal);
        }
        if (fieldNumber === '2' || fieldNumber === '6') {
            const rightToLeftDiagonal = getRightToLeftDiagonal(board);
            isPlayerWinning = fieldsContainWinning(rightToLeftDiagonal);
        }
        if (fieldNumber === '4') {
            const rightToLeftDiagonal = getRightToLeftDiagonal(board);
            const leftToRightDiagonal = getLeftToRightDiagonal(board);
            isPlayerWinning = fieldsContainWinning(leftToRightDiagonal) || fieldsContainWinning(rightToLeftDiagonal);
        }
        return isPlayerWinning;
    }

    const boardWon = (board, isOuterBoard) => {
        const icon = document.createElement('span');
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
            checkWinningCondition(board.parentElement.id, true);
        }
    }

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

    const getFieldNumber = (id) => {
        return id[0];
    };

    const checkRow = (id, board) => {
        const rowNumber = fieldLookUp.get(getFieldNumber(id))[0];
        const fields = board.querySelectorAll(':scope > .row' + rowNumber);
        return fieldsContainWinning(fields);
    };

    const checkColumn = (id, board) => {
        let columnNumber = fieldLookUp.get(getFieldNumber(id))[1];
        const fields = board.querySelectorAll(':scope > .column' + columnNumber);
        return fieldsContainWinning(fields);
    };


    const fieldsContainWinning = (fields) => {
        let filter = Array.from(fields).filter(field => {
                return field.querySelectorAll(':scope > .' + player).length === 1
            }
        );
        return filter.length === 3;
    };


    const getElementById = (id) => {
        return document.getElementById(id)
    };

})();