use anyhow::{anyhow, Context, Result};
use duct::cmd;
use glob::glob;
use rayon::prelude::*;
use std::{
    fs,
    path::{Path, PathBuf},
};

use which::which;

// Width of images on blog.
const MAX_IMAGE_WIDTH: u32 = 650; // pixels
const INPUT_PATH: &str = "content/**/raw/*";

fn check_deps() -> Result<()> {
    for dep in vec!["magick", "cavif", "cwebp"] {
        which(dep).with_context(|| format!("Missing binary required for execution: {}", dep))?;
    }
    Ok(())
}

fn main() -> Result<()> {
    check_deps()?;
    let entries: Vec<PathBuf> = glob(INPUT_PATH)?.filter_map(Result::ok).collect();
    println!("Inspecting {} images", entries.len());
    entries.into_par_iter().map(handle).collect::<Vec<_>>();
    Ok(())
}

fn copy_original(path: &Path, out_file: &Path) -> Result<()> {
    println!("Copying original to {:?}", out_file);
    let ext = path
        .extension()
        .ok_or_else(|| anyhow!("Cannot get extension for {}", path.display()))?;

    if !out_file.exists() {
        if ext == "svg" || ext == "gif" {
            // Simply copy over SVG to target directory for now.
            // In the future we could use svgo to optimize here.
            fs::copy(path, out_file)?;
        } else {
            println!(
                "magick convert {:?} -strip -resize {}> {:?}",
                &path, MAX_IMAGE_WIDTH, &out_file
            );
            cmd!(
                "magick",
                "convert",
                &path,
                "-strip",
                "-resize",
                MAX_IMAGE_WIDTH.to_string() + ">",
                out_file,
            )
            .run()?;
        }
    }

    if !out_file.with_extension("jpg").exists() {
        cmd!(
            "magick",
            "convert",
            &path,
            "-strip",
            "-interlace",
            "JPEG",
            "-sharpen",
            "0x1.0",
            "-quality",
            "90%",
            "-sampling-factor",
            "4:2:0",
            "-colorspace",
            "RGB",
            "-resize",
            MAX_IMAGE_WIDTH.to_string() + ">",
            out_file.with_extension("jpg")
        )
        .run()?;

        // let output = cmd!("cjpeg", "-quality", "85", "-optimize", out_file)
        //     .stdout_capture()
        //     .read()?;
        // fs::write(out_file.with_extension("jpg"), output)?;
    }
    Ok(())
}

fn handle(path: PathBuf) -> Result<()> {
    println!("Handling {:?}", path);
    let filename = path
        .file_name()
        .ok_or_else(|| anyhow!("Unexpected file: {}", path.display()))?;
    let in_dir = path
        .parent()
        .ok_or_else(|| anyhow!("Unexpected dir: {}", path.display()))?;

    // This is not so beautiful...
    let out_dir = Path::new("static").join(
        in_dir
            .strip_prefix("content/")?
            .parent()
            .ok_or_else(|| anyhow!("Cannot get parent for {}", in_dir.display()))?,
    );
    let out_file = out_dir.join(filename);

    if filename == ".DS_Store" {
        return Ok(());
    }

    let orig_extension = path
        .extension()
        .ok_or_else(|| anyhow!("Cannot get extension for {}", path.display()))?;

    if orig_extension == "afdesign" {
        return Ok(());
    }

    fs::create_dir_all(&out_dir)?;

    copy_original(&path, &out_file)?;

    if orig_extension == "svg" || orig_extension == "gif" {
        // We're done here.
        return Ok(());
    }

    let webp_file = out_file.with_extension("webp");
    if !webp_file.exists() {
        cmd!("cwebp", &out_file, "-o", webp_file).run()?;
    }

    let avif_file = out_file.with_extension("avif");
    if !avif_file.exists() {
        cmd!(
            "cavif",
            "--quality=90",
            "--overwrite",
            "-o",
            avif_file,
            &out_file
        )
        .run()?;
    }
    Ok(())
}
