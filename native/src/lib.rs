extern crate acproto;
extern crate dht11;

use acproto::common::{AsBitVec, Temperature};
use acproto::elios::*;
use dht11::DHT11;

use rust_pigpio::{delay, initialize, set_mode, terminate, write, OFF, ON, OUTPUT};

#[no_mangle]
extern "C" fn ir_send(mut temperature: u8, mut mode: u8, mut pin: u8) {}

#[no_mangle]
extern "C" fn sample_temperature(pin: u8) -> f32 {}
