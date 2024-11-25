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
        startMultiFieldGame();
    });

    const startMultiFieldGame = () => {
        let root = getElementById('root');
        createBoard('main', root, 'outer-board-container', false);
        let fields = Array.from(getElementById('board-container-main').children);
        for (let i = 0; i < fields.length; i++) {
            createBoard(i, fields[i], 'inner-board-container', true);
        }
    }

    const startSingleGame = () => {
        let root = getElementById('root');
        createBoard('main', root, 'outer-board-container', true);

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
            if (isSingleGame) {
                element.addEventListener('click', onFieldClick);
            }
            element.id = i + "-" + boardId;
            element.classList.add('field', 'row' + rowNumber, 'column' + columnNumber);
            boardContainer.append(element);
            columnNumber++;
        }
        root.append(boardContainer)
    };

    const onFieldClick = (event) => {
        player = player === 'circle' ? 'x-mark' : 'circle';
        let id = event.target.id;
        let field = getElementById(id);
        if (field.children.length > 0) {
            return;
        }
        const icon = document.createElement('span');
        if (player === "circle") {
            icon.className = 'icon circle';
        } else {
            icon.className = 'icon x-mark';
        }
        field.append(icon);
        checkWinningCondition(id);
    }

    const checkWinningCondition = (id) => {
        let currentField = getElementById(id);
        checkRow(id, currentField.parentElement);
        checkColumn(id, currentField.parentElement);
        if (getFieldNumber(id) % 2 === 0) {
            checkDiagonal(id, currentField.parentElement);
        }
    };

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
        if (isPlayerWinning) {
            playerWon();
        }
    }

    const playerWon = () => {
        alert(player + " won");
    }

    const getLeftToRightDiagonal = (board) => {
        return Array.from(board.children).filter(child =>
            /[048]/.test(child.id)
        );
    }

    const getRightToLeftDiagonal = (board) => {
        return Array.from(board.children).filter(child =>
            /[246]/.test(child.id)
        );
    }

    const getFieldNumber = (id) => {
        return id[0];
    };

    const checkRow = (id, board) => {
        const rowNumber = fieldLookUp.get(getFieldNumber(id))[0];
        const fields = board.querySelectorAll('.row' + rowNumber);
        if (fieldsContainWinning(fields)) {
            playerWon();
        }
    };

    const fieldsContainWinning = (fields) => {
        return Array.from(fields).filter(field =>
            field.querySelector('.' + player) !== null
        ).length === 3;
    };

    const checkColumn = (id, board) => {
        let columnNumber = fieldLookUp.get(getFieldNumber(id))[1];
        const fields = board.querySelectorAll('.column' + columnNumber);
        if (fieldsContainWinning(fields)) {
            playerWon();
        }
    };

    const getElementById = (id) => {
        return document.getElementById(id)
    };

})();