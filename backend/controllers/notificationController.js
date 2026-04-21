const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('actor', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = notifications.filter((item) => !item.isRead).length;

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Notification not found.' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read.',
      data: { notification },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
