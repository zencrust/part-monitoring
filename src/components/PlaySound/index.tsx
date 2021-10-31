import React from "react";

const PlaySound = React.memo<{playSound: boolean}>(({playSound}) => {

    if (!playSound) {
        return null;
    }
    return (
        <div>
            <audio src="assets/sound/alert.mp3" autoPlay={true} loop={true}/>
        </div>
    );
}, ({playSound: prev}, {playSound: next}) => prev === next);

export default PlaySound;
