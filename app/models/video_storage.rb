class VideoStorage < ActiveRecord::Base
	has_attached_file :file
  validates_attachment_content_type :file,
    :content_type => ['video/quicktime', 'video/mp4', 
    									'video/mpeg', 'video/x-msvideo', 'video/x-sgi-movie']
end
