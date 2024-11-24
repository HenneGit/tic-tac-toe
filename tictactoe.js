(() => {


    const game = [];
    let player = 'circle';
    document.addEventListener('DOMContentLoaded', () => {
        startGame();
    });


    const startGame = () => {
        createBoard('single')
    }

    const createBoard = (boardId) => {
        const root = getElementById('root');
        const boardContainer = document.createElement('div');
        boardContainer.id = 'board-container';
        boardContainer.classList.add('board-container');
        let rowNumber = 0;
        let columnNumber = 0;
        for (let i = 0; i < 9; i++) {
            if (columnNumber === 3) {
                rowNumber++;
                columnNumber = 0;
            }
            let element = document.createElement('div');
            element.addEventListener('click', onFieldClick);
            element.id = rowNumber +  columnNumber +"-field-" + boardId;
            element.classList.add('field', rowNumber + 'row', columnNumber + 'column');
            columnNumber++;
            boardContainer.append(element);
        }
        root.append(boardContainer)
    };
    
    const onFieldClick = (event) => {
        player = player === 'circle' ? 'x' : 'circle';
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
        getRow(currentField.id[0]);

    };


    const getRow = (rowNumber) => {
        let board = getElementById('board-container');
        const row1Elements = board.querySelectorAll('.' + rowNumber + 'row');
        console.log(row1Elements);

    };


    const getColumnNumber = (id) => {    };


    const getElementById = (id) => {
        return document.getElementById(id)
    };


})();