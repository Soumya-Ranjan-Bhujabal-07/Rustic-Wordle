/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HintData {
  word: string;
  type: 'SYNONYM' | 'ANTONYM' | 'OPPOSITE' | 'HARD_DEFINITION';
  clue: string;
  details?: string;
}

// Highly customized offline hints database for the game's core nature-themed vocabulary
// Tuned to a balanced "medium level of toughness" - elegant and rewarding, not too trivial and not too academic
const CUSTOM_HINTS_REGISTRY: Record<string, Partial<Record<HintData['type'], string>>> = {
  // 4-letter words
  clay: {
    SYNONYM: "Earth, loam, or moldable terra-cotta.",
    ANTONYM: "Brittle glass, fluid stream, or loose dry sand.",
    OPPOSITE: "Rigid non-malleable solid granite boulders.",
    HARD_DEFINITION: "A natural, fine-grained earthy sediment that is sticky when wet and solidifies permanently when baked or fired."
  },
  moss: {
    SYNONYM: "Green velvet-like carpet, spore mat, or bryophyte.",
    ANTONYM: "Dry desert sand, paved concrete, or bare hot stone.",
    OPPOSITE: "The high leafy branches of forest canopy trees.",
    HARD_DEFINITION: "A small, rootless green plant that grows in soft, dense cushions on damp soil, bark, or rocky surfaces."
  },
  tree: {
    SYNONYM: "Timber, woody perennial, or arbour.",
    ANTONYM: "Tiny herbaceous weed, annual wildflower, or grass sprout.",
    OPPOSITE: "A tiny floating aquatic algae or single microscopic spore.",
    HARD_DEFINITION: "A majestic, tall perennial plant featuring a single main woody trunk that grows skyward with branches and leaves."
  },
  rust: {
    SYNONYM: "Oxidation, corrosion, or reddish-brown flaking.",
    ANTONYM: "Polished chrome, pristine gold, or oxidation barrier.",
    OPPOSITE: "Durable non-reactive platinum or stainless steel.",
    HARD_DEFINITION: "The reddish-brown flaking substance that forms on iron or steel when exposed to moist air."
  },
  wood: {
    SYNONYM: "Timber, xylem, or hard forest fibers.",
    ANTONYM: "Synthetic plastic, iron steel, or liquid sap.",
    OPPOSITE: "Soft ephemeral flower petals or delicate leaves.",
    HARD_DEFINITION: "The hard, fibrous structural tissue beneath the bark of trees, commonly used as lumber or fuel."
  },
  sand: {
    SYNONYM: "Grit, shoreline dust, or small mineral granules.",
    ANTONYM: "Fertile black soil, damp forest compost, or solid bedrock.",
    OPPOSITE: "Lush wet freshwater swamps or deep boggy marshlands.",
    HARD_DEFINITION: "A loose, highly granular substance consisting of tiny worn-down rock particles, common on beaches and deserts."
  },
  bark: {
    SYNONYM: "Trunk cortex, protective outer tree skin, or suberin.",
    ANTONYM: "Inner heartwood, soft core, or internal root xylem.",
    OPPOSITE: "Deep underground root networks.",
    HARD_DEFINITION: "The tough, protective outer layer covering the woody stems and trunks of perennial trees."
  },
  leaf: {
    SYNONYM: "Foliage, blade, or green lamina.",
    ANTONYM: "Bare branch, deciduous trunk, or root anchor.",
    OPPOSITE: "The deep subterranean root tip.",
    HARD_DEFINITION: "A flat, green structure of a plant that grows from a stem or branch and absorbs sunlight for growth."
  },
  fern: {
    SYNONYM: "Pteridophyte, feathery frond, or ancient foliage.",
    ANTONYM: "Flowering garden rose or seed-bearing pine tree.",
    OPPOSITE: "Modern fruit-bearing apple or orange orchards.",
    HARD_DEFINITION: "A flowerless, seedless green plant with delicate, deeply divided feathery fronds that reproduces by spores."
  },
  mist: {
    SYNONYM: "Atmospheric haze, low-hanging cloud, or condensation.",
    ANTONYM: "Bright sunny sky, blazing noon, or clear dry desert air.",
    OPPOSITE: "Torrential cloudburst, heavy rain, or waterfall.",
    HARD_DEFINITION: "A thin cloud of tiny water droplets suspended in the air near the ground, slightly reducing visibility."
  },
  wind: {
    SYNONYM: "Air current, zephyr, or breeze.",
    ANTONYM: "Stagnation, windless calm, or static atmosphere.",
    OPPOSITE: "Solid underground earth or airless vacuum.",
    HARD_DEFINITION: "The natural movement of air flowing horizontally in the atmosphere, driving windmills and rustling leaves."
  },
  pond: {
    SYNONYM: "Still pool, lagoon, or lacustrine mere.",
    ANTONYM: "Rushing mountain river, rapids, or boundless sea.",
    OPPOSITE: "A vast, bone-dry sand dune desert.",
    HARD_DEFINITION: "A small, shallow, still body of water, often filled with lilies and smaller than a lake."
  },
  soil: {
    SYNONYM: "Humus, loam, or fertile earth.",
    ANTONYM: "Sterile concrete, synthetic tiles, or barren glass.",
    OPPOSITE: "Infinite deep blue ocean saltwaters.",
    HARD_DEFINITION: "The rich top layer of the earth's surface in which plants grow, consisting of weathered rock and decayed organic matter."
  },
  lake: {
    SYNONYM: "Basin of water, tarn, or body of inland water.",
    ANTONYM: "Rushing creek, open ocean, or parched rocky mesa.",
    OPPOSITE: "A dry, cracked desert salt flat.",
    HARD_DEFINITION: "A large, deep body of still water surrounded by land, bigger than a pond."
  },
  rock: {
    SYNONYM: "Lithic mass, stone, or mineral boulder.",
    ANTONYM: "Fluid river water, light air vapor, or soft cloud.",
    OPPOSITE: "Extremely soft moss or malleable clay.",
    HARD_DEFINITION: "A hard, solid piece of geological matter forming mountains, cliffs, and pebbles."
  },
  seed: {
    SYNONYM: "Pip, grain, or embryonic ovule.",
    ANTONYM: "Decomposed leaf, barren soil, or fully matured tree.",
    OPPOSITE: "A towering redwood timber giant.",
    HARD_DEFINITION: "The small, hard part of a plant from which a new plant can germinate under proper moisture."
  },
  root: {
    SYNONYM: "Radicle, underground anchor, or taproot.",
    ANTONYM: "Apical leaf bud, canopy foliage, or high blossom.",
    OPPOSITE: "High skyward branches reaching toward the clouds.",
    HARD_DEFINITION: "The underground part of a plant that anchors it securely in the soil while absorbing water and minerals."
  },
  stem: {
    SYNONYM: "Stalk, main support axis, or plant shoot.",
    ANTONYM: "Underground root tips or lateral leaves.",
    OPPOSITE: "Tiny loose seeds drifting freely in the air.",
    HARD_DEFINITION: "The main ascending axial support of a plant, carrying leaves and flowers while moving nutrients."
  },
  dawn: {
    SYNONYM: "Daybreak, sunrise, or morning aurora.",
    ANTONYM: "Dusk, twilight, or midnight.",
    OPPOSITE: "The deep, dark hours of late evening.",
    HARD_DEFINITION: "The first appearance of light in the sky before the sun rises, marking the beginning of the day."
  },
  hill: {
    SYNONYM: "Mound, knoll, or gentle elevation.",
    ANTONYM: "Deep canyon, secluded valley, or gorge.",
    OPPOSITE: "Perfect flat horizontal plains stretching indefinitely.",
    HARD_DEFINITION: "A naturally raised area of land, smaller and more rounded than a steep mountain."
  },
  glen: {
    SYNONYM: "Dingle, narrow valley, or secluded hollow.",
    ANTONYM: "High mountain crest, barren plateau, or tableland.",
    OPPOSITE: "A dry tableland mesa exposed to high winds.",
    HARD_DEFINITION: "A secluded, narrow valley or hollow, often containing a small stream and bordered by quiet woods."
  },
  moor: {
    SYNONYM: "Heath, boggy upland, or peatland.",
    ANTONYM: "Manicured lawn, urban square, or irrigated orchard.",
    OPPOSITE: "A modern concrete highway bypass.",
    HARD_DEFINITION: "A broad expanse of open, wild, uncultivated land, typically covered with heather and damp peaty soil."
  },
  reed: {
    SYNONYM: "Marsh grass, rush, or tall cane stalk.",
    ANTONYM: "Deep forest oak tree or high alpine pine.",
    OPPOSITE: "Prickly desert cactus growing in sand.",
    HARD_DEFINITION: "A tall, hollow-stemmed grass-like plant that grows in dense patches along water margins or wet marshes."
  },
  dune: {
    SYNONYM: "Sand ridge, wind mound, or desert hill.",
    ANTONYM: "Deep ocean trench or flat mud plains.",
    OPPOSITE: "A lush, wet freshwater wetland marsh.",
    HARD_DEFINITION: "A ridge or hill of loose sand piled up and shaped by the wind in deserts or near coastlines."
  },
  grit: {
    SYNONYM: "Fortitude, resolve, or tiny stone particles.",
    ANTONYM: "Fragility, cowardice, or polished smooth glass.",
    OPPOSITE: "Weakness or completely smooth porcelain surfaces.",
    HARD_DEFINITION: "Tiny, abrasive particles of stone or sand, or the steady courage and resolve to persist."
  },
  silt: {
    SYNONYM: "Alluvial mud, fine drift, or river dust.",
    ANTONYM: "Large boulders, coarse gravel, or pristine running water.",
    OPPOSITE: "Rigid, non-shifting bedrock formations.",
    HARD_DEFINITION: "Fine sand, clay, or other soil material carried and deposited by running water as sediment."
  },
  cove: {
    SYNONYM: "Inlet, small bay, or sheltered recess.",
    ANTONYM: "Open tempestuous ocean, cape, or exposed peninsula.",
    OPPOSITE: "A high mountain peak facing strong gales.",
    HARD_DEFINITION: "A small, sheltered inlet or bay on a coast, with a narrow entrance bounded by hills."
  },
  gale: {
    SYNONYM: "High wind, tempest, or heavy blow.",
    ANTONYM: "Gentle breeze, soft zephyr, or perfect calm.",
    OPPOSITE: "A perfectly static, hot summer afternoon in the woods.",
    HARD_DEFINITION: "A very strong, powerful wind, measured on weather scales as stronger than a breeze but weaker than a tempest."
  },
  loam: {
    SYNONYM: "Rich soil, fertile mix, or garden earth.",
    ANTONYM: "Sterile clay, parched sand, or hard concrete.",
    OPPOSITE: "Coarse granite boulders devoid of life.",
    HARD_DEFINITION: "A rich, fertile soil composed of a balanced mix of sand, silt, and clay, ideal for gardening."
  },
  peat: {
    SYNONYM: "Decayed turf, bog compost, or marsh soil.",
    ANTONYM: "Crystalline quartz sand or fresh green grass.",
    OPPOSITE: "Pristine white marble tiles.",
    HARD_DEFINITION: "A dark brown, organic material made of partially decayed moss and plant matter found in marshy bogs."
  },
  twig: {
    SYNONYM: "Slender branchlet, sprig, or shoot.",
    ANTONYM: "Primary trunk, thick root, or major bough.",
    OPPOSITE: "The main structural central timber trunk.",
    HARD_DEFINITION: "A tiny, slender branchlet or sprig at the end of a tree branch, bearing the season's buds."
  },
  vale: {
    SYNONYM: "Valley, dale, or grassy hollow.",
    ANTONYM: "High mountain ridge, summit, or peak.",
    OPPOSITE: "The absolute highest apex of a mountain peak.",
    HARD_DEFINITION: "A poetic word for a valley, representing low-lying grassy land between mountain ridges."
  },
  crop: {
    SYNONYM: "Agricultural harvest, cultivar yield, or produce.",
    ANTONYM: "Wild weeds, untamed wilderness, or barren sand.",
    OPPOSITE: "Noxious invasive weeds ruining the soil.",
    HARD_DEFINITION: "Cultivated plants or agricultural yield grown systematically to be harvested for food or grain."
  },
  tide: {
    SYNONYM: "Oceanic current, current ebb, or regular flow.",
    ANTONYM: "Static puddle, landlocked swamp, or still pool.",
    OPPOSITE: "A totally still indoor pool.",
    HARD_DEFINITION: "The regular rise and fall of the ocean's surface, driven by the gravitational pull of the moon and sun."
  },
  cave: {
    SYNONYM: "Grotto, cavern, or underground void.",
    ANTONYM: "Sky-high mountain peak, open plateau, or tower.",
    OPPOSITE: "An open prairie under the endless blue sky.",
    HARD_DEFINITION: "A natural underground chamber or cavern, typically carved out of limestone or volcanic rock."
  },
  arid: {
    SYNONYM: "Dry, parched, or water-deficient.",
    ANTONYM: "Humid, lush, or rain-drenched rainforest.",
    OPPOSITE: "A soggy, misty rainforest bog.",
    HARD_DEFINITION: "A dry, parched land or climate that receives very little rain, making agricultural growth difficult."
  },
  apex: {
    SYNONYM: "Peak, zenith, or summit.",
    ANTONYM: "Nadir, base, or lowest bottom.",
    OPPOSITE: "The deepest point of a subterranean valley.",
    HARD_DEFINITION: "The absolute highest or culminating point of a triangle, mountain, or structure."
  },
  zeal: {
    SYNONYM: "Enthusiasm, fervor, or intense passion.",
    ANTONYM: "Apathy, indifference, or lethargy.",
    OPPOSITE: "A cold, disinterested shrug of indifference.",
    HARD_DEFINITION: "Great energy, enthusiasm, or devotion in pursuit of a cause, target, or project."
  },
  onyx: {
    SYNONYM: "Banded gemstone, dark silicate, or black gem.",
    ANTONYM: "Soft white chalk or clear glass.",
    OPPOSITE: "Amorphous fragile clay.",
    HARD_DEFINITION: "A semiprecious gemstone characterized by parallel bands of dark and light colors, often pure black."
  },
  keel: {
    SYNONYM: "Hull base, central beam, or ship spine.",
    ANTONYM: "Sails, rigging, or upper deck house.",
    OPPOSITE: "The high flying flags on the mast.",
    HARD_DEFINITION: "The central structural timber or steel beam running along the base of a ship's hull."
  },
  rife: {
    SYNONYM: "Widespread, abundant, or common.",
    ANTONYM: "Scarce, rare, or non-existent.",
    OPPOSITE: "A highly rare and unique single discovery.",
    HARD_DEFINITION: "Something that is widespread, highly active, common, or abundant in a particular area."
  },
  flux: {
    SYNONYM: "Continuous change, flow, or transition.",
    ANTONYM: "Stasis, permanency, or rigid stability.",
    OPPOSITE: "An eternal, completely unchanging stone monument.",
    HARD_DEFINITION: "The state of continuous change, flow, or fluctuation in a physical system or state of mind."
  },
  node: {
    SYNONYM: "Stem joint, branch knot, or junction.",
    ANTONYM: "Smooth stem internode or terminal leaf tip.",
    OPPOSITE: "A straight, uninterrupted open highway.",
    HARD_DEFINITION: "The point on a plant stem from which leaves, buds, or branches emerge."
  },
  dell: {
    SYNONYM: "Wooded hollow, glade, or small valley.",
    ANTONYM: "High rocky mountain ridge or barren plateau.",
    OPPOSITE: "A massive, dry tableland mesa.",
    HARD_DEFINITION: "A small, quiet, wooded valley or hollow, offering a peaceful natural shelter."
  },
  mesa: {
    SYNONYM: "Tableland, flat hill, or plateau.",
    ANTONYM: "Sharp needle peak or deep narrow canyon.",
    OPPOSITE: "An extremely deep, narrow vertical canyon rift.",
    HARD_DEFINITION: "An isolated, flat-topped hill or mountain with steep sides, common in dry southwestern landscapes."
  },
  earth: {
    SYNONYM: "Soil, terra, or our planetary globe.",
    ANTONYM: "Outer space, boundless void, or sky.",
    OPPOSITE: "The cold, empty vacuum of space.",
    HARD_DEFINITION: "The solid ground under our feet, or the fertile soil that supports living plants and trees."
  },
  stone: {
    SYNONYM: "Pebble, rock piece, or cobble.",
    ANTONYM: "Soft cushion, cloud vapor, or running water.",
    OPPOSITE: "Extremely soft, fluffy feathers.",
    HARD_DEFINITION: "A solid piece of rock, smaller than a boulder, representing age-old physical durability."
  },
  river: {
    SYNONYM: "Watercourse, flowing stream, or torrent.",
    ANTONYM: "Arid desert sand, static lake, or stagnant puddle.",
    OPPOSITE: "A bone-dry, parched desert valley.",
    HARD_DEFINITION: "A natural flowing watercourse of freshwater, traveling along a channel toward an ocean or lake."
  },
  grass: {
    SYNONYM: "Lawn cover, turf, or green pasture.",
    ANTONYM: "Bare clay, barren sand, or asphalt highway.",
    OPPOSITE: "A barren gravel road.",
    HARD_DEFINITION: "A green herbaceous plant with narrow leaves growing from the base, forming fields and lawns."
  },
  plant: {
    SYNONYM: "Vegetation, green organism, or flora.",
    ANTONYM: "Animal, fungus, or inanimate stone.",
    OPPOSITE: "An active, running woodland creature.",
    HARD_DEFINITION: "A living organism that absorbs water and inorganic substances through roots, synthesizing nutrients using sunlight."
  },
  bloom: {
    SYNONYM: "Blossom, floral opening, or flowering.",
    ANTONYM: "Withering decay, rot, or dormant seed.",
    OPPOSITE: "A shriveled, dead, brown leaf.",
    HARD_DEFINITION: "The beautiful, colorful opening of a flower, representing a peak state of plant maturation."
  },
  grove: {
    SYNONYM: "Copse, small wood, or cluster of trees.",
    ANTONYM: "Vast boundless prairie or barren desert sand.",
    OPPOSITE: "An endless desert of scorched sand dunes.",
    HARD_DEFINITION: "A small group or cluster of trees growing closely together, often with cleared ground underneath."
  },
  ocean: {
    SYNONYM: "The sea, marine expanse, or deep.",
    ANTONYM: "Arid land, continent, or dry plateau.",
    OPPOSITE: "A parched, waterless desert basin.",
    HARD_DEFINITION: "The vast, continuous body of salt water that covers most of the Earth's surface."
  },
  creek: {
    SYNONYM: "Brook, streamlet, or runnel.",
    ANTONYM: "Boundless ocean, dry canyon, or massive lake.",
    OPPOSITE: "A dry mountain ridge.",
    HARD_DEFINITION: "A small stream or brook of flowing water, narrower and shallower than a river."
  },
  maple: {
    SYNONYM: "Deciduous timber or sugar tree.",
    ANTONYM: "Tropical palm or desert cactus.",
    OPPOSITE: "An arid, spinous desert succulent.",
    HARD_DEFINITION: "A deciduous tree of northern climates, famous for lobed leaves, winged seeds, and sweet syrup."
  },
  cedar: {
    SYNONYM: "Evergreen timber or aromatic conifer.",
    ANTONYM: "Soft fern, delicate moss, or annual weed.",
    OPPOSITE: "A small, annual garden flower.",
    HARD_DEFINITION: "An evergreen coniferous tree with aromatic, rot-resistant wood and needle-like leaves."
  },
  birch: {
    SYNONYM: "Slender timber or paper bark tree.",
    ANTONYM: "Prickly cactus, sea kelp, or dark mahogany.",
    OPPOSITE: "A deep tropical oceanic seaweed.",
    HARD_DEFINITION: "A slender deciduous tree known for its paper-like peeling white bark and flexible twigs."
  },
  cloud: {
    SYNONYM: "Sky vapor, nebula, or mist gatherer.",
    ANTONYM: "Sunny clear blue sky or dry desert wind.",
    OPPOSITE: "A dark subterranean coal mine.",
    HARD_DEFINITION: "A visible gathering of tiny water droplets or ice crystals floating in the sky."
  },
  swamp: {
    SYNONYM: "Bog, waterlogged wetland, or marsh.",
    ANTONYM: "Hyper-dry desert, parched oasis, or paved city street.",
    OPPOSITE: "A baked, cracked clay desert floor.",
    HARD_DEFINITION: "A low-lying wetland area where water collects, dominated by woody trees and thick vegetation."
  },
  plain: {
    SYNONYM: "Prairie, flat grassland, or savanna.",
    ANTONYM: "Jagged mountain range, deep canyon, or dense forest.",
    OPPOSITE: "A highly craggy, steep mountain peak.",
    HARD_DEFINITION: "A large, flat area of land with few trees, often covered with rolling grasses."
  },
  cliff: {
    SYNONYM: "Rocky wall, precipice, or high crag.",
    ANTONYM: "Gentle flat beach, level valley, or plain.",
    OPPOSITE: "A perfectly flat sandy beach.",
    HARD_DEFINITION: "A high, steep, vertical face of rock or clay, typically found along coastlines or mountains."
  },
  mound: {
    SYNONYM: "Earthen pile, barrow, or hillock.",
    ANTONYM: "Canyon rift, deep trench, or dug crater.",
    OPPOSITE: "A deep, dug-out trench or crater.",
    HARD_DEFINITION: "A rounded pile or heap of earth, gravel, or stones, often built artificially."
  },
  field: {
    SYNONYM: "Meadow, grassland, or open pasture.",
    ANTONYM: "Dense urban sprawl, concrete street, or wild jungle.",
    OPPOSITE: "An industrial metropolitan steel city.",
    HARD_DEFINITION: "An open expanse of cleared land, used for pastures, farming, or sports."
  },
  spore: {
    SYNONYM: "Seedlet, reproduction unit, or fungal spark.",
    ANTONYM: "Complex seed, fully-grown flower, or fruit tree.",
    OPPOSITE: "A fully developed apple tree.",
    HARD_DEFINITION: "A tiny, single-celled reproductive unit of ferns, mosses, and fungi, traveling through air."
  },
  thyme: {
    SYNONYM: "Aromatic herb, mint relative, or wild spice.",
    ANTONYM: "Odorless grass, barren clay, or synthetic spice.",
    OPPOSITE: "A sterile, odorless plastic plant.",
    HARD_DEFINITION: "A low-growing aromatic herb of the mint family, highly prized for its fragrant leaves."
  },
  amber: {
    SYNONYM: "Fossilized resin, golden gem, or tree tear.",
    ANTONYM: "Soft fresh clay, wet mud, or charcoal.",
    OPPOSITE: "Fresh wet mud on the forest floor.",
    HARD_DEFINITION: "A translucent, hard golden-yellow fossilized resin produced by ancient evergreen trees."
  }
};

