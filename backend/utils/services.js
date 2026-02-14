const generateID = (prefix) => {
    const timestamp = Date.now();
    return `${prefix}${timestamp}`;
};

module.exports = {
    generateID,
};
