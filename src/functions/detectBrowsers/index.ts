'use strict';

import { existsSync } from "fs";
import browsers from "./browsers";

function getInstalledBrowsers () {
    let hasBrowser = false;
    for (const browser of Object.values(browsers)) {
        const list = browser.default.DEFAULT_CMD[process.platform];
        for(const path of list ?? []){
            if(existsSync(path)){
                hasBrowser = true;
                break;
            }
        }
    }
    return hasBrowser;
}

export default getInstalledBrowsers;