use std::{
    error::Error,
    fs::File,
    io::{self, BufRead},
    path::Path,
};

const USAGE: &str = "usage: look [-df] [-t char] string [file ...]";

// https://doc.rust-lang.org/rust-by-example/std_misc/file/read_lines.html
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}
fn main() -> Result<(), Box<dyn Error>> {
    let prefix = std::env::args().nth(1).unwrap_or_else(|| {
        println!("{}", USAGE);
        std::process::exit(2);
    });

    for line in read_lines("/usr/share/dict/words")? {
        if let Ok(line) = line {
            if line.to_lowercase().starts_with(&prefix) {
                println!("{}", line);
            }
        }
    }

    Ok(())
}
