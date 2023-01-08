import { useState } from "react";

function useInput(initialValue: string) {
    const [value, setValue] = useState(initialValue);

    const handleChange = (event: any) => {
        console.log(event.target.value);
        setValue(event.target.value);
    };

    const handleClean = () => {
        setValue("");
    }

    return {
        value,
        onChange: handleChange,
        clear: handleClean
    };
};

export default useInput;