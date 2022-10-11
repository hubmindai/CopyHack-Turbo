//
//
// Imports
// ############################################
const app = require('./app.js')

//
//
// Main
// ############################################
const port = process.env.PORT || 1262
app.listen(port, () => console.log(`app listening on port ${port}`))
