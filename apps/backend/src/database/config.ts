import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { Document } from '../entities/document.entity';
import { Bookmark } from '../entities/bookmark.entity';
import { ReadingProgress } from '../entities/reading-progress.entity';
import { InitialSchema1704771600000 } from './migrations/1704771600000-InitialSchema';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'docs_repository',
  entities: [User, Document, Bookmark, ReadingProgress],
  migrations: [InitialSchema1704771600000],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
