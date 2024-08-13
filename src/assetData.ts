export function pathSelector(custom: boolean) {

    // if(custom === true) {
    //     pathRef = "assets";
    //     console.log("loading public/assets from preloader");
    // }

    if(custom === true) {
        pathRef = "src/Games/ArcadeShooter/assets";
        console.log("loading public/assets from preloader");
    }
    
    else if(custom === false) {
        pathRef = '/node_modules/@interactive-realm/phasergamelibrary/dist/assets'
        console.log("loading package assets from preloader");
    }
}

export let pathRef:string;