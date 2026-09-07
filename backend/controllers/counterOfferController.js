const Offer = require("../models/Offer");

exports.createCounterOffer = async (req, res) => {
  try {
    const { price, message } = req.body;
    const offer = await Offer.findById(req.params.id).populate("listing");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (!offer.listing) {
      return res.status(400).json({ message: "Associated listing not found" });
    }

    if (offer.listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the listing owner can create counter offers" });
    }

    if (!["pending", "countered"].includes(offer.status)) {
      return res.status(400).json({ message: "Cannot counter this offer" });
    }

    const lastCounter = offer.counterOffers[offer.counterOffers.length - 1];
    if (lastCounter && lastCounter.status === "pending") {
      return res.status(400).json({ message: "A counter offer is already pending" });
    }

    offer.counterOffers.push({
      offeredBy: req.user._id,
      price,
      message,
      status: "pending",
    });

    offer.status = "countered";
    await offer.save();

    await offer.populate("counterOffers.offeredBy", "name email");

    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptCounterOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.collector.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the collector can accept counter offers" });
    }

    const counterIndex = parseInt(req.params.counterIndex);
    if (isNaN(counterIndex) || counterIndex < 0 || counterIndex >= offer.counterOffers.length) {
      return res.status(400).json({ message: "Invalid counter offer index" });
    }

    const counterOffer = offer.counterOffers[counterIndex];

    if (counterOffer.status !== "pending") {
      return res.status(400).json({ message: "Counter offer is not pending" });
    }

    counterOffer.status = "accepted";
    offer.status = "accepted";
    offer.offerPrice = counterOffer.price;

    offer.counterOffers.forEach((co, i) => {
      if (i !== counterIndex) co.status = "rejected";
    });

    await offer.save();

    const Listing = require("../models/Listing");
    await Listing.findByIdAndUpdate(offer.listing, { status: "Pending" });

    await Offer.updateMany(
      { listing: offer.listing, _id: { $ne: offer._id }, status: "pending" },
      { status: "rejected" }
    );

    res.json({ message: "Counter offer accepted", offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectCounterOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.collector.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const counterIndex = parseInt(req.params.counterIndex);
    if (isNaN(counterIndex) || counterIndex < 0 || counterIndex >= offer.counterOffers.length) {
      return res.status(400).json({ message: "Invalid counter offer index" });
    }

    const counterOffer = offer.counterOffers[counterIndex];
    if (counterOffer.status !== "pending") {
      return res.status(400).json({ message: "Counter offer is not pending" });
    }

    counterOffer.status = "rejected";
    offer.status = "pending";
    await offer.save();

    res.json({ message: "Counter offer rejected", offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};