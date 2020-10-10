
const validate = (uuid) => {
    if (typeof uuid !== 'string' || !uuid.length) {
        return false;
    }
    // Remove spaces
    uuid = uuid.trim().split(' ')[0];
    const success = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/.test(uuid);
    if (!success) return false;
    return uuid;
};

const generate = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
module.exports = { validate, generate };

