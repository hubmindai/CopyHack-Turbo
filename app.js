'use strict'

//
//
// Imports
// ############################################
require('dotenv').config()
const express = require('express')
const session = require('express-session')
const rateLimit = require('express-rate-limit')
const pino = require('pino-http')
const SessionStore = require('connect-session-knex')(session)
const helmet = require('helmet')
const path = require('path')
const hbs = require('hbs')
const authService = require('./services/authentication')
const dbService = require('./services/database')
const paymentService = require('./services/payments')
const healthCheckService = require('./services/health-check')
const viewHelpersUtil = require('./utilities/view-helpers')
const methodOverride = require('method-override')

//
//
// Config
// ############################################
const app = express()
app.use('/payments/webhook', express.raw({ type: '*/*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.set('trust proxy', 1)

// Setup logger
const logger = pino({
  level: process.env.LOGGER_LEVEL,
  prettyPrint: {
    colorize: true,
    hideObject: process.env.LOGGER_HIDE_OBJECT === 'true'
  }
})
app.use(logger)
app.set('views', [path.join(__dirname, 'components'), path.join(__dirname, 'routes')])
app.set('view engine', 'hbs')
hbs.registerPartials(path.join(__dirname, 'components'))
hbs.registerPartials(path.join(__dirname, 'routes'))
viewHelpersUtil.init(hbs)

// Get default Helmet csp and modify
const csp = {}
csp.directives = helmet.contentSecurityPolicy.getDefaultDirectives()
csp.directives['child-src'] = []
csp.directives['child-src'].push('js.stripe.com/v3/')
csp.directives['script-src'].push('js.stripe.com/v3')
csp.directives['script-src'].push("'unsafe-inline'")
csp.directives['script-src'].push('cdn.jsdelivr.net')
csp.directives['connect-src'] = []
csp.directives['connect-src'].push("'self'")
csp.directives['style-src'].push('cdn.jsdelivr.net')
if (process.env.APP_HTTPS_ONLY === 'false') {
  delete csp.directives['upgrade-insecure-requests']
}

// Configure Helmet
app.use(helmet.contentSecurityPolicy(csp))
app.use(helmet.dnsPrefetchControl())
app.use(helmet.expectCt())
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
app.use(helmet.hsts())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.referrerPolicy())
app.use(helmet.xssFilter())

const store = new SessionStore({
  knex: dbService.instance,
  tablename: 'session'
})

app.use(session({
  secret: process.env.APP_SECRET,
  cookie: {
    httpOnly: true,
    secure: process.env.APP_HTTPS_ONLY === 'true',
    maxAge: 15778800000, // 6 Months
    sameSite: 'lax'
  },
  resave: true,
  saveUninitialized: false,
  store
}))

const authRateLimit = rateLimit({
  windowMs: 150 * 60 * 1000, // 5 minutes
  max: 100
})

app.use('/auth/', authRateLimit)
app.use(authService.routes)

app.use(healthCheckService.routes)

app.use('/payments/webhook', authService.authorizePublic, paymentService.processWebhooks)
app.use('/payments', authService.authorizeUser, paymentService.routes)

//
//
// Routes
// ############################################
const publicHomeRoute = require('./routes/public-home/index')
app.use('/', authService.authorizePublic, publicHomeRoute)

app.use('/assets', authService.authorizePublic, express.static('assets', { maxAge: '1d' }))

const publicOnboardRoute = require('./routes/public-onboard/index')
app.use('/onboard', authService.authorizePublic, publicOnboardRoute)

const userDashboardRoute = require('./routes/user-dashboard/index')
app.use('/user/dashboard', authService.authorizeUser, userDashboardRoute)

const userThingsRoute = require('./routes/user-things')
app.use('/user/things', authService.authorizeUser, userThingsRoute)

const userHelpRoute = require('./routes/user-help/index')
app.use('/user/help', authService.authorizeUser, userHelpRoute)

const userProfileRoute = require('./routes/user-profile/index')
app.use('/user/profile', authService.authorizeUser, userProfileRoute)

const userAccountRoute = require('./routes/user-account/index')
app.use('/user/account', authService.authorizeUser, userAccountRoute)

const userTeamRoute = require('./routes/user-team/index')
app.use('/user/team', authService.authorizeUser, userTeamRoute)

const adminDashboardRoute = require('./routes/admin-dashboard/index')
app.use('/admin/dashboard', authService.authorizeAdmin, adminDashboardRoute)

const adminUsersRoute = require('./routes/admin-users/index')
app.use('/admin/users', authService.authorizeAdmin, adminUsersRoute)

const adminAccountsRoute = require('./routes/admin-accounts/index')
app.use('/admin/accounts', authService.authorizeAdmin, adminAccountsRoute)

//
//
// Errors
// ############################################
app.use(async (error, req, res, next) => {
  const errorStatus = error.status || 500
  const errorMessage = error.userErrorMessage || 'Internal server error'
  req.log.error(`${errorStatus} error - ${errorMessage}`)
  if (error.stack) { req.log.error(error.stack) }
  return res.status(errorStatus).render('error', {
    status: errorStatus,
    message: errorMessage
  })
})
app.use(async (req, res, next) => {
  req.log.error('404 error :: ' + req.originalUrl)
  return res.status(404).render('error', {
    status: '404',
    message: 'Page not found'
  })
})

//
//
// Exports
// ############################################
module.exports = app
