use acproto::common::{AsBitVec, Temperature};
use acproto::elios::*;

use nodejs_sys::{
    napi_callback_info, napi_create_function, napi_create_int32, napi_env, napi_get_cb_info,
    napi_get_value_uint32, napi_set_named_property, napi_value,
};
use std::ffi::CString;

#[no_mangle]
pub unsafe extern "C" fn send(env: napi_env, info: napi_callback_info) -> napi_value {
    let mut err: i32 = 0;

    let mut buffer: [napi_value; 4] = std::mem::MaybeUninit::zeroed().assume_init();
    let mut argc = 4 as usize;

    napi_get_cb_info(
        env,
        info,
        &mut argc,
        buffer.as_mut_ptr(),
        std::ptr::null_mut(),
        std::ptr::null_mut(),
    );

    let mut pin = 0 as u32;
    let mut mode = 0 as u32;
    let mut temperature = 0 as u32;
    let mut unit = 0 as u32;

    napi_get_value_uint32(env, buffer[0], &mut pin);
    napi_get_value_uint32(env, buffer[1], &mut mode);
    napi_get_value_uint32(env, buffer[2], &mut temperature);
    napi_get_value_uint32(env, buffer[3], &mut unit);

    if let Some(state) = EliosState::new(
        Some(EliosFanSpeed::Automatic),
        match mode {
            1 => EliosMode::Cold,
            2 => EliosMode::Heat,
            _ => EliosMode::Automatic,
        },
        Some(if unit == 0 {
            Temperature::Celcius(temperature as u8)
        } else {
            Temperature::Fahrenheit(temperature as u8)
        }),
        mode != 0,
        false,
    ) {
        let data = ELIOS_IR.encode(state.as_bitvec());
    } else {
        err = 1;
    }

    let mut result: napi_value = std::mem::zeroed();
    napi_create_int32(env, err, &mut result);

    result
}

#[no_mangle]
pub unsafe extern "C" fn napi_register_module_v1(
    env: napi_env,
    exports: napi_value,
) -> nodejs_sys::napi_value {
    let send_str = CString::new("send").expect("CString::new failed");
    let mut local: napi_value = std::mem::zeroed();

    napi_create_function(
        env,
        send_str.as_ptr(),
        4,
        Some(send),
        std::ptr::null_mut(),
        &mut local,
    );

    napi_set_named_property(env, exports, send_str.as_ptr(), local);

    exports
}
