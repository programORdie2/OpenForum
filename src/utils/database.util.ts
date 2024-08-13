import { Sequelize } from 'sequelize';
import { DATABASE as DB_CONFIG, PRODUCTION } from '../config';
import logger from './logger.util';


logger.log('Connecting to MongoDB...');

const sequelize = new Sequelize(DB_CONFIG.name, DB_CONFIG.user, DB_CONFIG.password, {
  host: DB_CONFIG.host,
  dialect: 'postgres',
  logging: false
});

// Create tables if they don't exist
if (!PRODUCTION) {
  sequelize.sync({ alter: true });
}

logger.log('Database connected');

export default sequelize;