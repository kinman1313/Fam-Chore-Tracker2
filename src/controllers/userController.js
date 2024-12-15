const User = require('../models/user');
const Family = require('../models/family');
const { APIError } = require('../middleware/error');
const { validateUser } = require('../utils/validation');

exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id)
        .select('-password')
        .populate('familyId');

    res.json({
        success: true,
        data: user
    });
};

exports.updateProfile = async (req, res) => {
    const { name, email, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new APIError('User not found', 404);
    }

    user.name = name;
    if (email) {
        req.body.email = validateUser.email(email);
    }
    if (avatar) user.avatar = avatar;

    await user.save();
    
    res.json({
        success: true,
        data: user
    });
};

exports.getFamilyMembers = async (req, res) => {
    const user = await User.findById(req.user.id);
    const family = await User.find({ familyId: user.familyId })
        .select('-password');

    res.json({
        success: true,
        data: family
    });
};

exports.inviteToFamily = async (req, res) => {
    const { email } = req.body;
    // Add invite logic here
    
    res.json({
        success: true,
        message: 'Invitation sent successfully'
    });
};
