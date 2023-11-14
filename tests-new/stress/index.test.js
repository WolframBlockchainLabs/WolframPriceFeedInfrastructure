import AppProvider from '../../lib/AppProvider.js';
import AppStressTestProvider from './AppStressTestProvider.js';

const appProvider = new AppProvider();
const stressTestProvider = new AppStressTestProvider(appProvider);

stressTestProvider.start();
