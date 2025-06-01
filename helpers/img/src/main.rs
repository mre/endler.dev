//! Image processing tool for blog content
//!
//! Converts raw images to optimized web formats (JPEG + AVIF)

#![warn(clippy::all, clippy::pedantic, clippy::nursery)]

use anyhow::{anyhow, Context as _, Result};
use duct::cmd;
use glob::glob;
use rayon::prelude::*;
use std::{
    fs,
    path::{Path, PathBuf},
};
use which::which;

/// Width of images on blog
const MAX_IMAGE_WIDTH: u32 = 650; // pixels
/// Input path pattern for raw images
const INPUT_PATH: &str = "content/**/raw/*";

fn main() -> Result<()> {
    // Check dependencies
    which("magick").with_context(|| "Missing ImageMagick, required for execution")?;

    let entries: Vec<PathBuf> = glob(INPUT_PATH)?.filter_map(Result::ok).collect();
    println!("Inspecting {} images", entries.len());

    entries.into_par_iter().for_each(|path| {
        if let Err(err) = handle(&path) {
            eprintln!("Error processing {}: {err}", path.display());
        }
    });

    Ok(())
}

/// Copy and resize original image
fn copy_original(path: &Path, out_file: &Path) -> Result<()> {
    println!("Processing original: {}", out_file.display());

    let Some(ext) = path.extension() else {
        return Err(anyhow!("Cannot get extension for {}", path.display()));
    };

    if !out_file.exists() {
        if ext == "svg" || ext == "gif" {
            // Simply copy over SVG/GIF to target directory verbatim
            fs::copy(path, out_file)?;
        } else {
            println!(
                "magick {} -strip -resize {}> {}",
                path.display(),
                MAX_IMAGE_WIDTH,
                out_file.display()
            );
            cmd!(
                "magick",
                path,
                "-strip",
                "-resize",
                format!("{MAX_IMAGE_WIDTH}>"),
                out_file,
            )
            .run()?;
        }
    }

    // Skip JPG generation for GIFs to avoid creating individual frames
    if ext == "gif" {
        return Ok(());
    }

    // Create optimized JPG version
    let jpg_file = out_file.with_extension("jpg");
    if !jpg_file.exists() {
        cmd!(
            "magick",
            path,
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
            "sRGB",
            "-resize",
            format!("{MAX_IMAGE_WIDTH}>"),
            &jpg_file
        )
        .run()?;
    }

    Ok(())
}

/// Handle processing of a single image file
fn handle(path: &Path) -> Result<()> {
    println!("Handling: {}", path.display());

    let Some(filename) = path.file_name() else {
        return Err(anyhow!("Unexpected file: {}", path.display()));
    };

    let Some(in_dir) = path.parent() else {
        return Err(anyhow!("Unexpected dir: {}", path.display()));
    };

    // Build output directory path
    let content_relative = in_dir.strip_prefix("content/")?;
    let Some(parent_dir) = content_relative.parent() else {
        return Err(anyhow!("Cannot get parent for {}", in_dir.display()));
    };

    let out_dir = Path::new("static").join(parent_dir);
    let out_file = out_dir.join(filename);

    // Skip system files
    if filename == ".DS_Store" {
        return Ok(());
    }

    let Some(orig_extension) = path.extension() else {
        return Err(anyhow!("Cannot get extension for {}", path.display()));
    };

    // Skip design files
    if orig_extension == "afdesign" {
        return Ok(());
    }

    fs::create_dir_all(&out_dir)?;
    copy_original(path, &out_file)?;

    // Skip vector/animated formats
    if orig_extension == "svg" || orig_extension == "gif" {
        return Ok(());
    }

    // Create AVIF version with Chrome-compatible settings
    let avif_file = out_file.with_extension("avif");
    if !avif_file.exists() {
        println!("Creating AVIF: {}", avif_file.display());
        cmd!(
            "magick",
            &out_file,
            "-quality",
            "90",
            "-define",
            "avif:method=0", // Chrome-compatible encoding
            "-colorspace",
            "sRGB",
            "-strip",
            &avif_file
        )
        .run()?;
    }

    Ok(())
}
