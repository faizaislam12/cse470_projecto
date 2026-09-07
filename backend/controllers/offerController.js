const Offer = require("../models/Offer");
const Listing = require("../models/Listing");

exports.createOffer = async (req, res) => {
  try {
    const { listingId, offerPrice, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.status !== "Available") {
      return res.status(400).json({ message: "Listing is no longer active" });
    }

    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot offer on your own listing" });
    }

    const existingOffer = await Offer.findOne({
      listing: listingId,
      collector: req.user._id,
      status: { $in: ["pending", "countered"] },
    });

    if (existingOffer) {
      return res.status(400).json({ message: "You already have an active offer on this listing" });
    }

    const offer = await Offer.create({
      listing: listingId,
      collector: req.user._id,
      offerPrice,
      message,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await offer.populate("collector", "name email phone");
    await offer.populate("listing", "title weight unit price");

    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOffersForListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const offers = await Offer.find({ listing: req.params.listingId })
      .populate("collector", "name email phone role")
      .populate("counterOffers.offeredBy", "name email")
      .sort("-createdAt");

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOffers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { collector: req.user._id };
    if (status) filter.status = status;

    const offers = await Offer.find(filter)
      .populate("listing", "title weight unit price status image owner")
      .populate("listing.owner", "name address")
      .populate("counterOffers.offeredBy", "name email")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Offer.countDocuments(filter);

    res.json({
      offers,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("listing");
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (offer.status !== "pending" && offer.status !== "countered") {
      return res.status(400).json({ message: "Offer cannot be accepted" });
    }

    offer.status = "accepted";
    await offer.save();

    await Listing.findByIdAndUpdate(offer.listing._id, { status: "Pending" });

    await Offer.updateMany(
      { listing: offer.listing._id, _id: { $ne: offer._id }, status: "pending" },
      { status: "rejected" }
    );

    res.json({ message: "Offer accepted", offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("listing");
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    offer.status = "rejected";
    await offer.save();

    res.json({ message: "Offer rejected", offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.withdrawOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.collector.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "countered"].includes(offer.status)) {
      return res.status(400).json({ message: "Cannot withdraw offer" });
    }

    offer.status = "withdrawn";
    await offer.save();

    res.json({ message: "Offer withdrawn" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};