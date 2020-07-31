const dht = require("node-dht-sensor")
const config = require("../config")

const FAHRENHEIT = "fahrenheit"
const CELCIUS = "celcius"
const SENSOR_ID = 22

class Climate {
    constructor(temperature, humidity) {
        this.temperature = temperature
        this.humidity = humidity
    }

    static sample(callback) {
        dht.read(SENSOR_ID, config.thermometer_pin, (err, temperature, humidity) => {
            const t = new Temperature(temperature)
            const h = new Humidity(humidity)

            callback(err, new Climate(t, h))
        })
    }
}

class Temperature {
    constructor(value, unit = CELCIUS) {
        this.value = value
        this.unit = unit
    }

    as_fahrenheit() {
        if (this.unit == FAHRENHEIT) {
            return new Temperature(this.value, FAHRENHEIT)
        }

        return new Temperature(this.value * 9 / 5 + 32, FAHRENHEIT)
    }

    as_celcius() {
        if (this.unit == CELCIUS) {
            return new Temperature(this.value, CELCIUS)
        }

        return new Temperature((this.value - 32) * 5 / 9, CELCIUS)
    }
}

class Humidity {
    constructor(value) {
        this.value = value
    }
}

module.exports = { CELCIUS, FAHRENHEIT, Humidity, Temperature, Climate }
