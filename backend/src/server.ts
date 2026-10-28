import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`Health check: http://localhost:${config.port}/api/v1/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();