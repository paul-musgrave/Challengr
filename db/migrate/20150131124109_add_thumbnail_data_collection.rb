class AddThumbnailDataCollection < ActiveRecord::Migration
  def self.up
    add_attachment :video_storages, :thumbnail
  end

  def self.down
    remove_attachment :video_storages, :thumbnail
  end
end
