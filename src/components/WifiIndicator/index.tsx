import React from "react";
import DISCONNECTED from "./images/DISCONNECTED.svg";
import EXCELLENT from "./images/EXCELLENT.svg";
import GREAT from "./images/GREAT.svg";
import OKAY from "./images/OKAY.svg";
import UNUSABLE from "./images/UNUSABLE.svg";
import WEAK from "./images/WEAK.svg";

export type WiFiSignalIndicator = "EXCELLENT" | "GREAT" | "OKAY" | "WEAK" | "UNUSABLE" | "DISCONNECTED";

interface IProps extends React.ComponentPropsWithoutRef<"img"> {
    strength: WiFiSignalIndicator;
}

const WifiIndicator: React.FC<IProps> = (p) => {
    const imageMap: Record<string, string> =   {
            EXCELLENT,
            GREAT,
            OKAY,
            WEAK,
            UNUSABLE,
            DISCONNECTED,
        };
    return (
        <img src={imageMap[p.strength]} style={{height: "2em"}} alt={p.strength} className={p.className}>
        </img>
    );
};

export default WifiIndicator;
