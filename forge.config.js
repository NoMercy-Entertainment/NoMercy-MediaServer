const path = require('path');

module.exports = {
    packagerConfig: {
        asar: false,
        appCopyright: 'NoMercy Entertainment',
        nodeVersion: 'current',
        icon: path.join(__dirname, 'assets', 'icon'),
        dir: path.join(__dirname, 'dist'),
        name: 'NoMercyMediaServer',
        platform: 'all',
        arch: 'all',
        electronVersion: '1.6.15',
        out: path.join(__dirname, 'releases'),
        prune: false,
        appVersion: '0.0.4',
        overwrite: true,
        bundle_id: 'tv.nomercy.app',
        appname: 'NoMercy MediaServer',
        sourcedir: 'dist',
        ignore: 'src|installers',
        protocol: 'nomercy',
        protocolName: 'NoMercy',
        FileSet: [
            {
                'from': './src/prisma',
                'to': './dist/prisma',
                'filter': ['**/**/*']
            },
            {
                'from': './src/database/config',
                'to': './dist/database/config',
                'filter': ['**/**/*']
            },
        ],
        win32metadata: {
            'CompanyName': 'NoMercy Entertainment',
            'FileDescription': 'The Effortless Encoder',
            'ProductName': 'NoMercy MediaServer',
        }
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'NoMercyMediaServer',
                iconUrl: 'https://dev.nomercy.tv/favicon.ico',
                setupIcon: path.join(__dirname, 'assets', 'icons', 'win', 'icon.ico'),
                msi: true,
            },

        },
        {
            name: '@electron-forge/maker-zip',
            platforms: [
                // 'darwin',
                // 'win32'
            ]
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    icon: path.join(__dirname, 'assets', 'icons', 'mac', 'icon.icns')
                }
            }
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {
                options: {
                    icon: path.join(__dirname, 'assets', 'icons', 'png', '256x256.png')
                }
            }
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                icon: path.join(__dirname, 'assets', 'icons', 'mac', 'icon.icns')
            }
        },

    ]
}