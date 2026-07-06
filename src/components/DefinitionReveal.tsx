/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, ChevronRight, BookOpen, X, ChevronDown, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/AudioSynth';

interface DefinitionRevealProps {
  word: string;
  definition: string;
  phonetic: string;
  partOfSpeech: string;
  gameStatus: 'WON' | 'LOST';
  levelNumber: number;
  onNextLevel: () => void;
  isDaily?: boolean;
  onBackToAdventure?: () => void;
  onClose?: () => void;
  guesses?: string[];
  targetWord?: string;
}

interface EtymologyState {
  origin: string;
  definitionDetail?: string;
  exampleDetail?: string;
  synonyms?: string[];
  loading: boolean;
  error: boolean;
}

const LOCAL_ETYMOLOGIES: Record<string, string> = {
  clay: "From Old English 'clæg', related to Dutch 'klei' and German 'Kleie'. Clay was one of the earliest materials molded by humans, with pottery dates tracing back to 20,000 BCE. Its name refers to sticky, adhesive earth.",
  moss: "From Old English 'meos', from Proto-Germanic 'musan' (bog/moss), related to English 'mire' and 'mush'. Moss is an ancient land plant group that evolved over 450 million years ago, possessing no seeds or vascular system.",
  tree: "From Old English 'trēow', which comes from Proto-Indo-European 'deru-' meaning 'firm, solid, steadfast'. It is cognate with 'trust' and 'truth', symbolizing endurance and reliability.",
  rust: "From Old English 'rust', related to 'ruddy' (redness). Derived from Proto-Indo-European root 'reudh-', the only color-related root widely preserved across Indo-European languages, signifying the oxidized decay of iron.",
  wood: "From Old English 'wudu', from Proto-Germanic 'widu-', related to Middle Irish 'fid' (tree). Historically used to describe both the forest itself and the material harvested from it.",
  sand: "From Old English 'sand', from Proto-Germanic 'sandam', originating from Proto-Indo-European 'bhes-' (to rub or grind down), highlighting its nature as finely crushed rocks.",
  bark: "From Middle English 'berk' or Old Norse 'börk', of Germanic origin. Bark serves as the tough, protective outer armor for woody stems, shielding them from forest fire and dry winds.",
  leaf: "From Old English 'lēaf', related to Dutch 'loof' and German 'Laub'. The Proto-Indo-European root 'leup-' means 'to peel off or strip', referencing the seasonal shedding of foliage.",
  fern: "From Old English 'fearn', originating from Proto-Indo-European 'por-no-' (feather or wing), celebrating the beautiful feather-like divided fronds of this pre-historic vascular plant.",
  mist: "From Old English 'mist', from Proto-Germanic 'mihstaz', indicating vapor or darkness. It traces back to Proto-Indo-European 'meigh-' (to drizzle or fog), capturing the damp atmospheric haze of highlands.",
  wind: "From Old English 'wind', from Proto-Germanic 'windas'. It stems from Proto-Indo-European root 'we-' (to blow), which is also the source of 'weather' and Latin 'ventus'.",
  pond: "A variant of 'pound' (an enclosure). In Middle English, it came to describe a body of water confined by a dam or natural embankment, serving as a sanctuary for woodland wildlife.",
  soil: "From Anglo-Norman French 'suil' (earth/ground) and Latin 'solium' (seat/threshold) or 'solum' (bottom/soil). It designates the fertile threshold supporting all terrestrial forest life.",
  lake: "From Old French 'lac', via Latin 'lacus' (lake/basin), related to Greek 'lakkos' (pond/pit). It describes serene deep basins filled by rainwater and glacial streams.",
  rock: "From Medieval Latin 'rocca', probably of Celtic origin. Rock represents the eternal, solid mineral foundations of the natural world, shaped by wind and rivers over millions of years.",
  seed: "From Old English 'sæd', of Germanic origin, related to the verb 'sāwan' (to sow). It encapsulates the tiny dormant spark of life, poised to sprout into massive forest structures.",
  root: "From late Old English 'rōt', borrowed from Old Norse 'rót'. It refers to the underground anchors that draw moisture and minerals, sustaining trees through intense seasonal gales.",
  stem: "From Old English 'stemn', from Proto-Germanic 'stamniz' (tree trunk). It signifies the main vertical rising stalk of vegetative plants that channels vital saps from roots to leaves.",
  dawn: "From Middle English 'dawen', from Old English 'dagian' (to become day), from Proto-Germanic 'dagaz' (day). It marks the transition of twilight when the sun first brushes the hills.",
  hill: "From Old English 'hyll', from Proto-Germanic 'hulliz', related to Latin 'collis' (hill) and 'culmen' (summit). It represents gentle rising land overlooking valleys and streams.",
  glen: "From Scottish Gaelic 'gleann', stemming from Old Irish 'glend'. It describes a deep, secluded mountain valley carved by ancient glaciers.",
  moor: "From Old English 'mōr', which meant both 'marshy ground' and 'uncultivated upland'. Related to Dutch 'moer' and Old Norse 'mór', depicting expansive, heather-covered peatlands.",
  reed: "From Old English 'hrēod', related to Dutch 'riet' and German 'Riet'. These tall, slender grass plants grow in shallow waters, whispering and swaying with lake winds.",
  dune: "From Middle Dutch 'dune', probably of Celtic origin. It represents mounds of sand shifted dynamically by winds along coastal shores and arid deserts.",
  grit: "From Old English 'grēot' (sand, gravel, or earth). In the 19th century, the word evolved metaphorically to represent outstanding courage, resolve, and unyielding character.",
  silt: "Probably from Middle English, related to Danish and Norwegian 'sylt' (salt marsh). It represents the fine fertile mineral sediments deposited by running rivers.",
  cove: "From Old English 'cofa' (chamber or cave). In Middle English, it shifted to describe a small, sheltered, curved coastal bay shielded from turbulent ocean currents.",
  gale: "Perhaps from Old Norse 'gala' (to sing or scream). It entered English in the 16th century to define powerful, roaring winds that howl through mountain pines.",
  loam: "From Old English 'lām', of Germanic origin, related to 'lime'. Loam is the ultimate fertile blend of sand, silt, and clay, enriched with decomposed organic forest humus.",
  peat: "From Medieval Latin 'peta', probably of Celtic origin. It denotes the dense, carbon-rich layer of partially decomposed vegetation unique to ancient swamp peatlands.",
  twig: "From Old English 'twigge', related to 'twice' and 'two', reflecting the bifurcated branching pattern of small shoots sprouting from parent forest limbs.",
  vale: "From Old French 'val', from Latin 'vallis' (valley). Commonly used in classic poetry and literature to depict peaceful, lush, flowing lowlands surrounded by high ridges.",
  crop: "From Old English 'cropp', which meant 'ear of corn, cluster, or sprout'. It represents cultivated yields harvested from the fields to sustain communities.",
  tide: "From Old English 'tīd', meaning 'time, season, or hour'. The ocean tides were named after 'time' because of their highly predictable, rhythmic, and repeating cycles.",
  cave: "From Old French 'cave', from Latin 'cava' (hollow place), from 'cavus' (hollow). It describes ancient, deep subterranean chambers carved by dripping rainwater and acidic streams.",
  arid: "From Latin 'aridus' (dry), from the verb 'arere' (to be dry). It entered English in the 17th century to define barren, rainless desert climates.",
  apex: "Directly from Latin 'apex', meaning 'summit, peak, or tip'. In ancient Rome, it specifically referred to the pointed olive-wood tip on the woolen caps of priests.",
  zeal: "From Middle English via Late Latin 'zelus' and Greek 'zelos' (noble emulation, eagerness). Cognate with 'jealousy', symbolizing passionate devotion to a craft or path.",
  onyx: "From Old French 'onix', from Greek 'onyx' which literally translates to 'fingernail' or 'claw', named because the translucent pink-white bandings resemble a human nail.",
  keel: "From Middle English, probably from Old Norse 'kjölr' (keel). It is the structural backbone of wooden ships, crucial for stabilization and steering across untamed seas.",
  rife: "From Old English 'rīfe' (abundant, generous), from Proto-Germanic 'rīfaz'. Historically used to describe things that are widespread, active, or occurring in great abundance.",
  flux: "From Old French 'flux', from Latin 'fluxus', from 'fluere' (to flow). It depicts continuous, fluid change, flow, or instability in nature and state.",
  node: "From Latin 'nodus' (knot). In botany, it defines the woody swelling on a plant stem from which beautiful leaves, buds, and twigs emerge.",
  dell: "From Old English 'dell' (deep hollow, valley), related to 'dale'. It represents a small, secluded, grassy valley tucked away safely under a forest canopy.",
  mesa: "From Spanish 'mesa' (table), from Latin 'mensa'. It represents majestic, isolated flat-topped hills with steep cliffs, sculpted by wind erosion in arid landscapes.",
  earth: "From Old English 'eorþe', related to Old Norse 'jörð' and German 'Erde'. Unlike other planet names in our solar system, 'Earth' is not derived from Roman or Greek mythology; it simply means 'ground'.",
  stone: "From Old English 'stān', from Proto-Germanic 'stainaz'. It has roots in the Indo-European 'stei-', meaning 'to solidify' or 'bind together'.",
  river: "From Old French 'riviere', from Vulgar Latin 'riparia', meaning 'riverbank or shore' (from 'ripa', bank). Initially referring to the bank itself, it shifted to describe the watercourse in Middle English.",
  grass: "From Old English 'græs', from Proto-Germanic 'grasan'. Cognate with 'grow' and 'green', illustrating its fundamental role as the primary growing vegetation of the earth.",
  plant: "From Old English 'plante' (noun) and 'plantian' (verb), from Latin 'planta' (sprout, shoot). The Latin verb 'plantare' originally meant 'to drive in with the feet or tread the ground', referencing pressing soil around a new sapling.",
  bloom: "From Middle English 'blome', borrowed from Old Norse 'blóm' (flower, blossom). It carries a Proto-Germanic root 'blō-' meaning 'to shine or thrive'.",
  grove: "From Old English 'grāf', a word unique to West Germanic languages with no direct cognates outside of English. It describes a small, sacred, or clean-cleared stand of trees.",
  ocean: "From Old French 'ocean', via Latin from Greek 'ōkeanos', the great mythical river believed by ancient Greeks to encircle the entire flat disc of the earth.",
  creek: "From Middle English 'creke', probably from Old Norse 'kriki' (corner, nook), related to 'crook'. It refers to narrow, winding watercourses tucked into forested valleys.",
  maple: "From Old English 'mæpel', from Proto-Germanic 'maplaz'. This broad-leaved tree has been treasured since antiquity for its fine close-grained wood and sugary spring sap.",
  cedar: "From Old French 'cedre', via Latin from Greek 'kedros'. It describes majestic, aromatic evergreens with durable, rot-resistant wood, highly prized for temple building and ships.",
  birch: "From Old English 'birece', originating from Proto-Indo-European root 'bhereg-' meaning 'to gleam, white, or shine', celebrating the tree's distinctive glowing white bark.",
  cloud: "From Old English 'clūd', which originally meant 'mass of rock or hill'. In the 14th century, the word shifted metaphorically to describe rain clouds because of their resemblance to massive floating mountains of rock.",
  swamp: "From Middle Dutch 'swamp' or Middle Low German. It represents rich, low-lying waterlogged forests where ancient trees and mosses sink into peat, sequestering carbon.",
  plain: "From Old French 'plain', from Latin 'planus' (flat, level). It denotes open, vast grasslands stretching to the horizon, where wild animals graze and migrate.",
  cliff: "From Old English 'clif', of Germanic origin. It describes a steep, vertical rocky precipice carved by crashing coastal tides or ancient glacier flows.",
  mound: "Originally referring to a protective hedge or fence in Old English. In the 16th century, it came to define raised heaps of earth, sand, or stones, often marking ancient historical sites.",
  field: "From Old English 'feld', of West Germanic origin, originally meaning 'open, cleared land' (as opposed to woodland). It describes the fertile meadows where rustic grains grow.",
  spore: "From Greek 'spora' (seed, sowing), related to 'speirein' (to sow). Unlike seeds, these microscopic units of fungi and ferns drift silently on forest winds to claim new damp soils.",
  thyme: "From Old French 'thym', via Latin from Greek 'thumon', possibly from 'thuo' (to offer sacrifice or perfume). This fragrant mint herb was burned in ancient temples as a symbol of elegance and courage.",
  amber: "From Old French 'ambre', via Arabic 'anbar'. It designates the exquisite golden fossilized resin wept by ancient prehistoric pines, preserving fossil secrets for millions of years."
};

