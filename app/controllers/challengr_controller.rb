class ChallengrController < ApplicationController
	skip_before_action :verify_authenticity_token

	def index

	end

	def post_video
		# Post the video using PaperClip and return the public url
		video = VideoStorage.new
		video.file = params[:video][:file]
		begin video.save!
			render text: video.file.url
		rescue
			render text: "Wrong filetype"
		end
	end

	# Use strong_parameters for attribute whitelisting
	# Be sure to update your create() and update() controller methods.

	def video_storage_params
	  params.require(:video_storage).permit(:file)
	end

end
