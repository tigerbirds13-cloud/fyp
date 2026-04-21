const Booking = require("../models/Booking");
const Service = require("../models/Service");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Subscription = require("../models/Subscription");

const hasBookingAccess = async (userId) => {
  const subscription = await Subscription.findOne({ userId }).select(
    "plan status",
  );
  const plan = String(subscription?.plan || "free").toLowerCase();
  const status = String(subscription?.status || "inactive").toLowerCase();
  return status === "active" && (plan === "pro" || plan === "elite");
};

const createNotification = async ({
  recipient,
  actor,
  type,
  title,
  message,
  metadata = {},
}) => {
  if (!recipient) return;
  await Notification.create({
    recipient,
    actor,
    type,
    title,
    message,
    metadata,
  });
};

// POST /api/bookings - Create a booking (seeker only - protected)
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate, location, notes } = req.body;

    if (req.user.role !== "seeker") {
      return res.status(403).json({
        status: "fail",
        message: "Only service seekers can create bookings.",
      });
    }

    // TODO: Re-enable subscription check if needed
    // const bookingAllowed = await hasBookingAccess(req.user.id);
    // if (!bookingAllowed) {
    //   return res.status(403).json({
    //     status: 'fail',
    //     message: 'Booking is available for Pro and Elite plans only. Please upgrade to continue.',
    //   });
    // }

    if (!serviceId || !scheduledDate || !location) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide serviceId, scheduledDate, and location.",
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        status: "fail",
        message: "Service not found.",
      });
    }

    const booking = await Booking.create({
      service: serviceId,
      seeker: req.user.id,
      helper: service.provider,
      scheduledDate,
      location,
      notes,
      totalPrice: service.price,
    });

    await booking.populate("service");
    await booking.populate("seeker", "name email");
    await booking.populate("helper", "name email");

    await createNotification({
      recipient: service.provider,
      actor: req.user.id,
      type: "booking_created",
      title: "New booking request",
      message: `${booking.seeker?.name || "A seeker"} requested ${booking.service?.name || "a service"}.`,
      metadata: { bookingId: booking._id, serviceId: service._id },
    });

    res.status(201).json({
      status: "success",
      message: "Booking created successfully! Waiting for helper acceptance.",
      data: { booking },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /api/bookings - Get all bookings for current user (protected)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ seeker: req.user.id }, { helper: req.user.id }],
    })
      .populate("service")
      .populate("seeker", "name email avatar")
      .populate("helper", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: { bookings },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /api/bookings/:id - Get single booking (protected)
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("service")
      .populate("seeker", "name email avatar contact")
      .populate("helper", "name email avatar contact");

    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found.",
      });
    }

    // Check if user is seeker or helper
    if (
      booking.seeker.toString() !== req.user.id &&
      booking.helper.toString() !== req.user.id
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to view this booking.",
      });
    }

    res.status(200).json({
      status: "success",
      data: { booking },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /api/bookings/:id/helper-profile - Get complete helper profile after acceptance
exports.getAcceptedHelperProfile = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("service", "name price category location")
      .populate(
        "helper",
        "name firstName lastName email phoneNumber roleTitle location skills bio about rating totalJobs avatar website socialLinks",
      )
      .populate("seeker", "name");

    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found.",
      });
    }

    if (booking.seeker?._id?.toString() !== req.user.id) {
      return res.status(403).json({
        status: "fail",
        message:
          "Only the booking seeker can view helper profile details for this booking.",
      });
    }

    if (!["accepted", "confirmed", "completed"].includes(booking.status)) {
      return res.status(403).json({
        status: "fail",
        message:
          "Helper full profile is available only after booking acceptance.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        bookingId: booking._id,
        bookingStatus: booking.status,
        helper: booking.helper,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// PATCH /api/bookings/:id/status - Update booking status (helper only - protected)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !status ||
      ![
        "pending",
        "accepted",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
      ].includes(status)
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Please provide a valid status (pending, accepted, confirmed, completed, cancelled, rejected).",
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found.",
      });
    }

    // Only helper can update status
    if (booking.helper.toString() !== req.user.id) {
      return res.status(403).json({
        status: "fail",
        message: "Only the helper can change the booking status.",
      });
    }

    booking.status = status;
    booking.updatedAt = Date.now();
    await booking.save();

    await booking.populate("service");
    await booking.populate("seeker", "name email");
    await booking.populate("helper", "name email");

    await createNotification({
      recipient: booking.seeker?._id || booking.seeker,
      actor: req.user.id,
      type: "booking_status_updated",
      title: `Booking ${status}`,
      message: `${booking.helper?.name || "Your helper"} marked ${booking.service?.name || "your booking"} as ${status}.`,
      metadata: {
        bookingId: booking._id,
        serviceId: booking.service?._id || booking.service,
      },
    });

    res.status(200).json({
      status: "success",
      message: `Booking ${status} successfully!`,
      data: { booking },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// DELETE /api/bookings/:id - Cancel booking (seeker or helper - protected)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found.",
      });
    }

    // Check if user is seeker or helper
    if (
      booking.seeker.toString() !== req.user.id &&
      booking.helper.toString() !== req.user.id
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to cancel this booking.",
      });
    }

    booking.status = "cancelled";
    booking.updatedAt = Date.now();
    await booking.save();

    const cancelledBySeeker = booking.seeker.toString() === req.user.id;
    const notifyRecipient = cancelledBySeeker ? booking.helper : booking.seeker;

    await createNotification({
      recipient: notifyRecipient,
      actor: req.user.id,
      type: "booking_cancelled",
      title: "Booking cancelled",
      message: `A booking has been cancelled by ${cancelledBySeeker ? "the seeker" : "the helper"}.`,
      metadata: { bookingId: booking._id, serviceId: booking.service },
    });

    res.status(200).json({
      status: "success",
      message: "Booking cancelled successfully!",
      data: { booking },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// PATCH /api/bookings/:id/confirm - Confirm booking (seeker only - protected)
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found.",
      });
    }

    // Only seeker can confirm
    if (booking.seeker.toString() !== req.user.id) {
      return res.status(403).json({
        status: "fail",
        message: "Only the booking seeker can confirm the booking.",
      });
    }

    // Can only confirm if booking is accepted
    if (booking.status !== "accepted") {
      return res.status(400).json({
        status: "fail",
        message:
          "Can only confirm bookings that have been accepted by the helper.",
      });
    }

    booking.status = "confirmed";
    booking.updatedAt = Date.now();
    await booking.save();

    await booking.populate("service");
    await booking.populate("seeker", "name email");
    await booking.populate("helper", "name email");

    await createNotification({
      recipient: booking.helper?._id || booking.helper,
      actor: req.user.id,
      type: "booking_confirmed",
      title: "Booking confirmed",
      message: `${booking.seeker?.name || "The seeker"} has confirmed ${booking.service?.name || "your booking"}.`,
      metadata: {
        bookingId: booking._id,
        serviceId: booking.service?._id || booking.service,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Booking confirmed successfully!",
      data: { booking },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// POST /api/bookings/:id/message - Send message between booking participants
exports.sendBookingMessage = async (req, res) => {
  try {
    const text =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!text) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a message.",
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("service", "name")
      .populate("seeker", "name")
      .populate("helper", "name");

    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found.",
      });
    }

    const isSeeker = booking.seeker?._id?.toString() === req.user.id;
    const isHelper = booking.helper?._id?.toString() === req.user.id;

    if (!isSeeker && !isHelper) {
      return res.status(403).json({
        status: "fail",
        message:
          "You do not have permission to send messages for this booking.",
      });
    }

    if (!["accepted", "confirmed", "completed"].includes(booking.status)) {
      return res.status(400).json({
        status: "fail",
        message: "Messaging is available after booking acceptance.",
      });
    }

    const recipient = isSeeker
      ? booking.helper?._id || booking.helper
      : booking.seeker?._id || booking.seeker;
    const senderName = isSeeker ? booking.seeker?.name : booking.helper?.name;

    await createNotification({
      recipient,
      actor: req.user.id,
      type: "booking_message",
      title: "New booking message",
      message: `${senderName || "A user"}: ${text}`,
      metadata: {
        bookingId: booking._id,
        serviceId: booking.service?._id || booking.service,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Message sent successfully.",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
