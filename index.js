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

app.get("/api/events/search", async (req, res) => {
  try {
    // 1. Get query parameters
    const { title, tags } = req.query;

    // 2. Build the query object
    const query = {};
    const orConditions = [];

    // --- Search by Title (Case-Insensitive Partial Match) ---
    if (title) {
      // $regex allows for pattern matching. 'i' makes it case-insensitive.
      // The search looks for the title string *anywhere* in the document's title field.
      orConditions.push({ title: { $regex: title, $options: "i" } });
    }

    // --- Search by Tags (Exact Match in Array) ---
    if (tags) {
      // Split the tags string (e.g., "music,tech") into an array
      const tagArray = tags.split(",").map((tag) => tag.trim());

      // $in finds documents where the 'tags' array contains ANY of the values in tagArray.
      orConditions.push({ tags: { $in: tagArray } });
    }

    // 3. Combine conditions using $or
    if (orConditions.length > 0) {
      // Use $or to find documents that match EITHER the title or the tags (or both)
      query.$or = orConditions;
    } else {
      // If no search parameters are provided, return a bad request error or all events
      return res.status(400).json({
        message:
          "Please provide 'title' or 'tags' query parameters for search.",
      });
    }

    // 4. Execute the query
    const events = await Event.find(query).limit(100); // Limit results for performance

    res.status(200).json(events);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

async function getEventById(id) {
  try {
    const event = await Event.findById(id);
    if (event) {
      return event;
    } else {
      console.log(`No Events found with Id : ${id}`);
    }
  } catch (error) {
    throw error;
  }
}

app.get("/events/id/:id", async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    console.log(req.params.id);
    if (event) {
      res.status(200).json(event);
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
