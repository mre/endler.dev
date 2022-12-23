use bumpalo::{collections::Vec, Bump};

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
    let mut kitties = Vec::new_in(&bump);
    kitties.push(Kitty {
        name: "Oskar".to_string(),
        age: 1,
        fur: Fur::White,
    });
    kitties.push(Kitty {
        name: "Flecki".to_string(),
        age: 10,
        fur: Fur::Colorful,
    });

    // Use the allocated values.
    for kitty in kitties {
        println!("{} is {} years old", kitty.name, kitty.age);
    }
}
