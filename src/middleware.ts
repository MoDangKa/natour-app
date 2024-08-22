import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import express, { Application, NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import path from 'path';
import favicon from 'serve-favicon';
import xss from 'xss-clean';

import { hostname, NODE_ENV, port } from './config';

export const applyMiddleware = (app: Application) => {
  // CORS
  const allowedOrigins = [
    'http://example.com',
    'https://example.com',
    'http://localhost:3000',
    'https://*.tiles.mapbox.com',
    'https://api.mapbox.com',
    'https://events.mapbox.com',
  ];
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
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Security headers
  const apiUrl =
    NODE_ENV === 'production'
      ? 'https://your-production-api-url.com'
      : `http://${hostname}:${port}`;

  const connectSrcUrls = [
    'https://api.mapbox.com/',
    'https://a.tiles.mapbox.com/',
    'https://b.tiles.mapbox.com/',
    'https://events.mapbox.com/',
    'https://cdnjs.cloudflare.com',
    apiUrl,
  ];

  const scriptSrcUrls = [
    'https://api.tiles.mapbox.com/',
    'https://api.mapbox.com/',
    'https://cdnjs.cloudflare.com',
    'https://domain-hosting-source-maps.com',
    'https://trusted-external-source.com',
  ];

  const styleSrcUrls = [
    'https://api.mapbox.com/',
    'https://api.tiles.mapbox.com/',
    'https://fonts.googleapis.com/',
  ];

  const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            ...scriptSrcUrls,
          ],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", 'blob:'],
          objectSrc: ["'none'"],
          imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
          fontSrc: ["'self'", ...fontSrcUrls],
          frameSrc: ["'self'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
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
    // helmet()
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
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.nonce = Buffer.from(crypto.randomBytes(16)).toString('base64');
    next();
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Content-Security-Policy',
      `script-src 'self' 'nonce-${res.locals.nonce}';`,
    );
    next();
  });

  app.get('*.js', function (req: Request, res: Response, next: NextFunction) {
    res.set('Content-Type', 'application/javascript');
    next();
  });
};
