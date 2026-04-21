const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/reviews - Get reviews relevant to current user (protected)
exports.getMyReviews = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'seeker') {
      filter = { reviewer: req.user.id };
    } else if (req.user.role === 'helper') {
      filter = { helper: req.user.id };
    }

    const reviews = await Review.find(filter)
      .populate('service', 'name')
      .populate('reviewer', 'name avatar')
      .populate('helper', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/reviews - Create a review (seeker only - protected)
exports.createReview = async (req, res) => {
  try {
    const { serviceId, helperId, bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide bookingId, rating, and comment.',
      });
    }

    if (req.user.role !== 'seeker') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only seekers can create reviews.',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rating must be between 1 and 5.',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found.',
      });
    }

    if (booking.seeker.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only review your own completed bookings.',
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'You can rate a helper only after booking is completed.',
      });
    }

    if (
      (serviceId && booking.service.toString() !== serviceId) ||
      (helperId && booking.helper.toString() !== helperId)
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Review data does not match the booking.',
      });
    }

    const existingReview = await Review.findOne({ booking: booking._id, reviewer: req.user.id });
    if (existingReview) {
      return res.status(409).json({
        status: 'fail',
        message: 'You already rated this booking.',
      });
    }

    const review = await Review.create({
      service: booking.service,
      reviewer: req.user.id,
      helper: booking.helper,
      rating,
      comment,
      booking: booking._id,
    });

    const helperIdToUpdate = booking.helper;

    // Update helper's average rating
    const helperReviews = await Review.find({ helper: helperIdToUpdate });
    if (helperReviews.length > 0) {
      const avgRating = (
        helperReviews.reduce((sum, r) => sum + r.rating, 0) / helperReviews.length
      ).toFixed(1);
      await User.findByIdAndUpdate(helperIdToUpdate, { rating: avgRating });
    }

    await Notification.create({
      recipient: helperIdToUpdate,
      actor: req.user.id,
      type: 'review_created',
      title: 'New helper rating',
      message: `You received a ${rating}-star rating for a completed booking.`,
      metadata: {
        bookingId: booking._id,
        serviceId: booking.service,
      },
    });

    await review.populate('service');
    await review.populate('reviewer', 'name avatar');
    await review.populate('helper', 'name avatar');

    res.status(201).json({
      status: 'success',
      message: 'Review created successfully!',
      data: { review },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/reviews/service/:serviceId - Get all reviews for a service
exports.getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('reviewer', 'name avatar')
      .populate('helper', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/reviews/helper/:helperId - Get all reviews for a helper
exports.getHelperReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ helper: req.params.helperId })
      .populate('reviewer', 'name avatar')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/reviews/:id - Get single review (protected)
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('service')
      .populate('reviewer', 'name avatar email')
      .populate('helper', 'name avatar email');

    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'Review not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/reviews/:id - Update review (reviewer only - protected)
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'Review not found.',
      });
    }

    // Only reviewer can update
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only update your own reviews.',
      });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          status: 'fail',
          message: 'Rating must be between 1 and 5.',
        });
      }
      review.rating = rating;
    }

    if (comment) review.comment = comment;

    await review.save();

    // Recalculate helper's average rating
    const helperReviews = await Review.find({ helper: review.helper });
    if (helperReviews.length > 0) {
      const avgRating = (
        helperReviews.reduce((sum, r) => sum + r.rating, 0) / helperReviews.length
      ).toFixed(1);
      await User.findByIdAndUpdate(review.helper, { rating: avgRating });
    }

    await review.populate('service');
    await review.populate('reviewer', 'name avatar');
    await review.populate('helper', 'name avatar');

    res.status(200).json({
      status: 'success',
      message: 'Review updated successfully!',
      data: { review },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/reviews/:id - Delete review (reviewer only - protected)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'Review not found.',
      });
    }

    // Only reviewer can delete
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only delete your own reviews.',
      });
    }

    const helperId = review.helper;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate helper's average rating
    const helperReviews = await Review.find({ helper: helperId });
    if (helperReviews.length > 0) {
      const avgRating = (
        helperReviews.reduce((sum, r) => sum + r.rating, 0) / helperReviews.length
      ).toFixed(1);
      await User.findByIdAndUpdate(helperId, { rating: avgRating });
    } else {
      await User.findByIdAndUpdate(helperId, { rating: 5.0 });
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
