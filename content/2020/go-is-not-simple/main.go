package main

import "fmt"

func main() {

	messages := make(chan int)

	go func() {
		messages <- 0
		close(messages)
	}()

	for {
		msg := <-messages
		fmt.Println(msg) // Is this an actual 0 or the "zero value" of a closed channel?
		// We forgot to check "ok"! msg, ok := <-messages
	}
}
