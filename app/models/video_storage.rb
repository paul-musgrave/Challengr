class VideoStorage < ActiveRecord::Base
	has_attached_file :file
	has_attached_file :thumbnail
  # validates_attachment_content_type :file,
  #   :content_type => ['video/quicktime', 'video/mp4', 
  #   									'video/mpeg', 'video/x-msvideo', 'video/x-sgi-movie']
  validates_attachment_content_type :thumbnail,
    :content_type => ['image/jpeg']
    
end
