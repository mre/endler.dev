use bumpalo::Bump;

enum Fur {
    White,
    Black,
    Colorful,
}

struct Kitty {
    name: String,
    age: u8,
    fur: Fur,
}

fn main() {
    // Create a new arena to bump allocate into.
    let bump = Bump::new();

    // Allocate values into the arena.
    let oskar = bump.alloc(Kitty {
        name: "Oskar".to_string(),
        age: 1,
        fur: Fur::White,
    });

    // Exclusive, mutable references to the just-allocated value are returned.
    oskar.age += 1;
    println!("Oskar is now {} years old", oskar.age);
}
