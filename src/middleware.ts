import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import express, { Application } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import path from 'path';
import favicon from 'serve-favicon';
import xss from 'xss-clean';

export const applyMiddleware = (app: Application) => {
  // CORS
  const allowedOrigins = ['http://example.com', 'https://example.com'];
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: true,
      dnsPrefetchControl: true,
      frameguard: true,
      hidePoweredBy: true,
      hsts: true,
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: true,
      referrerPolicy: true,
      xssFilter: true,
    }),
  );

  // Compression
  app.use(compression());

  // Logging
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  // Rate limiting
  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
  });
  app.use('/api', limiter);

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Cookie parsing
  app.use(cookieParser());

  // Data sanitization
  app.use(mongoSanitize());
  app.use(xss());

  // Prevent parameter pollution
  app.use(
    hpp(),
    // hpp({
    //   whitelist: ['duration', 'ratingsQuantity'], // Example
    // }),
  );

  // Serve static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Favicon
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

  // Custom middleware
  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    res.locals.nonce = Buffer.from(crypto.randomBytes(16)).toString('base64');
    next();
  });
};
