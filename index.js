const express = require("express");
const app = express();

const { initializeDatabase } = require("./db/db.connect");
const Event = require("./models/event.models");

const cors = require("cors");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

initializeDatabase();

async function saveEvent(event) {
  try {
    const eventData = new Event(event);
    await eventData.save();
    return eventData;
  } catch (error) {
    throw error;
  }
}

app.post("/events", async (req, res) => {
  try {
    const event = await saveEvent(req.body);
    return res
      .status(201)
      .json({ message: "Event saved successfully", event: event });
  } catch (error) {
    return res.status(500).json({ error: "Error while saving hotel in DB" });
  }
});

async function getEvents() {
  try {
    const allEvent = await Event.find();
    return allEvent;
  } catch (error) {
    throw error;
  }
}

app.get("/events", async (req, res) => {
  try {
    const events = await getEvents();
    if (events.length <= 0) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.status(200).json(events);
    }
  } catch (error) {
    res.status(500).json({ error: "Error while fetching data from DB" });
  }
});

async function getEventsByTitle(type) {
  try {
    const events = await Event.find({ type: type });
    if (events.length > 0) {
      return events;
    } else {
      console.log(`No Events found with type: ${type}`);
    }
  } catch (error) {
    throw error;
  }
}

app.get("/events/type/:type", async (req, res) => {
  try {
    const events = await getEventsByTitle(req.params.type);
    if (events.length > 0) {
      res.status(200).json(events);
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error while fetching data from DB" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
