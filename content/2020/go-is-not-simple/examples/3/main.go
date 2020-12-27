package main

import "fmt"

type Warhead int

const (
	Activated = 0
	Idle      = 1
)

func main() {
	var rocket Warhead

	for {
		switch rocket {
		case Activated:
			fmt.Println("Lord have mercy")
		case Idle:
			fmt.Println("All good")
		}
	}
}
