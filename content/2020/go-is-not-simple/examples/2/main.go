package main

import "fmt"

func main() {
	fruits := []string{"mangos", "bananas", "potatoes"}

	for _, fruit := range fruits {
		if fruit == "potatos" {
			fmt.Println("Sweet lemony Lincoln! Potatoes are no fruits.")
		}
	}
}
