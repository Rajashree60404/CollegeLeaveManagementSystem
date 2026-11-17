package in.clms.controller;

import java.time.LocalDate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;

import java.io.IOException;

import org.springframework.http.ContentDisposition;
import org.springframework.core.io.Resource;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Element;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import in.clms.dto.LeaveRequestDTO;
import in.clms.enums.LeaveType;
import in.clms.service.LeaveRequestService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@Tag(name = "CLMS Project", description = "Manage student leave request")
@RequestMapping("/leaves")
public class LeaveRequestController {

	private final LeaveRequestService leaveRequestService;

	public LeaveRequestController(LeaveRequestService leaveRequestService) {

		this.leaveRequestService = leaveRequestService;
	}

	// Student Apply Leave

	@PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<LeaveRequestDTO> applyLeave(

			@RequestParam("studentId") Long studentId, @RequestParam("fromDate") String fromDate,
			@RequestParam("toDate") String toDate, @RequestParam("reason") String reason,
			@RequestParam(value = "leaveType", defaultValue = "NORMAL") LeaveType leaveType,
			@RequestParam(value = "medicalFile", required = false) MultipartFile medicalFile) {

		LeaveRequestDTO leaveRequestDTO = new LeaveRequestDTO();

		leaveRequestDTO.setStudentId(studentId);

		leaveRequestDTO.setFromDate(LocalDate.parse(fromDate));

		leaveRequestDTO.setToDate(LocalDate.parse(toDate));

		leaveRequestDTO.setReason(reason);

		leaveRequestDTO.setLeaveType(leaveType);

		LeaveRequestDTO savedLeave = leaveRequestService.applyLeave(leaveRequestDTO, medicalFile);

		return ResponseEntity.status(HttpStatus.CREATED).body(savedLeave);
	}

	// Get Leave By ID
	@GetMapping("/{id}")
	public ResponseEntity<LeaveRequestDTO> getLeaveById(@PathVariable Long id) {

		LeaveRequestDTO leave = leaveRequestService.getLeaveById(id);

		return new ResponseEntity<LeaveRequestDTO>(HttpStatus.OK);
	}

	// Get All Leave Requests
	@GetMapping
	public ResponseEntity<List<LeaveRequestDTO>> getAllLeaves() {

		List<LeaveRequestDTO> leaves = leaveRequestService.getAllLeaves();
		return ResponseEntity.ok(leaves);

	}

	// Get Leaves By Student ID
	@GetMapping("/student/{studentId}")
	public ResponseEntity<List<LeaveRequestDTO>> getLeavesByStudentId(@PathVariable Long studentId) {

		List<LeaveRequestDTO> leaves = leaveRequestService.getLeavesByStudentId(studentId);

		return ResponseEntity.ok(leaves);
	}

	// Staff Approve
	@PutMapping("/{id}/approve")
	public ResponseEntity<LeaveRequestDTO> approve(@PathVariable Long id) {

		LeaveRequestDTO leave = leaveRequestService.approve(id);

		return ResponseEntity.ok(leave);
	}

	// Staff Reject
	@PutMapping("/{id}/reject")
	public ResponseEntity<LeaveRequestDTO> reject(@PathVariable Long id) {

		LeaveRequestDTO leave = leaveRequestService.reject(id);

		return ResponseEntity.ok(leave);
	}

	// Parent Approve
	@PutMapping("/{id}/parent/approve")
	public ResponseEntity<LeaveRequestDTO> parentApprove(@PathVariable Long id) {

		LeaveRequestDTO leave = leaveRequestService.parentApprove(id);

		return ResponseEntity.ok(leave);
	}

	// Parent Reject
	@PutMapping("/{id}/parent/reject")
	public ResponseEntity<LeaveRequestDTO> parentReject(@PathVariable Long id) {

		LeaveRequestDTO leave = leaveRequestService.parentReject(id);

		return ResponseEntity.ok(leave);
	}
	// Download all students' leave records as PDF

	@GetMapping(value = "/records/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> downloadAllLeaveRecords() throws DocumentException, IOException {

		List<LeaveRequestDTO> leaves = leaveRequestService.getAllLeaves();

		ByteArrayOutputStream output = new ByteArrayOutputStream();

		Document document = new Document(PageSize.A4.rotate());

		PdfWriter.getInstance(document, output);

		document.open();

		// Fonts
		Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(234, 88, 12));

		Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE);

		Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.BLACK);

		// Title
		Paragraph title = new Paragraph("College Leave Management System", titleFont);
		title.setAlignment(Element.ALIGN_CENTER);
		document.add(title);

		Paragraph subtitle = new Paragraph("All Student Leave Records");
		subtitle.setAlignment(Element.ALIGN_CENTER);
		document.add(subtitle);

		document.add(new Paragraph("Generated on: " + LocalDateTime.now()));

		document.add(new Paragraph("Total records: " + leaves.size()));

		document.add(new Paragraph(" "));

		// Exactly 7 columns
		PdfPTable table = new PdfPTable(new float[] { 1.2f, 1.8f, 1.3f, 1.3f, 2.5f, 1.3f, 1.3f, 1.2f });

		table.setWidthPercentage(100);
		table.setSpacingBefore(10f);
		table.setHeaderRows(1);

		// Table headers
		String[] headers = { "Student ID", "Student Name", "From Date", "To Date", "Reason", "Parent Status",
				"Staff Status", "Status" };

		for (String header : headers) {

			PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));

			cell.setBackgroundColor(new BaseColor(234, 88, 12));

			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
			cell.setPadding(7);

			table.addCell(cell);
		}

		// Table data
		for (LeaveRequestDTO leave : leaves) {

			addPdfCell(table, leave.getRegisterNo(), bodyFont);
			addPdfCell(table, leave.getStudentName(), bodyFont);
			addPdfCell(table, leave.getFromDate(), bodyFont);
			addPdfCell(table, leave.getToDate(), bodyFont);
			addPdfCell(table, leave.getReason(), bodyFont);
			addPdfCell(table, leave.getParentStatus(), bodyFont);
			addPdfCell(table, leave.getStaffStatus(), bodyFont);
			addPdfCell(table, leave.getStatus(), bodyFont);
		}

		document.add(table);

		document.close();

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"CLMS_Leave_Records.pdf\"")
				.contentType(MediaType.APPLICATION_PDF).body(output.toByteArray());
	}

// Helper method
	private void addPdfCell(PdfPTable table, Object value, Font font) {

		PdfPCell cell = new PdfPCell(new Phrase(value == null ? "-" : value.toString(), font));

		cell.setPadding(6);
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

		table.addCell(cell);
	}

	@GetMapping("/{id}/medical-file")
	public ResponseEntity<Resource> downloadMedicalFile(@PathVariable Long id) throws IOException {

		String filePath = leaveRequestService.getMedicalFilePath(id);

		Path path = Paths.get(filePath);

		Resource resource = new FileSystemResource(path);

		String contentType = Files.probeContentType(path);

		if (contentType == null) {
			contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
		}

		return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
				.header(HttpHeaders.CONTENT_DISPOSITION,
						"attachment; filename=\"" + path.getFileName().toString() + "\"")
				.body(resource);
	}
}