const Resume = require("../models/Resume");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// @desc    Upload a new resume
// @route   POST /api/resumes/upload
// @access  Private (Job Seeker)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "Please upload a file" });
    }

    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res
        .status(400)
        .json({ status: "fail", message: "Please provide a resume title" });
    }

    // Check if user has reached maximum resumes (optional limit)
    const resumeCount = await Resume.countDocuments({ userId: req.user.id });
    if (resumeCount >= 5) {
      fs.unlinkSync(req.file.path); // Delete uploaded file
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Maximum 5 resumes allowed per user",
        });
    }

    // Create resume document
    const resume = new Resume({
      userId: req.user.id,
      title: title.trim(),
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    // If this is the first resume, make it primary
    const existingResumes = await Resume.countDocuments({
      userId: req.user.id,
    });
    if (existingResumes === 0) {
      resume.isPrimary = true;
    }

    await resume.save();

    res.status(201).json({
      status: "success",
      message: "Resume uploaded successfully",
      data: { resume },
    });
  } catch (err) {
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ status: "error", message: err.message });
  }
};

// @desc    Get all resumes for current user
// @route   GET /api/resumes
// @access  Private (Job Seeker)
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({
      isPrimary: -1,
      createdAt: -1,
    });

    res.status(200).json({
      status: "success",
      data: {
        count: resumes.length,
        resumes,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// @desc    Get a single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res
        .status(404)
        .json({ status: "fail", message: "Resume not found" });
    }

    // Check authorization
    if (resume.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          status: "fail",
          message: "Not authorized to access this resume",
        });
    }

    res.status(200).json({
      status: "success",
      data: { resume },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// @desc    Download resume file
// @route   GET /api/resumes/:id/download
// @access  Private
exports.downloadResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res
        .status(404)
        .json({ status: "fail", message: "Resume not found" });
    }

    // Check authorization
    if (resume.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          status: "fail",
          message: "Not authorized to download this resume",
        });
    }

    // Check if file exists
    if (!fs.existsSync(resume.filePath)) {
      return res
        .status(404)
        .json({ status: "fail", message: "Resume file not found on server" });
    }

    // Download the file
    res.download(resume.filePath, resume.fileName);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// @desc    Update resume title
// @route   PATCH /api/resumes/:id
// @access  Private
exports.updateResume = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res
        .status(400)
        .json({ status: "fail", message: "Please provide a resume title" });
    }

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res
        .status(404)
        .json({ status: "fail", message: "Resume not found" });
    }

    // Check authorization
    if (resume.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          status: "fail",
          message: "Not authorized to update this resume",
        });
    }

    resume.title = title.trim();
    await resume.save();

    res.status(200).json({
      status: "success",
      message: "Resume updated successfully",
      data: { resume },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// @desc    Set resume as primary
// @route   PATCH /api/resumes/:id/set-primary
// @access  Private
exports.setPrimaryResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res
        .status(404)
        .json({ status: "fail", message: "Resume not found" });
    }

    // Check authorization
    if (resume.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          status: "fail",
          message: "Not authorized to modify this resume",
        });
    }

    // Remove primary flag from all user's resumes
    await Resume.updateMany({ userId: req.user.id }, { isPrimary: false });

    // Set this resume as primary
    resume.isPrimary = true;
    await resume.save();

    res.status(200).json({
      status: "success",
      message: "Resume set as primary successfully",
      data: { resume },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res
        .status(404)
        .json({ status: "fail", message: "Resume not found" });
    }

    // Check authorization
    if (resume.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          status: "fail",
          message: "Not authorized to delete this resume",
        });
    }

    // Delete file from server
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    // If this was primary resume, set another as primary
    if (resume.isPrimary) {
      const nextResume = await Resume.findOne({ userId: req.user.id }).sort({
        createdAt: -1,
      });
      if (nextResume) {
        nextResume.isPrimary = true;
        await nextResume.save();
      }
    }

    // Delete from database
    await Resume.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Resume deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// @desc    Get primary resume for user
// @route   GET /api/resumes/primary/get
// @access  Private
exports.getPrimaryResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      userId: req.user.id,
      isPrimary: true,
    });

    if (!resume) {
      return res
        .status(404)
        .json({ status: "fail", message: "No primary resume set" });
    }

    res.status(200).json({
      status: "success",
      data: { resume },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
