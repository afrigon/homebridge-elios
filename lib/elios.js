const config = require("../config")
const elios = require("../native/elios.node")
const { Climate, Temperature } = require("./climate")

const manufacturer = "Elios"
const model = "Heat Pump"

var Service
var Characteristic

class EliosAccessoryPlugin {
    constructor(log, homekitConfig, api) {
        this.log = log
        this.config = homekitConfig
        this.api = api

        // extract name from config
        this.name = this.config.name

        this.service = new Service.Thermostat(this.name)
        this.info = new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Manufacturer, manufacturer)
            .setCharacteristic(Characteristic.Model, model)
            .setCharacteristic(Characteristic.SerialNumber, config.serial_number)

        // create handlers for required characteristics
        this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .on('get', this.handleCurrentHeatingCoolingStateGet.bind(this))

        this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .on('get', this.handleTargetHeatingCoolingStateGet.bind(this))
            .on('set', this.handleTargetHeatingCoolingStateSet.bind(this))

        this.service.getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', this.handleCurrentTemperatureGet.bind(this))

        this.service.getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on('get', this.handleCurrentRelativeHumidityGet.bind(this))
        

        // sets the value between minValue and maxValue to avoid a crash
        this.service.updateCharacteristic(Characteristic.TargetTemperature, 24)

        this.service.getCharacteristic(Characteristic.TargetTemperature)
            .on('get', this.handleTargetTemperatureGet.bind(this))
            .on('set', this.handleTargetTemperatureSet.bind(this))
            .setProps({
                minValue: 17,
                maxValue: 30,
                minStep: 1
            })

        this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('get', this.handleTemperatureDisplayUnitsGet.bind(this))
            .on('set', this.handleTemperatureDisplayUnitsSet.bind(this))
    }

    getServices() {
        return [this.service, this.info]
    }

    handleCurrentHeatingCoolingStateGet(callback) {
        const value = this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState).value

        this.log.debug("GET current mode: " + value)

        callback(null, value)
    }

    handleTargetHeatingCoolingStateGet(callback) {
        const value = this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState).value

        this.log.debug("GET target mode: " + value)

        callback(null, value)
    }

    handleTemperatureDisplayUnitsGet(callback) {
        const value = this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits).value

        this.log.debug("GET unit: " + value)

        callback(null, value)
    }

    handleCurrentTemperatureGet(callback) {
        this.log.debug("GET current temp")

        Climate.sample((err, climate) => {
            if (err) {
                this.log.debug(err)

                return callback(err)
            }

            this.log.debug(climate.temperature.value)

            callback(null, climate.temperature.value)
        })
    }   

    handleCurrentRelativeHumidityGet(callback) {
        this.log.debug("GET current humidity")

        Climate.sample((err, climate) => {
            if (err) {
                this.log.debug(err)

                return callback(err)
            }

            this.log.debug(climate.humidity.value)

            callback(null, climate.humidity.value)
        })

    }

    handleTargetTemperatureGet(callback) {
        const value = this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits)
        callback(null, value)
    }

    handleTemperatureDisplayUnitsSet(value, callback) {
        // todo: translate to correct unit on unit
        this.service.updateCharacteristic(Characteristic.TemperatureDisplayUnits, value)
        callback(null)
    }

    handleTargetHeatingCoolingStateSet(value, callback) {
        // send ir
        // if no err
        this.service.updateCharacteristic(Characteristic.TargetHeatingCoolingState, value)
        callback(null)
    }

    handleTargetTemperatureSet(value, callback) {
        this.service.updateCharacteristic(Characteristic.TargetTemperature, value)
        callback(null);
    }

}

module.exports = {
    register: api => {
        Service = api.hap.Service
        Characteristic = api.hap.Characteristic

        api.registerAccessory('elios', EliosAccessoryPlugin)
    }
}
