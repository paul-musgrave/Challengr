class CreateVideoStorages < ActiveRecord::Migration
  def change
    create_table :video_storages do |t|

      t.timestamps
    end
  end
end
