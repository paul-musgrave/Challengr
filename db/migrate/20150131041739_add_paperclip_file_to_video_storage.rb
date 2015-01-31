class AddPaperclipFileToVideoStorage < ActiveRecord::Migration
  def self.up
    add_attachment :video_storages, :avatar
  end

  def self.down
    remove_attachment :video_storages, :avatar
  end
end
