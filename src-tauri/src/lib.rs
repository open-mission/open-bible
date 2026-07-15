use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  #[cfg(target_os = "linux")]
  std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_process::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Build native application menu
      let handle = app.handle();
      
      let settings_item = MenuItemBuilder::new("Configurações...")
        .id("settings")
        .accelerator("CmdOrCtrl+,")
        .build(handle)?;

      let menu = MenuBuilder::new(handle)
        .items(&[
          &SubmenuBuilder::new(handle, "Open Bible")
            .about(None)
            .separator()
            .item(&settings_item)
            .separator()
            .services()
            .separator()
            .hide()
            .hide_others()
            .show_all()
            .separator()
            .quit()
            .build()?,
          &SubmenuBuilder::new(handle, "Arquivo")
            .close_window()
            .build()?,
          &SubmenuBuilder::new(handle, "Editar")
            .undo()
            .redo()
            .separator()
            .cut()
            .copy()
            .paste()
            .select_all()
            .build()?,
          &SubmenuBuilder::new(handle, "Janela")
            .minimize()
            .maximize()
            .build()?,
        ])
        .build()?;

      app.set_menu(menu)?;

      // Listen for menu events
      app.on_menu_event(move |app_handle, event| {
        if event.id().as_ref() == "settings" {
          let _ = app_handle.emit("open-settings", ());
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
