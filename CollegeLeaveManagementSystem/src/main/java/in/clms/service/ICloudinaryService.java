package in.clms.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class ICloudinaryService {

	private final Cloudinary cloudinary;

	public ICloudinaryService(Cloudinary cloudinary) {
		this.cloudinary = cloudinary;
	}

	// Upload file to Cloudinary
	public Map<?, ?> uploadFile(MultipartFile file, String folder) throws IOException {

		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("File cannot be empty");
		}

		return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "clms/" + folder,
				"resource_type", "auto", "use_filename", true, "unique_filename", true));
	}

	// Delete file from Cloudinary
	public Map<?, ?> deleteFile(String publicId, String resourceType) throws Exception {

		if (publicId == null || publicId.isBlank()) {
			throw new IllegalArgumentException("Public ID is required");
		}

		return cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
	}
}