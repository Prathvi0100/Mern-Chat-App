const express = require('express');
const Group = require('../models/GroupModel');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const groupRouter = express.Router();


//Create new group
groupRouter.post('/', protect, isAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const group = await Group.create({
            name,
            description,
            admin: req.user._id,
            members: [req.user._id]
        });
        const populatedGroup = await Group.findById(group._id).populate("admin", 'username email').populate('members', 'username email')
        res.status(201).json({ populatedGroup });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

//get all groups
groupRouter.get('/', protect, async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('admin', 'username email')
            .populate('members', 'username email');
        res.json(groups); 
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

//join group
groupRouter.post("/:groupId/join", protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        console.log(group);
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }
        if (group.members.includes(req.user._id)) {
            return res.status(400).json({
                message: "Already a member of this group"
            });
        }
        group.members.push(req.user._id)
        await group.save()
        res.json({ message: "Successfully joined this group" })
    } catch (error) {
        res.status(400).json({ message: " Something happened" })
    }
});

//leave the group
groupRouter.post("/:groupId/leave", protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }
        if (!group.members.includes(req.user._id)) {
            return res.status(400).json({
                message: "Not a member of this group"
            });
        }
        group.members.pop(req.user._id);
        await group.save()
        res.json({ message: "Successfully left this group" })
    } catch (error) {
        res.status(400).json({ message: error })
    }
});

module.exports = groupRouter;