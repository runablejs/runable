/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import { adonis } from 'runable/adapters/adonis'

router.get('/api/health', async () => ({ status: 'ok' }))
router.any('*', adonis())
