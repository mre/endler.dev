use anyhow::{Context, Result};

#[derive(Debug, PartialEq)]
struct User<'a> {
    id: u32,
    name: &'a str,
    hobbies: Vec<&'a str>,
}

fn parse_user(input: &str) -> Result<User> {
    let mut iter = input.split(';');
    let id = iter.next().context("no id")?.parse()?;
    let name = iter.next().context("no name")?;
    let hobbies = iter.next().context("no hobbies")?.split(',').collect();
    Ok(User { id, name, hobbies })
}

fn main() -> Result<()> {
    let input = "1;John;Programming,Reading";
    let user = parse_user(input).context("Parse error")?;
    assert_eq!(
        user,
        User {
            id: 1,
            name: "John",
            hobbies: vec!["Programming", "Reading"]
        }
    );
    Ok(())
}
