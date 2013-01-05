//     Tardis.js 0.0.1
//     (c) 2013 Stephen Belanger, Opzi Inc.
//     Tardis may be freely distributed under the MIT license.

// ## Node.js
// 
// **Tardis** works with node.js! It doesn't use module.exports, as it doesn't
// export anything. It only modifies the global Date and Number objects.
// To use it, simply add `require('tardis')` at the top of your file and all
// this neat stuff will just work automatically!

// ## Date
// 
// First of all, **Tardis** hacks up the Date object prototype to make it more
// flexible, and provides some expressive helpers for common manipulations.

// ### Class methods

// You can create standard Date objects from a simple hash containing `years`,
// `months`, `days`, `hours`, `minutes`, `seconds`, and `milliseconds` as keys,
// matched to simple number values.
// 
// **NOTE**: For any key not provided, the current time value will be used.
Date.create = function (obj) {
  return (new Date).to(obj)
}

// ### Serialization

// Any date object can be converted to a simple hash description, which can be
// used with `create` to build a new date object.
Date.prototype.toObject = function () {
  return {
    years: this.getFullYear()
    , months: this.getMonth()
    , days: this.getDate()
    , hours: this.getHours()
    , minutes: this.getMinutes()
    , seconds: this.getSeconds()
    , milliseconds: this.getMilliseconds()
  }
}


// You can also easily clone existing date objects, so you can manipulate
// them without potentially breaking whatever other code supplied the object.
Date.prototype.clone = function () {
  return Date.create(this.toObject())
}

// ### Movement

// You can use `to` if you want to jump to a particular point in time.
// Any keys left blank will be filled in with the current time, so you can
// make jumps of varying specificity.
// 
// For example;
//     
//     // Wait a minute, Doc. Are you telling me that it's 8:25?
//     timestamp.to({ minutes: 0 })
// 
// **NOTE**: This is destructive to the base object!
Date.prototype.to = function (obj) {
  isFinite(obj.years) && this.setFullYear(obj.years)
  isFinite(obj.months) && this.setMonth(obj.months)
  isFinite(obj.days) && this.setDate(obj.days)
  isFinite(obj.hours) && this.setHours(obj.hours)
  isFinite(obj.minutes) && this.setMinutes(obj.minutes)
  isFinite(obj.seconds) && this.setSeconds(obj.seconds)
  isFinite(obj.milliseconds) && this.setMilliseconds(obj.milliseconds)
  return this
}


// You can also use `move` with positive or negative values to adjust the
// current time up or down relative to the current value of the date object.
// 
// For example;
//     
//     // Bill Murray used this one alot.
//     timestamp.move({ days: -1 })
// 
// **NOTE**: This is destructive to the base object!
Date.prototype.move = function (obj) {
  return this.to({
    years: this.getFullYear() + (obj.years || 0)
    , months: this.getMonth() + (obj.months || 0)
    , days: this.getDate() + (obj.days || 0)
    , hours: this.getHours() + (obj.hours || 0)
    , minutes: this.getMinutes() + (obj.minutes || 0)
    , seconds: this.getSeconds() + (obj.seconds || 0)
    , milliseconds: this.getMilliseconds() + (obj.milliseconds || 0)
  })
}

// ### Getter Flags

// You can also use a variety of getter flags to make many common manipulations
// more expressive. All getters are non-destructive, so you can use them safely
// without messing with the source object and potentially breaking other code
// that may access it.
// 
// You can get the `yesterday` or `tomorrow` of a particular point in time.
Date.prototype.__defineGetter__('yesterday', function () {
  return this.clone().move({ days: -1 })
})
Date.prototype.__defineGetter__('tomorrow', function () {
  return this.clone().move({ days: 1 })
})