/**
 * Retrieves a hint for a given word.
 * It will cyclically select one of the hint types (SYNONYM, ANTONYM, OPPOSITE, HARD_DEFINITION)
 * so that consecutive levels or retries show different styles of hints.
 * It also includes fallback generation using general linguistic formulas if the word is not in the custom registry.
 */
export function getWordHint(word: string, attemptCount: number = 5): HintData {
  const cleanWord = word.toLowerCase().trim();
  const registeredWordHints = CUSTOM_HINTS_REGISTRY[cleanWord];

  // We want to vary the selected hint type based on the word length or attempt count
  const hintTypes: HintData['type'][] = ['SYNONYM', 'ANTONYM', 'OPPOSITE', 'HARD_DEFINITION'];
  // Use a predictable index based on the word's character codes
  const seed = cleanWord.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selectedType = hintTypes[(seed + attemptCount) % hintTypes.length];

  // Check if we have a registered hint of this type
  if (registeredWordHints && registeredWordHints[selectedType]) {
    return {
      word,
      type: selectedType,
      clue: registeredWordHints[selectedType]!
    };
  }

  // Fallback if the specific type isn't registered, try to find any registered type for this word
  if (registeredWordHints) {
    for (const t of hintTypes) {
      if (registeredWordHints[t]) {
        return {
          word,
          type: t,
          clue: registeredWordHints[t]!
        };
      }
    }
  }

  // Ultimate fallback generation for custom words or date-seeded daily words
  // Generate highly clever, mysterious hints so we never crash and always provide high depth
  switch (selectedType) {
    case 'SYNONYM':
      return {
        word,
        type: 'SYNONYM',
        clue: `A classic vocabulary term of ${word.length} letters, sharing semantic traits with words that describe organic growth, physical textures, or natural phenomena.`
      };
    case 'ANTONYM':
      return {
        word,
        type: 'ANTONYM',
        clue: `Think of synthetic materials, static industrial sprawl, or absolute void - the conceptual opposite of this rustic word.`
      };
    case 'OPPOSITE':
      return {
        word,
        type: 'OPPOSITE',
        clue: `This word represents earthy vitality or structures, whereas its counterpart would be sterile concrete or artificial creations.`
      };
    case 'HARD_DEFINITION':
    default:
      return {
        word,
        type: 'HARD_DEFINITION',
        clue: `A highly specific ${word.length}-letter linguistic component of the natural world, representing a complex biological, geological, or atmospheric state.`
      };
  }
}
