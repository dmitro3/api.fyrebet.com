const USE_BOTS = true; // Fake bets

const SLOTS = [...Array(54).keys()];

const X50_SLOTS = [0];
const X5_SLOTS = [1, 9, 11, 19, 21, 33, 35, 43, 45, 53];

const X3_SLOTS = [
    3,
    5,
    7,
    13,
    15,
    17,
    23,
    25,
    27,
    29,
    31,
    37,
    39,
    41,
    47,
    49,
    51,
];

const X2_SLOTS = [
    2,
    4,
    6,
    8,
    10,
    12,
    14,
    16,
    18,
    20,
    22,
    24,
    26,
    28,
    30,
    32,
    34,
    36,
    38,
    40,
    42,
    44,
    46,
    48,
    50,
    52,
];

const COLORS = {
    X2: "#3f51b5",
    X3: "#d81b60",
    X5: "#2196f3",
    X50: "#ffc10773",
};

const createSlotColors = () => {
    let _slotsColors = { 0: COLORS.X50 };
    X2_SLOTS.map((slot) => {
        _slotsColors[slot] = COLORS.X2;
    });

    X3_SLOTS.map((slot) => {
        _slotsColors[slot] = COLORS.X3;
    });

    X5_SLOTS.map((slot) => {
        _slotsColors[slot] = COLORS.X5;
    });
    return _slotsColors;
};

const createSlotsMultipliers = () => {
    let _ret = { 0: 50 };

    X3_SLOTS.map((slot) => {
        _ret[slot] = 3;
    });
    X2_SLOTS.map((slot) => {
        _ret[slot] = 2;
    });

    X5_SLOTS.map((slot) => {
        _ret[slot] = 5;
    });
    return _ret;
};



const SLOTS_MULTIPLIERS = createSlotsMultipliers();

const ROOM_NAME = "/fortune-wheel";


module.exports = {
    X5_SLOTS,
    X3_SLOTS,
    X2_SLOTS,
    X50_SLOTS,
    SLOTS,
    SLOTS_MULTIPLIERS,
    COLORS,
    ROOM_NAME,
    USE_BOTS
};
