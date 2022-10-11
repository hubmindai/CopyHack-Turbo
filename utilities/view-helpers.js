//
//
// Imports
// ############################################
const { format, utcToZonedTime } = require('date-fns-tz')

//
//
// Methods
// ############################################
exports.init = (hbsInstance) => {
  hbsInstance.registerHelper('is', (arg1, arg2, options) => {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
  })

  hbsInstance.registerHelper('stringifyJSON', (data, options) => {
    return options.fn(JSON.stringify(data))
  })

  hbsInstance.registerHelper('parseJSON', (data, options) => {
    return options.fn(JSON.parse(data))
  })

  hbsInstance.registerHelper('convertNewLines', (data) => {
    return data.replace(/(?:\r\n|\r|\n)/g, '<br>')
  })

  hbsInstance.registerHelper('formatDate', (date, dataFormat, timeZone) => {
    // Check args
    if (!format) {
      throw new Error('Invalid date')
    }
    if (!date) {
      return ''
    }
    // If date includes time format date with time in specified timeZone
    const dateIncludesTime = date.toString().search('00:00:00') === -1
    if (dateIncludesTime) {
      const newDate = utcToZonedTime(date, timeZone)
      return format(newDate, dataFormat)
    }
    // If date does not include time format date only in UTC
    const newDate = date
    return format(newDate, dataFormat)
  })

  hbsInstance.registerHelper('add', (value, addition) => {
    value = parseFloat(value)
    addition = parseFloat(addition)
    return value + addition
  })

  hbsInstance.registerHelper('subtract', (value, subtraction) => {
    value = parseFloat(value)
    subtraction = parseFloat(subtraction)
    return value - subtraction
  })

  hbsInstance.registerHelper('divide', (value, divisor) => {
    value = parseFloat(value)
    divisor = parseFloat(divisor)
    return value / divisor
  })

  hbsInstance.registerHelper('multiply', (value, multiplier) => {
    value = parseFloat(value)
    multiplier = parseFloat(multiplier)
    return value * multiplier
  })

  hbsInstance.registerHelper('floor', (value) => {
    value = parseFloat(value)
    return Math.floor(value)
  })

  hbsInstance.registerHelper('ceil', (value) => {
    value = parseFloat(value)
    return Math.ceil(value)
  })

  hbsInstance.registerHelper('round', (value) => {
    value = parseFloat(value)
    return Math.round(value)
  })

  hbsInstance.registerHelper('toFixed', (number, digits) => {
    number = parseFloat(number)
    digits = typeof precision === 'undefined' ? 0 : digits
    return number.toFixed(digits)
  })

  hbsInstance.registerHelper('toPrecision', (number, precision) => {
    number = parseFloat(number)
    precision = typeof precision === 'undefined' ? 1 : precision
    return number.toPrecision(precision)
  })

  hbsInstance.registerHelper('gt', (value, test, options) => {
    if (value > test) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  })

  hbsInstance.registerHelper('gte', (value, test, options) => {
    if (value >= test) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  })

  hbsInstance.registerHelper('lt', (value, test, options) => {
    if (value < test) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  })

  hbsInstance.registerHelper('lte', (value, test, options) => {
    if (value <= test) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  })
}
