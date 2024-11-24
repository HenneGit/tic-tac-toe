(() => {


    const game = [];
    
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
        for (let i = 0; i < 9; i++) {
            let element = document.createElement('div');
            element.addEventListener('click', onFieldClick);
            element.id = i + "-field-" + boardId;
            element.classList.add('field')
            boardContainer.append(element);
        }
        root.append(boardContainer)
    };
    
    const onFieldClick = (event) => {
        console.log(event.target.id);
    }


    const getElementById = (id) => {
        return document.getElementById(id)
    };


})();