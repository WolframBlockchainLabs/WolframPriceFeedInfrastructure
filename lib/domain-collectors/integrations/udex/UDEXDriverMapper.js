import path from 'path';
import { fileURLToPath } from 'url';

class UDEXDriverMapper {
    static BASE_PATH = path.dirname(fileURLToPath(import.meta.url));

    intervalObject = {};

    async loadDriversForGroup(groupName) {
        const groupPath = path.join(UDEXDriverMapper.BASE_PATH, groupName);

        try {
            const driversIndexModule = await import(`${groupPath}/index.js`);

            return driversIndexModule.default || driversIndexModule;
        } catch (error) {
            throw new Error(
                `Unable to load drivers for group: ${groupName}. Error: ${error.message}`,
            );
        }
    }

    async getDriver({ groupName, exchange }) {
        if (!this.intervalObject[groupName]) {
            const drivers = await this.loadDriversForGroup(groupName);
            this.intervalObject[groupName] = drivers;
        }

        const driver = this.intervalObject[groupName].drivers[exchange];

        if (!driver) {
            throw new Error(
                `Driver not found for exchange: ${exchange} in group: ${groupName}`,
            );
        }

        return driver;
    }
}

export default UDEXDriverMapper;
