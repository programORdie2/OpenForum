import { Sequelize } from 'sequelize';
import { DATABASE as DB_CONFIG } from '../config';
import logger from '../utils/logger.util';


logger.log('Connecting to MongoDB...');

const sequelize = new Sequelize(DB_CONFIG.name, DB_CONFIG.user, DB_CONFIG.password, {
  host: DB_CONFIG.host,
  dialect: 'postgres',
  logging: false
});

// Create tables if they don't exist
sequelize.sync();

logger.log('Database connected');

export default sequelize;