// Or you could jump to the `start` or `end` of a day.
Date.prototype.__defineGetter__('start', function () {
  return this.clone().to({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
})
Date.prototype.__defineGetter__('end', function () {
  return this.start.move({ hours: 24, milliseconds: -1 })
})

// You can even jump to some common points such as `noon` or `midnight`.
Date.prototype.__defineGetter__('noon', function () {
  return this.start.move({ hours: 12 })
})
Date.prototype.__defineGetter__('midnight', function () {
  return this.end
})

// ### UTC Timestamps

// If you need a UTC adjusted timestamp, that's easy enough too.
// 
// You can use `toUTCObject` to grab a hash representation of the current date
// object with UTC adjustments applied.
Date.prototype.toUTCObject = function () {
  return {
    years: this.getUTCFullYear()
    , months: this.getUTCMonth()
    , days: this.getUTCDate()
    , hours: this.getUTCHours()
    , minutes: this.getUTCMinutes()
    , seconds: this.getUTCSeconds()
    , milliseconds: this.getUTCMilliseconds()
  }
}

// Or you can use the `utc` flag to create a copy of the current date object
// with the UTC adjustments applied.
Date.prototype.__defineGetter__('utc', function () {
  return this.clone().to(this.toUTCObject())
})


// ## Number
// 
// Now for some super-cool hacks to the number prototype for generating dates.
// It's good practice to wrap numbers in parenthesis, as Javascript interprets
// the first dot as a decimal point, so you need two for property access.

// ### Step size flags

// We can use these step size flags to expressively construct date objects.
// All the step size flags can be used in both singular and plural form.
// 
// For example;
// 
//     (1).year.ago
//     (2).months.ago
//     (3).days.ago
//     (4).hours.ago
//     (5).minutes.ago
//     (6).seconds.ago
//     (7).milliseconds.ago
//     
var flags = [
    'year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'
  ]
  , flag_error = 'Use a step flag (' + flags.join('(s), ') + '(s)) first'

flags.forEach(function (mode) {
  var plural = mode + 's'

  function getter () {
    this.date_obj || (this.date_obj = {})
    this.date_obj[plural] = {
      value: this.valueOf()
    }
    return this
  }

  Number.prototype.__defineGetter__(mode, getter)
  Number.prototype.__defineGetter__(plural, getter)
})

// ### Direction flags

// We can use `before` and `after` flags to specify whether to move into the
// future or into the past with our date construction. We can also use `from`
// as an alias of `after` for more understandable wording in some cases.
// 
// For example;
// 
//     (1).year.before.now
//     (2).days.after.now
//     (3).minutes.from.now
//     
function directionHandler (mode) {
  var before = mode == 'before'
  return function () {
    if ( ! this.date_obj) {
      throw new Error(flag_error)
    }

    for (var mode in this.date_obj) {
      var value = this.date_obj[mode]
      if (typeof value.before == 'undefined') {
        value.before = before
      }
    }

    return this
  }
}
Number.prototype.__defineGetter__('after', directionHandler('after'))
Number.prototype.__defineGetter__('before', directionHandler('before'))
Number.prototype.__defineGetter__('from', function () { return this.after })

// ### Origin Flags

// Lastly, we need some flags to specify the origin point to adjust from to
// construct the final date object. The most obvious flag is `now`, though
// you can also use some other common words such as `yesterday`, `today`,
// `tomorrow`, `midnight` or `noon`.
// 
// For the sake of clarity, there is also `ago` as an alias of `before.now`.
// 
// For example;
// 
//     (1).day.after.tomorrow
//     (2).days.before.yesterday
//     (3).hours.before.midnight
//     (4).minutes.ago
//     (5).seconds.after.noon
//     
Number.prototype.__defineGetter__('now', function () {
  if ( ! this.date_obj) {
    throw new Error('You haven\'t built a valid date definition yet')
  }

  var result = {}
  for (var mode in this.date_obj) {
    var value = this.date_obj[mode]
    result[mode] = value.before && -value.value || value.value;
  }

  return (new Date).move(result)
})

Number.prototype.__defineGetter__('yesterday', function () { return this.now.yesterday })
Number.prototype.__defineGetter__('today', function () { return this.now })
Number.prototype.__defineGetter__('tomorrow', function () { return this.now.tomorrow })
Number.prototype.__defineGetter__('midnight', function () { return this.now.midnight })
Number.prototype.__defineGetter__('ago', function () { return this.before.now })
Number.prototype.__defineGetter__('noon', function () { return this.now.noon })

// ### Chaining

// And to save the best for last; you can even chain manipulations with `and`!
// 
// For example;
//     
//     (5).minutes.and(30).seconds.from.now
//     (1).year.before.and(1).day.after.now
Number.prototype.and = function (new_val) {
  if ( ! this.date_obj) {
    throw new Error('You haven\'t built a valid date definition yet')
  }
  this.valueOf = function () { return new_val }
  return this
};