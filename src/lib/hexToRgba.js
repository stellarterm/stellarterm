const hexRegExp = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

function splitHexColor(hexColor) {
    const isShortHex = hexColor.length === 4;

    if (isShortHex) {
        return hexColor
            .slice(1)
            .split('')
            .map(color => color.repeat(2));
    }

    return hexColor
        .slice(1)
        .match(/.{2}/g);
}

export default function hexToRGBA(hexColor, opacity = 1) {
    const isHexColor = hexRegExp.test(hexColor);
    if (!isHexColor) { throw new Error(`Expect first argument to be hex color. Receive: ${hexColor}`); }

    const rgbColor = splitHexColor(hexColor)
        .map(colorString => parseInt(colorString, 16))
        .join(',');

    return `rgba(${rgbColor},${opacity})`;
}

