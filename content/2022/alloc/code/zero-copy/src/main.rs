fn main() {
    let data = "Hello, world!";

    let hello = &data[0..5];
    let world = &data[7..12];

    println!("{} {}", hello, world);
}
