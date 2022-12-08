fn main() {
    {
        // Stack allocation
        let static_int = 1;
        // Heap allocation
        let dynamic_vec = vec![1, 2, 3];
    } // <- end of scope!
    println!("{static_int}"); // Error: cannot find value of x in this scope
    println!("{dynamic_vec:?}"); // Error: cannot find value of x in this scope
}
