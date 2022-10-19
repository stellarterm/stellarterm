import { useReducer } from 'react';


export default function useForceUpdate() {
    const [updateIndex, forceUpdate] = useReducer(x => x + 1, 0);

    return { updateIndex, forceUpdate };
}

