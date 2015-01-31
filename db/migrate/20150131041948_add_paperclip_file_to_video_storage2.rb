class AddPaperclipFileToVideoStorage2 < ActiveRecord::Migration
  def self.up
    add_attachment :video_storages, :file
  end

  def self.down
    remove_attachment :video_storages, :file
  end
end
