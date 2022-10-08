const path = require('path');

module.exports = {
    packagerConfig: {
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "NoMercyMediaServer",
            }
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: [
                "darwin"
            ]
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                options: {
                }
            }
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {
                options: {
                }
            }
        }
    ]
}