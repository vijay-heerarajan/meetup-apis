const mongoose = require("mongoose");

const eventShcema = new mongoose.Schema({
  title: String,
  startTime: String,
  endTime: String,
  image: String,
  type: String,
  hostedBy: String,
  description: String,
  dressCode: String,
  minAge: String,
  tags: [String],
  city: String,
  price: String,
  speakers: [String],
});

const Event = mongoose.model("Event", eventShcema);

module.exports = Event;
