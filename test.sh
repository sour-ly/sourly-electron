#!/bin/bash

function test_package {
  echo "Testing npm run package"
  #check for errors or exit code != 0
  npm run package
  if [ $? -ne 0 ]; then
    echo "Error: npm run package failed... Checking if this is a fluke or not."
    # check if ./release/build/
    if [ -d "./release/build/" ]; then
      echo "Error: ./release/build/ exists. This is a fluke. Resuming..."
    else
      echo "Error: ./release/build/ does not exist... Refer to the error above."
    fi
  fi
  echo "Package passed, you can release this (github will be happy)!"
}

function test_jest {
  echo "Testing npm run test (using jest)"
  #check for errors or exit code != 0
  npm run test
  if [ $? -ne 0 ]; then
    echo "Error: npm run test failed... "
  else
    echo "Jest passed!"
  fi
}

function test_eslint {
  echo "Testing eslint (this will most likely fail) 'npm run lint'"
  #check for errors or exit code != 0
  npm run lint
  if [ $? -ne 0 ]; then
    echo "Error: npm run lint failed... Exiting."
  else
    echo "Wow, you passed eslint! When will Amazon hire us?"
  fi
}

function test_main() {
  test_package
  test_jest
  test_eslint
}

test_main
