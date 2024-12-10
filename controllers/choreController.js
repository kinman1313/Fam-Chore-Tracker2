const Chore = require('../models/Chore');

exports.createChore = async (req, res) => {
  try {
    const { title, description, points, assignedTo, dueDate, recurring, recurringPattern } = req.body;

    const chore = new Chore({
      title,
      description,
      points,
      assignedTo,
      assignedBy: req.user.id,
      familyId: req.user.familyId,
      dueDate,
      recurring,
      recurringPattern
    });

    await chore.save();
    res.status(201).json({ message: 'Chore created successfully', chore });
  } catch (error) {
    res.status(500).json({ message: 'Error creating chore', error: error.message });
  }
};

exports.getChores = async (req, res) => {
  try {
    const chores = await Chore.find({ familyId: req.user.familyId })
      .populate('assignedTo', 'username')
      .populate('assignedBy', 'username');
    res.json(chores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chores', error: error.message });
  }
};

exports.updateChoreStatus = async (req, res) => {
  try {
    const { choreId } = req.params;
    const { status } = req.body;

    const chore = await Chore.findById(choreId);
    if (!chore) {
      return res.status(404).json({ message: 'Chore not found' });
    }

    chore.status = status;
    if (status === 'completed') {
      chore.completedAt = new Date();
    }

    await chore.save();
    res.json({ message: 'Chore status updated', chore });
  } catch (error) {
    res.status(500).json({ message: 'Error updating chore', error: error.message });
  }
}; 