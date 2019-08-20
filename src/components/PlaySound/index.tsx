import React, { FunctionComponent } from 'react';

let PlaySound: FunctionComponent<{ playSound: boolean }> = ({playSound}) => {
    if(!playSound)
    {
        return null;
    }
    return (
        <div>
            <audio src="assets/sound/alert.wav" autoPlay={true} loop={true}/>
        </div>
    ); 
}

export default PlaySound;