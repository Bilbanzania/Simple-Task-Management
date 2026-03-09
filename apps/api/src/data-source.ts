import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config({ path: 'apps/api/.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entityPrefix: 'tha_',
  entities: ['apps/api/src/**/*.entity{.ts,.js}'], 
  migrations: ['apps/api/src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true, 
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;