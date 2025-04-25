export function pathSelector(custom: boolean) {

    // if(custom === true) {
    //     pathRef = "assets";
    //     console.log("loading public/assets from preloader");
    // }

    if(custom === true) {
        pathRef = "../assets";
    }
    
    else if(custom === false) {
        pathRef = '/PhaserGameLibrary/src/Games/SaveTheOcean/assets'
    }

    console.log("loading phaser game assets from " + pathRef);
}

export let pathRef:string;