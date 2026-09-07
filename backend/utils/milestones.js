// Cumulative-weight thresholds that auto-issue a Digital Recycling Certificate.
const WEIGHT_MILESTONES = [
  { kg: 10, title: 'First Steps', tier: 'Bronze' },
  { kg: 50, title: 'Rising Recycler', tier: 'Bronze' },
  { kg: 100, title: 'Century Club', tier: 'Silver' },
  { kg: 250, title: 'Eco Champion', tier: 'Silver' },
  { kg: 500, title: 'Green Guardian', tier: 'Gold' },
  { kg: 1000, title: 'Planet Protector', tier: 'Platinum' },
];

module.exports = { WEIGHT_MILESTONES };
