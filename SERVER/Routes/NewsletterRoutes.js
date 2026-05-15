const express = require("express");

const { SubscribeNewsletter, GetAllSubscribers, DeleteSubscriber } = require("../Controllers/NewsletterController");

const { Auth } = require("../Middlewares/Auth");

const NewsletterRouter = express.Router();



NewsletterRouter.post("/subscribe", SubscribeNewsletter);

NewsletterRouter.get("/all-subscribers", Auth("admin"), GetAllSubscribers);

NewsletterRouter.delete("/delete-subscriber/:id", Auth("admin"), DeleteSubscriber);



module.exports = NewsletterRouter;