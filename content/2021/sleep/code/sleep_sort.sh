#!/usr/bin/env bash

function sleep_and_echo {
  sleep "$1"
  echo "$1"
}

for val in "$@"; do
  sleep_and_echo "$val" &
done

wait