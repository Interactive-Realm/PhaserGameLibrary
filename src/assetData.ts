export function pathSelector(custom: boolean) {

    if(custom === true) {
        pathRef = "assets";
        console.log("loading public/assets from preloader");
    }

    // Er denne her function ikke overflødig?? Hedder mappen ikke bare altid "assets" den skal loade fra in any case??
    // Nej else er til at BasePattern er til at load de assets man putter ind i BasePattern når man laver spillet.
    // Men PhaserGameLibrary er også vores Phaser Work Invironment, så argumentet er at spillet, også dem til kunder, 
    // bliver lavet her, så hvorfor distribuerer vi ikke bare altid alle assets herfra og bruger de assets til at bygge til kunden med i BasePattern?
    
    // Fordi når vi bygger til kunden fra BasePattern, 
    
    else if(custom === false) {
        pathRef = '/node_modules/@interactive-realm/phasergamelibrary/dist/assets'
        console.log("loading package assets from preloader");
    }
}

export let pathRef:string;
