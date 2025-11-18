use std::fs;
use std::path::Path;

#[derive(Debug, serde::Serialize)]
pub struct FsNode {
    pub name: String,
    pub path: String,
    pub children: Vec<FsNode>, // Empty for files, contains nodes for directories
    pub is_file: bool,
}

pub fn build_content_tree(path: impl AsRef<Path>) -> Option<FsNode> {
    let path = path.as_ref();
    let name = path.file_name()?.to_string_lossy().to_string();
    let path_str = path.to_string_lossy().to_string();

    if path.is_file() {
        if path.extension().map_or(false, |ext| ext == "astro") {
            return Some(FsNode {
                name,
                path: path_str,
                children: vec![],
                is_file: true,
            });
        }
        return None;
    }

    if path.is_dir() {
        let mut children = vec![];

        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.filter_map(|e| e.ok()) {
                if let Some(child) = build_content_tree(entry.path()) {
                    children.push(child);
                }
            }
        }

        // Only include directory if it has astro files (or subdirs with astro files)
        // if !children.is_empty() {
        return Some(FsNode {
            name,
            path: path_str,
            children,
            is_file: false,
        });
        // }
    }

    None
}

#[tauri::command]
fn get_content_tree(path: String) -> Option<FsNode> {
    build_content_tree(path)
}

#[tauri::command]
fn get_file_content(path: String) -> String {
    let path = Path::new(&path);
    if path.is_file() {
        return fs::read_to_string(path).unwrap_or_default();
    }
    "".to_string()
}

#[tauri::command]
fn save_file_content(path: String, content: String) -> Result<(), String> {
    let path = Path::new(&path);
    if path.is_file() {
        if path.extension().map_or(false, |ext| ext == "astro") {
            fs::write(path, content).map_err(|e| e.to_string())
        } else {
            Err("File is not an astro file".to_string())
        }
    } else {
        Err("Path is not a file".to_string())
    }
}

#[tauri::command]
fn create_file(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if path.extension().map_or(false, |ext| ext == "astro") {
        fs::write(path, "").map_err(|e| e.to_string())
    } else {
        Err("File is not an astro file".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_content_tree,
            get_file_content,
            save_file_content,
            create_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
