const Newsletter = require("../Models/Newsletter");



async function SubscribeNewsletter(req, res) {

    try {
        let { email } = req.body;
        email = email.toLowerCase();

        let existingSubscriber = await Newsletter.findOne({ email });

        if (existingSubscriber) {

            return res.json({ success: false, message: "Email already subscribed" });

        }

        let newSubscriber = new Newsletter({ email });

        await newSubscriber.save();

        res.json({ success: true, message: "Subscribed successfully", subscriber: newSubscriber });

    } catch (error) {

        res.json({ success: false, message: error.message });

    }
}



async function GetAllSubscribers(req, res) {

    try {

        let subscribers = await Newsletter.find().sort({ createdAt: -1 });

        res.json({ success: true, totalSubscribers: subscribers.length, subscribers });

    } catch (error) {

        res.json({ success: false, message: error.message });

    }
}



async function DeleteSubscriber(req, res) {

    try {

        let { id } = req.params;

        let subscriber = await Newsletter.findById(id);

        if (!subscriber) {
            return res.json({ success: false, message: "Subscriber not found" });
        }

        await Newsletter.findByIdAndDelete(id);

        res.json({ success: true, message: "Subscriber deleted successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

module.exports = { SubscribeNewsletter, GetAllSubscribers, DeleteSubscriber };