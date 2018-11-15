import path from 'path';
import { Router } from 'express';
import { middlewares } from 'auth0-extension-express-tools';

import config from '../lib/config';
import { provisionAppUser, getOrCreateUserFolder } from '../lib/box';
import requireApiKey from '../lib/middlewares/requireApiKey';

export default () => {
  const api = Router();
  const adminMiddlewares = [
    middlewares.authenticateAdmins({
      credentialsRequired: true,
      secret: config('EXTENSION_SECRET'),
      audience: 'urn:box-platform',
      baseUrl: config('PUBLIC_WT_URL')
    }),
    middlewares.managementApiClient({
      domain: config('AUTH0_DOMAIN')
    })
  ];

  api.get('/config', adminMiddlewares, (req, res) => {
    res.json({
      domain: config('AUTH0_DOMAIN'),
      audience: process.env.API_AUDIENCE || config('API_AUDIENCE'),
      tokenEndpoint: path.join(config('PUBLIC_WT_URL'), '/delegation')
          .replace('http:/', 'http://')
          .replace('https:/', 'https://')
    });
  });

  api.post('/provision', requireApiKey(config('EXTENSION_SECRET')), (req, res, next) => {
    provisionAppUser(req.body.user)
      .then(appUser => res.json(appUser))
      .catch(next);
  });

  api.post('/user_folder', requireApiKey(config('EXTENSION_SECRET')), (req, res, next) => {
    getOrCreateUserFolder(req.body.email, req.body.id)
      .then(userFolder => res.json(userFolder))
      .catch(next);
  });

  return api;
};
