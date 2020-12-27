package main

import "fmt"

func main() {
	list := []int{5, 1, 2, 1, 3, 4, 1, 5}
	lookup := map[int]bool{}

	for _, i := range list {
		if _, ok := lookup[i]; !ok {
			lookup[i] = true
		}
	}

	// Convert back to slice
	var unique []int
	for k := range lookup {
		unique = append(unique, k)
	}
	fmt.Println(unique)
}
