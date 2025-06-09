// Drag and drop item types
export const ItemTypes = {
    PLAYER: 'player',
    GROUP: 'group'
};

// MultiBackend configuration for drag and drop
export const HTML5toTouch = {
    backends: [
        {
            id: 'html5',
            backend: 'HTML5Backend',
            preview: true,
            transition: null
        },
        {
            id: 'touch',
            backend: 'TouchBackend',
            options: {
                enableMouseEvents: true,
                delayTouchStart: 50,
                enableKeyboardEvents: true
            },
            preview: true,
            transition: 'TouchTransition'
        }
    ]
};

// Chameleon color scheme
export const chameleonColors = {
    primary: '#2E8B57',    // Sea green
    secondary: '#20B2AA',  // Light sea green
    active: '#48D1CC',     // Medium turquoise
    hover: '#98FB98',      // Pale green
    border: '#3CB371',     // Medium sea green
    background: '#F0FFF0', // Honeydew
    success: '#90EE90',    // Light green
    group: {
        background: '#E0FFF0', // Light mint green
        border: '#8FBC8F',     // Dark sea green
        header: '#2E8B57',     // Sea green
    }
}; 