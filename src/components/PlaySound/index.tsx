import React from "react";

interface IProps{
    playSound: boolean
}

interface IState{

}

class PlaySound extends React.Component<IProps, IState>{
    shouldComponentUpdate(nextProps:IProps){
      return !areEqual(this.props, nextProps);
    }

    render(){
      return (
       <PlaySoundFC playSound={this.props.playSound} />
      );  
   }

   componentWillUnmount(){
       console.log('play sound unmounted');
   }
}



function areEqual(prevProps: IProps, nextProps: IProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
   return prevProps.playSound === nextProps.playSound;
}

const PlaySoundFC = (props: IProps) => {
    
    if (!props.playSound) {
        return null;
    }
    return (
        <div>
            <audio src="assets/sound/alert.wav" autoPlay={true} loop={true}/>
        </div>
    );
};

export default PlaySound;
