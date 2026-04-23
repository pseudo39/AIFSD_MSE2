const Grievance = require('../models/grievance.model');

const createGrievance = async (req, res) => {
    const { title, description, category } = req.body;

    try {
        const grievance = new Grievance({
            title,
            description,
            category,
            student: req.student.id,
        });

        await grievance.save();
        return res.status(201).json(grievance);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getGrievances = async (req, res) => {
    try {
        const { title } = req.query;
        const query = { student: req.student.id };

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        const grievances = await Grievance.find(query).sort({ createdAt: -1 });
        return res.json(grievances);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getGrievanceById = async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        if (grievance.student.toString() !== req.student.id) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        return res.json(grievance);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateGrievance = async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        if (grievance.student.toString() !== req.student.id) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const updatedGrievance = await Grievance.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        return res.json(updatedGrievance);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteGrievance = async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        if (grievance.student.toString() !== req.student.id) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        await grievance.deleteOne();
        return res.json({ message: 'Grievance deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createGrievance,
    getGrievances,
    getGrievanceById,
    updateGrievance,
    deleteGrievance,
};