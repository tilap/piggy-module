BIN = ./node_modules/.bin

help:
	@cat Makefile.help

# Clean generated files
c: clean
clean:
	rm -Rf ./lib/*

# Generate and compile everything needed
b: build
build:
	$(BIN)/gulp build

# Lauch watcher on dev sources and run required compilators
w: watch
watch:
	$(BIN)/gulp watch

cb: clean build
bw: build watch
cbw: clean build watch
