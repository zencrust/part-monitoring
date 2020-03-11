import React from "react";

interface IProps {
    playSound: boolean;
}

interface IState {

}

function areEqual(prevProps: IProps, nextProps: IProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    return prevProps.playSound === nextProps.playSound;
}

const PlaySound = React.memo((props: IProps) => {

    if (!props.playSound) {
        return null;
    }
    return (
        <div>
            <audio src="assets/sound/alert.mp3" autoPlay={true} loop={true}/>
        </div>
    );
}, areEqual);

export default PlaySound;
