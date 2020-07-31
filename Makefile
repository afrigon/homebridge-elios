.PHONY: native
native:
	cargo build --release --manifest-path  native/Cargo.toml
	cp native/target/release/libelios.so native/elios.node
