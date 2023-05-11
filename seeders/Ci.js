import AppCliProvider  from './../lib/AppCliProvider.js';

const provider = AppCliProvider.create();

provider.initApp(async () => {
    await provider.sequelize.query('SELECT 1', {
        plain : true,
        raw   : true,
        type  : provider.sequelize.QueryTypes.SELECT
    });

    console.log('MySql is ready');

    await provider.shutdown();

    // process.exit();
}).start();