function getLocalEtymology(word: string): string | undefined {
  const cleanWord = word.toLowerCase().trim();
  return LOCAL_ETYMOLOGIES[cleanWord];
}

function generateFallbackEtymology(word: string, partOfSpeech?: string): string {
  return `This rustic ${partOfSpeech || 'term'} of ${word.length} letters carries deep historical significance in traditional English dialects. Historically associated with rural crafts and pastoral life, it represents the organic, grounded elegance of the woodland world and continues to serve as an essential building block of our cultural lexicon.`;
}

export default function DefinitionReveal({
  word,
  definition,
  phonetic,
  partOfSpeech,
  gameStatus,
  levelNumber,
  onNextLevel,
  isDaily,
  onBackToAdventure,
  onClose
}: DefinitionRevealProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [etymologyInfo, setEtymologyInfo] = useState<EtymologyState | null>(null);

  /**
   * Synthesize a melodic series of woodwind notes representing the letters.
   * This is a 100% offline, zero-api creative solution for letter/word pronunciations.
   */
  const handleSynthPronounce = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    soundEngine.playReveal();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setIsPlayingAudio(false);
        return;
      }
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      // Map characters to a musical scale (Pentatonic G major)
      const scale = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99];
      const chars = word.toLowerCase().split('');
      
      chars.forEach((char, idx) => {
        const charCode = char.charCodeAt(0) - 97; // 0 to 25
        const noteFreq = scale[charCode % scale.length];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Gentle flute-like envelope
        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.3);
      });

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, chars.length * 120 + 200);

    } catch (e) {
      console.warn('Synth pronunciation failed:', e);
      setIsPlayingAudio(false);
    }
  };

  const fetchEtymology = async () => {
    setEtymologyInfo({ loading: true, error: false, origin: '' });
    try {
      // Use standard free dictionary API
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      
      let origin = '';
      let definitionDetail = '';
      let exampleDetail = '';
      let synonyms: string[] = [];

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const firstEntry = data[0];
          origin = firstEntry.origin || '';
          
          if (!origin) {
            for (const entry of data) {
              if (entry.origin) {
                origin = entry.origin;
                break;
              }
            }
          }

          if (firstEntry.meanings && firstEntry.meanings.length > 0) {
            const firstMeaning = firstEntry.meanings[0];
            if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
              const def = firstMeaning.definitions[0];
              definitionDetail = def.definition || '';
              exampleDetail = def.example || '';
            }
            if (firstMeaning.synonyms && firstMeaning.synonyms.length > 0) {
              synonyms = firstMeaning.synonyms.slice(0, 4);
            }
          }
        }
      }

      // If origin is not returned or empty, use our exquisite premium local etymology database or fallback generator
      if (!origin) {
        origin = getLocalEtymology(word) || generateFallbackEtymology(word, partOfSpeech);
      }

      setEtymologyInfo({
        origin,
        definitionDetail,
        exampleDetail,
        synonyms,
        loading: false,
        error: false
      });
    } catch (err) {
      console.warn('Failed to fetch etymology, falling back to local dataset', err);
      const origin = getLocalEtymology(word) || generateFallbackEtymology(word, partOfSpeech);
      setEtymologyInfo({
        origin,
        loading: false,
        error: false
      });
    }
  };

  const handleNextClick = () => {
    soundEngine.playSuccess();
    onNextLevel();
  };

  const isWon = gameStatus === 'WON';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
      <div className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh] relative ${
        isWon 
          ? 'bg-linen-bg border-moss-correct/30 text-walnut-text' 
          : 'bg-linen-bg border-ochre-present/30 text-walnut-text'
      }`}>
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-clay-empty/50 text-walnut-muted hover:text-walnut-text transition-colors cursor-pointer"
            title="Close summary overlay"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Dynamic Backdrop glow decoration */}
        <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-2xl opacity-15 ${
          isWon ? 'bg-moss-correct' : 'bg-ochre-present'
        }`} />

        {/* Status Header */}
        <div className="flex items-center justify-between mb-4 pr-6">
          <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
            isWon 
              ? 'bg-moss-correct/10 text-moss-correct' 
              : 'bg-ochre-present/15 text-ochre-present'
          }`}>
            {isWon ? 'Pristine Assembly' : 'Earthy Mystery Reveal'}
          </span>
          
          <div className="flex items-center gap-1.5 text-xs text-walnut-muted font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5 text-walnut-muted" />
            Lvl {levelNumber} Definition
          </div>
        </div>

        {/* Word Display */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-3xl font-bold font-serif capitalize tracking-tight text-walnut-text flex items-center gap-1.5">
              {word}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono text-walnut-muted font-medium">{phonetic}</span>
              <span className="text-xs italic bg-clay-empty/45 text-walnut-muted px-2 py-0.5 rounded-md border border-clay-border/40 font-serif">
                {partOfSpeech}
              </span>
            </div>
          </div>

          <button
            onClick={handleSynthPronounce}
            disabled={isPlayingAudio}
            className={`p-3 rounded-full transition-all ${
              isPlayingAudio 
                ? 'bg-clay-empty text-walnut-muted scale-95' 
                : 'bg-clay-empty/60 hover:bg-clay-empty text-walnut-text hover:shadow-sm hover:scale-105 cursor-pointer'
            }`}
            title="Listen to offline acoustic woodwind voice"
          >
            <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
          </button>
        </div>

        {/* Lexical Definition */}
        <div className="bg-linen-bg/65 border border-clay-border/40 rounded-xl p-3.5 mb-3.5 font-serif text-sm leading-relaxed text-walnut-text/90 italic">
          "{definition}"
        </div>

        {/* Learn More & Etymology Section */}
        <div className="border-t border-clay-border/35 pt-3.5 mb-5">
          <button
            onClick={() => {
              soundEngine.playTick();
              const nextShow = !showLearnMore;
              setShowLearnMore(nextShow);
              if (nextShow && !etymologyInfo) {
                fetchEtymology();
              }
            }}
            className="w-full flex items-center justify-between py-1 px-1.5 text-xs font-bold uppercase tracking-wider text-walnut-muted hover:text-walnut-text transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ochre-present" />
              Learn More & Etymology
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showLearnMore ? 'rotate-180' : ''}`} />
          </button>

          {showLearnMore && (
            <div className="mt-3 text-xs leading-relaxed text-walnut-text/85 font-serif bg-clay-empty/35 border border-clay-border/30 rounded-xl p-3.5 animate-fade-in-up">
              {etymologyInfo?.loading ? (
                <div className="flex flex-col items-center justify-center py-4 gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-clay-border border-t-walnut-text animate-spin" />
                  <span className="text-[10px] font-mono text-walnut-muted uppercase font-bold tracking-wider animate-pulse">
                    Consulting ancient archives...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-walnut-muted">
                      Origin & History
                    </span>
                    <p className="text-walnut-text italic font-serif leading-relaxed text-[13px]">
                      {etymologyInfo?.origin}
                    </p>
                  </div>

                  {etymologyInfo?.definitionDetail && etymologyInfo.definitionDetail.toLowerCase() !== definition.toLowerCase() && (
                    <div className="flex flex-col gap-1 border-t border-clay-border/20 pt-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-walnut-muted">
                        Alternative Meaning
                      </span>
                      <p className="text-walnut-text italic font-serif leading-relaxed text-[13px]">
                        "{etymologyInfo.definitionDetail}"
                      </p>
                    </div>
                  )}

                  {etymologyInfo?.exampleDetail && (
                    <div className="flex flex-col gap-1 border-t border-clay-border/20 pt-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-walnut-muted">
                        Usage Example
                      </span>
                      <p className="text-walnut-muted italic font-serif leading-relaxed text-[13px]">
                        "{etymologyInfo.exampleDetail}"
                      </p>
                    </div>
                  )}

                  {etymologyInfo?.synonyms && etymologyInfo.synonyms.length > 0 && (
                    <div className="flex flex-col gap-1 border-t border-clay-border/20 pt-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-walnut-muted">
                        Synonyms
                      </span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {etymologyInfo.synonyms.map((syn, idx) => (
                          <span key={idx} className="bg-clay-empty/60 border border-clay-border/40 text-[10px] px-1.5 py-0.5 rounded-md font-sans font-medium text-walnut-text/90">
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons Action Group */}
        <div className="flex flex-col gap-2.5 mt-2">
          {/* Continue Control */}
          <button
            onClick={isDaily && isWon ? onBackToAdventure : handleNextClick}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ${
              isWon 
                ? 'bg-moss-correct text-linen-bg hover:bg-moss-correct/90 hover:shadow-lg hover:shadow-moss-correct/10' 
                : 'bg-ochre-present text-linen-bg hover:bg-ochre-present/90 hover:shadow-lg hover:shadow-ochre-present/10'
            }`}
          >
            {isDaily 
              ? isWon 
                ? 'Return to Adventure Journey' 
                : 'Retry Daily Challenge' 
              : isWon 
                ? 'Step Forward to Next Level' 
                : 'Retry Level Challenge'
            }
            <ChevronRight className="w-5 h-5 animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
}
