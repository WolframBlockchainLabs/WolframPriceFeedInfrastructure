class BaseExchangeRepository {
    static async getDataSource() {
        throw new Error(
            `[${this.name}]: getDataSource method is not implemented`,
        );
    }

    static async getDataSourceGroupMembers() {
        throw new Error(
            `[${this.name}]: getDataSourceGroupMembers method is not implemented`,
        );
    }
}

export default BaseExchangeRepository;
