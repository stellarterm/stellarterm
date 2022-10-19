import { useEffect, useState } from 'react';


export default function useUpdateInterval(interval, deps) {
    const [updateIndex, setUpdateIndex] = useState(0);

    useEffect(() => {
        const intervalValue = setInterval(() => {
            setUpdateIndex(prev => prev + 1);
        }, interval);

        return () => clearInterval(intervalValue);
    }, deps || []);

    return updateIndex;
}
