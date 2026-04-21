const Contact = require('../models/Contact');

// POST /api/contact
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email, subject, and message.',
      });
    }

    const contact = await Contact.create({ name, email, subject, message });

    res.status(201).json({
      status: 'success',
      message: 'Your message has been received. We will get back to you soon!',
      data: { contact },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/contact  (admin only — protected)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: { messages },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/contact/:id/read  (admin only — protected)
exports.markAsRead = async (req, res) => {
  try {
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ status: 'fail', message: 'No message found.' });
    }

    res.status(200).json({ status: 'success', data: { message } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
