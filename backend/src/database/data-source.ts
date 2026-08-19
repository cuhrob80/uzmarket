import 'dotenv/config';
import { DataSource } from 'typeorm';
import { validateEnvironment } from '../config/environment';
import { buildTypeOrmOptions } from './database.config';

const environment = validateEnvironment(process.env);
export default new DataSource(buildTypeOrmOptions(environment));
