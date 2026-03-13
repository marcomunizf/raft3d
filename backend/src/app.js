const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const { healthRouter } = require('./routes/health.routes');
const { authRouter } = require('./routes/auth.routes');
const { dashboardRouter } = require('./routes/dashboard.routes');
const { salesRouter } = require('./routes/sales.routes');
const { customersRouter } = require('./routes/customers.routes');
const { inventoryItemsRouter } = require('./routes/inventory-items.routes');
const { inventoryMovementsRouter } = require('./routes/inventory-movements.routes');
const { settingsRouter } = require('./routes/settings.routes');
const { usersRouter } = require('./routes/users.routes');
const { drawingsRouter } = require('./routes/drawings.routes');
const { requireAuth } = require('./middlewares/auth.middleware');
const { errorHandler } = require('./middlewares/error-handler.middleware');

const app = express();

app.use(helmet());

app.use(cors({
  origin: env.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(morgan('dev'));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

app.use('/health', healthRouter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRouter);
app.use('/api', requireAuth);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/sales', salesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/inventory/items', inventoryItemsRouter);
app.use('/api/inventory/movements', inventoryMovementsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/drawings', drawingsRouter);
app.use(errorHandler);

module.exports = { app };
