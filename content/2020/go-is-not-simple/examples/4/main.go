package main

import "fmt"

func contains(l []int, e int) bool {
	for _, a := range l {
		if a == e {
			return true
		}
	}
	return false
}

func main() {
	list := []int{5, 1, 2, 1, 3, 4, 1, 5}
	var unique []int

	for _, i := range list {
		if contains(unique, i) {
			continue
		} else {
			unique = append(unique, i)
		}
	}
	fmt.Println(unique)
}
