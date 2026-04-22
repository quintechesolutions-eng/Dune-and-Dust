import fs from 'fs';

const regions = [
  'etosha', 'damaraland', 'skeleton_coast', 'swakopmund', 'sossusvlei',
  'fish_river', 'caprivi', 'kalahari', 'namib_rand', 'kunene',
  'waterberg', 'khaudum', 'luderitz'
];

const categories = ['Adventure', 'Wildlife', 'Nature', 'Photography', 'Culture', 'History', 'Relaxation', 'Culinary', 'Astronomy', 'Off-Road'];
const priceLevels = ['free', 'low', 'med', 'high', 'luxury'];
const athleticNeeds = ['low', 'med', 'high', 'extreme'];

const actionVerbs = ['Explore', 'Discover', 'Photograph', 'Trek', 'Hike', 'Drive', 'Navigate', 'Experience', 'Witness', 'Observe', 'Camp', 'Taste', 'Enjoy', 'Marvel at', 'Conquer', 'Track', 'Follow', 'Search for', 'Ride', 'Sandboard', '4x4', 'Kayak', 'Fly over'];
const subjects = ['the dunes', 'wildlife', 'ancient ruins', 'rock art', 'canyons', 'desert elephants', 'rhinos', 'shipwrecks', 'the night sky', 'local cuisine', 'the sunrise', 'the sunset', 'abandoned towns', 'the coastline', 'the river', 'local tribes', 'the flora', 'the silence', 'the landscape', 'hidden gems', 'oysters', 'the foggy coast', 'the salt pans'];
const modifiers = ['at dawn', 'at dusk', 'with a local guide', 'on a 4x4', 'on foot', 'from the air', 'in absolute silence', 'with a sundowner', 'off the beaten path', 'in the deep desert', 'with a luxury picnic', 'on a fat bike', 'on a quad bike', 'in a hot air balloon', 'by boat', 'by kayak', 'in a secluded spot', 'with a photography expert', 'during the golden hour', 'under the Milky Way', 'along the coast'];

let activitiesData = "export const ACTIVITIES_DATA = [\n";

let idCounter = 1;

regions.forEach(region => {
  let uniqueLabels = new Set();
  
  while (uniqueLabels.size < 85) {
    const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    const label = verb + ' ' + subject + ' ' + modifier;
    
    if (!uniqueLabels.has(label)) {
      uniqueLabels.add(label);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const priceLevel = priceLevels[Math.floor(Math.random() * priceLevels.length)];
      const athleticNeed = athleticNeeds[Math.floor(Math.random() * athleticNeeds.length)];
      
      activitiesData += "  { id: 'act_" + (idCounter++) + "', region: '" + region + "', category: '" + category + "', priceLevel: '" + priceLevel + "', athleticNeed: '" + athleticNeed + "', label: '" + label + "' },\n";
    }
  }
});

activitiesData += "];\n";

fs.writeFileSync('./src/activities-data.ts', activitiesData);
console.log('Successfully generated activities-data.ts');
