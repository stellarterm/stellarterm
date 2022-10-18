import { useEffect } from 'react';

const ARROW_UP = 'ArrowUp';
const ARROW_DOWN = 'ArrowDown';
const ENTER = 'Enter';
const ESCAPE = 'Escape';

export default function useOnKeyDown({ onEnter, onEscape, onArrowDown, onArrowUp }, deps) {
    const keyHandler = ({ key }) => {
        if (key === ENTER && onEnter) {
            onEnter();
        }

        if (key === ESCAPE && onEscape) {
            onEscape();
        }
        if (key === ARROW_DOWN && onArrowDown) {
            onArrowDown();
        }

        if (key === ARROW_UP && onArrowUp) {
            onArrowUp();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', keyHandler, false);

        return () => document.removeEventListener('keydown', keyHandler, false);
    }, deps);
}
